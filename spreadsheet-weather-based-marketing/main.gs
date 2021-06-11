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

// Init configuration handling
const config = new Config();

// Init globally used variables
const configSpreadsheetId = config.get('spreadsheet-id')
    || SpreadsheetApp.getActiveSpreadsheet().getId();
const configSpreadsheetName = config.get('sheet-name')
    || "Triggers";

/**
 * Main entry point for the spreadsheet processing.
 * 
 * @param {Array} inQueue Process this array of strategies as "IN" list.
 * @param {Array} outQueue Process this array of strategies as "OUT" list.
 */
function main(inQueue, outQueue = []) {
    if (
        (!inQueue || !Array.isArray(inQueue) || !inQueue.length)
        && (!outQueue || !Array.isArray(outQueue) || !outQueue.length)
    ) {
        throw 'ERROR:main: Please specify "inQueue" or "outQueue"'
            + ' (should be at least one non empty array).';
    }

    const sheetsApi = new SheetsApi(configSpreadsheetId);
    sheetsApi.getSheetObject();

    Strategy.registerArray('IN', inQueue);
    if (outQueue && outQueue.length) {
        Strategy.registerArray('OUT', outQueue);
    }

    // Get all rows from the sheet.
    // If `outQueue` is not empty, we don't evaluate formulas when we read the sheet.
    const rows = sheetsApi.get(configSpreadsheetName);

    // Pre-process sheet headers
    const sheetHeaders = rows[0];
    config.setHeaders(sheetHeaders);

    // These formulas should be evaluated only once (on the activation step)
    const excludeEval = [config.getHeaderIndex('col-formula')];

    // Find the "activation formula" index
    const formulaIdx = config.getHeaderIndex('col-formula');

    // Iterate over the sheet data
    for (let i = 1; i < rows.length; i++) {
        Logger.log(`LOG:main: Processing row #${i+1}`);

        // We need to make sure that `row` contains the values, not formulas.
        let row = sheetsApi.getEvaluated(rows[i], i, excludeEval);

        if (inQueue && inQueue.length) {
            // Process "IN" queue (e.g. AnyAPI and OpenWeatherAPI).
            let newRow = Strategy.process('IN', sheetHeaders, row, config, i);
    
            // If nothing changed, then don't write back to the sheet
            if (JSON.stringify(newRow) !== JSON.stringify(row)) {
                sheetsApi.write(
                    [newRow],
                    configSpreadsheetName + '!A' + (i + 1),
                    !(outQueue && outQueue.length)
                );
    
                row = [...newRow];
            }
        }

        // If out queue is not empty, then evaluate the activation formula
        // and process the out queue.
        if (outQueue && outQueue.length) {
            const formulaValue = row[formulaIdx];
            row[formulaIdx] = sheetsApi.forceFormulasEval(i + 1, formulaIdx + 1);

            // Run all OUT processors (e.g. change DV360 status)
            newRow = Strategy.process('OUT', sheetHeaders, row, config, i);
            newRow[formulaIdx] = formulaValue;

            // If nothing changed, then don't write back to the sheet
            if (JSON.stringify(newRow) !== JSON.stringify(row)) {
                sheetsApi.write(
                    [newRow],
                    configSpreadsheetName + '!A' + (i + 1),
                    true
                );

                row = newRow;
            }
        }

        Utils.logRowData(row);
    }

    // Save all cached write requests
    SpreadsheetApp.flush();

    // Check if there are errors to report
    const msgs = Strategy.getErrorMessages();
    if (msgs) {
        throw msgs;
    }
}

/**
 * Will monitor the weather and sync the LI/IO status with DV360 accordingly.
 * 
 * @param {bool|*} onlyInQueue If true, then no "out queue" will be processed.  
 */
function monitorWeatherAndSyncWithDV360(onlyInQueue = false) {
    if ('boolean' !== typeof onlyInQueue) {
        onlyInQueue = false;
    }

    // Register sheet processors
    const inQueue = [
        { [config.get('col-lat')]: OpenWeatherAPIStrategy },
    ];

    const outQueue = onlyInQueue
        ? []
        : [{ [config.get('col-advertiser-id')]: DV360APIStrategy }];

    return main(inQueue, outQueue);
}

/**
 * Will check the weather. It will NOT sync with the DV360!
 */
function checkWeather() {
    return monitorWeatherAndSyncWithDV360(true);
}

/**
 * Will check the "any api". It will NOT sync with the DV360!
 */
function checkApi() {
    return monitorAnyApiAndSyncWithDV360(true);
}

/**
 * Will monitor "any api" and sync the LI/IO status with DV360 accordingly.
 * 
 * @param {bool|*} onlyInQueue If true, then no "out queue" will be processed.  
 */
function monitorAnyApiAndSyncWithDV360(onlyInQueue = false) {
    if ('boolean' !== typeof onlyInQueue) {
        onlyInQueue = false;
    }

    // Register sheet processors
    const inQueue = [
        { [config.get('col-api-url')]: INAnyAPIStrategy },
    ];

    const outQueue = onlyInQueue
        ? []
        : [{ [config.get('col-advertiser-id')]: DV360APIStrategy }];

    return main(inQueue, outQueue);
}

/**
 * Only sync wth DV360.
 */
function syncWithDV360() {
    return main(
        [], 
        [{ [config.get('col-advertiser-id')]: DV360APIStrategy }]
    );
}

/**
 * Check if the spreadsheet is compliant.
 */
function watchdog() {
    return main(
        [ { [config.get('col-formula')]: FormulaWatchdogStrategy }, ],
        [ { [config.get('col-advertiser-id')]: DV360WatchdogStrategy }, ]
    );
}