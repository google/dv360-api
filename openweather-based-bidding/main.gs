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
const configSpreadsheetName = config.get('sheet-name') || "TEST";
const sheetsApi = new SheetsApi(configSpreadsheetId);

/**
 * Checks the weather conditions from the Open Weather API and adjusts the
 * DV360 entities status (e.g. IO switched on/off) with DV360 API.
 * 
 * @param {bool} onlyCheckAPI Set to true if you want to only check the API (no DV360 sync)
 * 
 */
function monitorWeatherAndSyncWithDV360(onlyCheckAPI) {
  Logger.log('[START] monitorLineItemChangesAndSyncWithDV360');

  // If the function is triggered by the standard trigger, it receives
  // the trigger info object as a first param.
  if (typeof onlyCheckAPI !== "boolean") {
    onlyCheckAPI = false;
  }

  // Get items from Sheet
  const rows = sheetsApi.get(configSpreadsheetName);

  // Process sheet headers
  config.setHeaders(rows[0]);
  const apiHeaders = config.getApiHeaders();

  // Configure all wrapper classes
  const auth     = new Auth(config.get('service-account'));
  const dv360    = new DV360(auth.getAuthToken());
  const weather  = new OpenWeather(config.get('open-weather-api-key'));

  sheetsApi.getSheetObject();

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
    if (!onlyCheckAPI && hoursBetweenUpdates && diffHours < hoursBetweenUpdates) {
      Logger.log(`Row #${i} was already processed ${diffHours}h ago, skipping`);
      continue;
    }

    const lineItemId = parseInt(row[config.getHeaderIndex('col-line-item-id')]),
          insertionOrderId = parseInt(
            row[config.getHeaderIndex('col-insertion-order-id')]
          ),
          advertiserId = parseInt(
            row[config.getHeaderIndex('col-advertiser-id')]
          ),
          lat = parseFloat(row[config.getHeaderIndex('col-lat')]),
          lon = parseFloat(row[config.getHeaderIndex('col-lon')]);

    // Get weather conditions
    const allWeather = weather.getCurrentAndPredicted(lat, lon);

    // Extract all weather variables
    for (apiHeader in apiHeaders) {
      row[ apiHeaders[apiHeader] ] = Utils
        .getValueFromJSON(apiHeader, allWeather);
    }

    if (!onlyCheckAPI) {
      row[config.getHeaderIndex('col-last-updated')] = currentDateTime.toISOString();
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
    
    if (!onlyCheckAPI) {
      try {
        // Switch Status according to the activation formula value
        if (!isNaN(lineItemId) && lineItemId > 0) {
          dv360.switchLIStatus(advertiserId, lineItemId, activate);
        } else if (!isNaN(insertionOrderId) && insertionOrderId > 0) {
          dv360.switchIOStatus(advertiserId, insertionOrderId, activate);
        }
      } catch (e) {
        Logger.log('Error updating DV360 API, retrying in 30s');
        Utilities.sleep(30000);
        
        // Decrement `i` so that it ends up the same in the next for-loop iteration
        i--;

        continue;
      }

      // Logging of the successful processing (in CSV format for the further analysis).
      // `[ROW DATA]` is just a label, so the logs can be filtered out by it.
      row[ config.getHeaderIndex('col-formula') ] = activate;
      row.push('[ROW DATA]');
      Logger.log(row.join(','));
    }
  }

  Logger.log('[END] monitorWeatherAndSyncWithDV360');
}

/**
 * Wrapper function to be called from the spreadsheet menu.
 * Triggers the main function but with the boolean param set to true.
 */
function checkWeather() {
  monitorWeatherAndSyncWithDV360(true);
}
