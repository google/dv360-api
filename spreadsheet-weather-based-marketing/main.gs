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

/**
 * Main entry point for the spreadsheet processing
 * 
 * @param {bool} onlyInList If true, process only "IN" list in the Strategy
 */
function main(onlyInList = false) {
    // If the function is triggered by the standard trigger, it receives
    // the trigger info object as a first param.
    if (typeof onlyInList !== "boolean") {
        onlyInList = false;
    }

    // Register sheet processors
    Strategy.register('IN', config.get('col-api-url'), INAnyAPIStrategy);
    Strategy.register('IN', config.get('col-lat'), OpenWeatherAPIStrategy);
    Strategy.register('OUT', config.get('col-advertiser-id'), DV360APIStrategy);

    sheetsApi.getSheetObject();

    // Get items from Sheet
    const rows = sheetsApi.get(configSpreadsheetName);
    
    // Pre-process sheet headers
    const sheetHeaders = rows[0];
    config.setHeaders(sheetHeaders);
    const apiHeaders = config.getApiHeaders();

    // These formulas should be evaluated only once (on the activation step)
    const excludeEval = [config.getHeaderIndex('col-formula')];

    for (let i = 1; i < rows.length; i++) {
        const row = sheetsApi.getEvaluated(rows[i], i, excludeEval);

        // Check if we already processed this item
        const currentDateTime = new Date();
        const lastUpdated = new Date(
            row[ config.getHeaderIndex('col-last-updated') ]
        );
        
        const diffHours = (currentDateTime - lastUpdated) / 1000 / 60 / 60;
        const hoursBetweenUpdates = parseInt(config.get('hours-between-updates'));
        // We take into account the fact that hourly Time-Driven Triggers
        // might run with a little time diff ("-0.17" hours should cover this diff)
        if (
            !onlyInList 
            && hoursBetweenUpdates 
            && diffHours < (hoursBetweenUpdates - 0.17)
        ) {
            Logger.log(
                `Row #${i} was already processed ${diffHours}h ago `
                + `(hours between updates:${hoursBetweenUpdates}), skipping`
            );
            continue;
        }

        // Get the JSON from the "IN" processors (e.g. AnyAPI and OpenWeatherAPI)
        const InJson = Strategy.process('IN', sheetHeaders, row, config);
        if (! InJson) {
            continue;
        }

        for (apiHeader in apiHeaders) {
            row[ apiHeaders[apiHeader] ] = Utils
                .getValueFromJSON(apiHeader, InJson);
        }
        
        if(!onlyInList) {
            row[config.getHeaderIndex('col-last-updated')] = currentDateTime
                .toISOString();
        }

        // Save weather conditions back to Sheet
        if (!sheetsApi.write([row], configSpreadsheetName + '!A' + (i + 1))) {
            Logger.log('Error updating Sheet, retrying in 5s');
            Utilities.sleep(5000);
            
            // Decrement `i` so that it ends up the same in the next for-loop iteration
            i--;
    
            continue;
        }

        // Process the activation formula
        const formulaIdx = config.getHeaderIndex('col-formula');
        row[ formulaIdx ] = sheetsApi.forceFormulasEval(i + 1, formulaIdx + 1);

        // Run all OUT processors (e.g. change DV360 status)
        if (! onlyInList) {
            Strategy.process('OUT', sheetHeaders, row, config);
        }
        
        Utils.logRowData(row);
    }
}