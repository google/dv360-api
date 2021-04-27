function main(onlyInQueue = false) {
    // If the function is triggered by the standard trigger, it receives
    // the trigger info object as a first param.
    if (typeof onlyInQueue !== "boolean") {
        onlyInQueue = false;
    }

    // Register sheet processors
    Strategy.register('IN', config.get('col-api-url'), INAnyAPI);
    //Strategy.register('IN', config.get('col-lat'), OpenWeatherAPI);
    //Strategy.register('OUT', config.get('col-advertiser-id'), DV360API);

    sheetsApi.getSheetObject();

    // Get items from Sheet
    const rows = sheetsApi.get(configSpreadsheetName);
    
    // Pre-process sheet headers
    const sheetHeaders = rows[0];
    config.setHeaders(sheetHeaders);
    const apiHeaders = config.getApiHeaders();

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const iPlus1 = i + 1;
    
        // Check if we already processed this item
        const currentDateTime = new Date();
        const lastUpdated = new Date(
          row[ config.getHeaderIndex('col-last-updated') ]
        );
        
        const diffHours = (currentDateTime - lastUpdated) / 1000 / 60 / 60;
        const hoursBetweenUpdates = parseInt(config.get('hours-between-updates'));
        if (!onlyInQueue && hoursBetweenUpdates && diffHours < hoursBetweenUpdates) {
          Logger.log(`Row #${i} was already processed ${diffHours}h ago, skipping`);
          continue;
        }

        // Run all IN processors (e.g. AnyAPI and OpenWeatherAPI)
        const InJson = Strategy.process('IN', sheetHeaders, row, config);
        for (apiHeader in apiHeaders) {
            row[ apiHeaders[apiHeader] ] = Utils
                .getValueFromJSON(apiHeader, InJson);
        }
        
        if(!onlyInQueue) {
            row[config.getHeaderIndex('col-last-updated')] = currentDateTime
                .toISOString();
        }

        // Save weather conditions back to Sheet
        if (!sheetsApi.write([row], configSpreadsheetName + '!A' + iPlus1)) {
            Logger.log('Error updating Sheet, retrying in 30s');
            Utilities.sleep(30000);
            
            // Decrement `i` so that it ends up the same in the next for-loop iteration
            i--;
    
            continue;
        }

        // Process activation formula
        const formulaIdx = config.getHeaderIndex('col-formula') + 1;
        sheetsApi.forceFormulasEval(iPlus1, formulaIdx);
        const activate = sheetsApi.getCellValue(iPlus1, formulaIdx);
        row[ config.getHeaderIndex('col-formula') ] = activate;
/*
        // Run all OUT processors (e.g. change DV360 status)
        Strategy.process('OUT', sheetHeaders, row, config);
*/        
        // Logging of the successful processing (in CSV format for the further analysis).
        // `[ROW DATA]` is just a label, so the logs can be filtered out by it.
        row.push('[ROW DATA]');
        Logger.log(row.join(','));
    }
}