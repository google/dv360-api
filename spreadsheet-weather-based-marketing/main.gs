/**
    Copyright 2020 Google LLC

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        https://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

const config = new Config();
const configSpreadsheetId = config.get('spreadsheet-id')
  || SpreadsheetApp.getActiveSpreadsheet().getId();
const configSpreadsheetName = config.get('sheet-name') 
  || "Triggers";
const sheetsApi = new SheetsApi(configSpreadsheetId);
sheetsApi.getSheetObject();

/**
 * Main entry point for the spreadsheet processing
 * 
 * @param {Array} inQueue Process this array of strategies as "IN" list
 * @param {Array} outQueue Process this array of strategies as "OUT" list
 */
function main(inQueue, outQueue = []) {
    if (!inQueue || !Array.isArray(inQueue)) {
        throw 'ERROR:main: Please specify "inQueue" (should be array).';
    }

    Strategy.registerArray('IN', inQueue);
    Strategy.registerArray('OUT', outQueue);

    // Get all rows from the sheet
    const rows = outQueue
        ? sheetsApi.get(configSpreadsheetName) 
        : sheetsApi.get(configSpreadsheetName, 'UNFORMATTED_VALUE');
    
    // Pre-process sheet headers
    const sheetHeaders = rows[0];
    config.setHeaders(sheetHeaders);
    const apiHeaders = config.getApiHeaders();

    // These formulas should be evaluated only once (on the activation step)
    const excludeEval = [config.getHeaderIndex('col-formula')];

    // Iterate over the sheet data
    for (let i = 1; i < rows.length; i++) {
        // Since we don't evaluate formulas when we read the sheet
        // we need to make sure that `row` contains values not formulas. For the
        // empty outQueue we can ignore this, since in this case we get values.
        let row = outQueue 
            ? sheetsApi.getEvaluated(rows[i], i, excludeEval) 
            : rows[i];

        // Check if we already processed this item
        const currentDateTime = new Date();
        if (
            !onlyInList
            && !Utils.isDateOlderThanNHours(
                currentDateTime, 
                row[ config.getHeaderIndex('col-last-updated') ],
                config.get('hours-between-updates')
            )
        ) {
            Logger.log(
                `Row #${i} was already processed (#hours between updates:`
                    + `${config.get('hours-between-updates')}), skipping`
            );
            continue;
        }

        // Process "IN" queue (e.g. AnyAPI and OpenWeatherAPI).
        const inRow = Strategy.process('IN', sheetHeaders, row, config, i);
        
        // If nothing changed, then don't write back to the sheet
        if (JSON.stringify(inRow) !== JSON.stringify(row)) {
            // Write retrived data back to the spreadsheet.
            sheetsApi.write([row], configSpreadsheetName + '!A' + (i + 1));
        }

        // If out queue is not empty, then evaluate the activation formula
        // and process the out queue
        if (outQueue) {
            // Process the activation formula
            const formulaIdx = config.getHeaderIndex('col-formula');
            row[ formulaIdx ] = sheetsApi.forceFormulasEval(i + 1, formulaIdx + 1);

            // Run all OUT processors (e.g. change DV360 status)
            Strategy.process('OUT', sheetHeaders, row, config);
        }
        
        Utils.logRowData(row);
    }
}

/**
 * Will monitor the weather (and "any api") and sync the LI/IO status with 
 * DV360 accordingly.
 */
function monitorWeatherAndSyncWithDV360(onlyInQueue = false) {
    if ('boolean' === typeof onlyInQueue) {
        onlyInQueue = false;
    }

    // Register sheet processors
    const inQueue = [
        {[config.get('col-lat')]: OpenWeatherAPIStrategy},
        {[config.get('col-api-url')]: INAnyAPIStrategy},
    ];

    if (! onlyInQueue) {
        const outQueue = [{[config.get('col-advertiser-id')]: DV360APIStrategy}];
    }

    return main(inQueue, outQueue);
}

/**
 * Will monitor the weather (and "any api"). It will NOT sync with the DV360!
 */
function checkWeather() {
    return monitorWeatherAndSyncWithDV360(true);
}

/**
 * Added to support naming convension. Will monitor "any api" (and the weather) 
 * and sync the LI/IO status with DV360 accordingly.
 */
function monitorAnyApiAndSyncWithDV360() {
    return monitorWeatherAndSyncWithDV360();
}