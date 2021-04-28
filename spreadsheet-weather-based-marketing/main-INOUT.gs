function main(onlyInQueue = false) {
    // If the function is triggered by the standard trigger, it receives
    // the trigger info object as a first param.
    if (typeof onlyInQueue !== "boolean") {
        onlyInQueue = false;
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

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
    
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
            !onlyInQueue 
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
        
        if(!onlyInQueue) {
            row[config.getHeaderIndex('col-last-updated')] = currentDateTime
                .toISOString();
        }

        // Save weather conditions back to Sheet
        if (!sheetsApi.write([row], configSpreadsheetName + '!A' + (i + 1))) {
            Logger.log('Error updating Sheet, retrying in 30s');
            Utilities.sleep(30000);
            
            // Decrement `i` so that it ends up the same in the next for-loop iteration
            i--;
    
            continue;
        }

        // Process the activation formula
        const formulaIdx = config.getHeaderIndex('col-formula');
        row[ formulaIdx ] = sheetsApi.forceFormulasEval(i + 1, formulaIdx + 1);

        // Run all OUT processors (e.g. change DV360 status)
        if (! onlyInQueue) {
            Strategy.process('OUT', sheetHeaders, row, config);
        }
        
        Utils.logRowData(row);
    }
}