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
 */
function monitorWeatherAndSyncWithDV360() {
  Logger.log('[START] monitorLineItemChangesAndSyncWithDV360');
  // Get items from Sheet
  const data = sheetsApi.get(configSpreadsheetName);
  const rows = data['values'];

  // Configure all wrapper classes
  const auth     = new Auth(config.get('service-account'));
  const dv360    = new DV360(auth.getAuthToken());
  const weather  = new OpenWeather(config.get('open-weather-api-key'));

  // Get config from the spreadsheet
  const sheet = SpreadsheetApp.openById(configSpreadsheetId)
    .getSheetByName(configSpreadsheetName);
  if (!sheet) {
    throw 'Cannot find spreadsheet with the name: ' + configSpreadsheetName;
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    const lineItemId        = parseInt(row[config.get('col-line-item-id')]),
        insertionOrderId    = parseInt(row[config.get('col-insertion-order-id')]),
        advertiserId        = parseInt(row[config.get('col-advertiser-id')]),
        lat                 = row[config.get('col-lat')],
        lon                 = row[config.get('col-lon')],
        tempMin             = row[config.get('col-temp-min')],
        tempMax             = row[config.get('col-temp-max')],
        onlyIfPrecipitation = row[config.get('col-precip')] === 'TRUE',
        windMin             = row[config.get('col-wind-min')];

    // Get current weather conditions
    const currentWeather = weather.getCurrent(lat, lon);

    // Update row with current weather data
    row[config.get('col-temp-curr')] = currentWeather.temp;
    row[config.get('col-precip-curr')] = currentWeather.hasOwnProperty('snow')
      || currentWeather.hasOwnProperty('rain');
    row[config.get('col-wind-curr')] = currentWeather.wind_speed;

    // Initialize all conditions as satisfied
    const satisfiedConditions = {
      tempMin: true,
      tempMax: true,
      precip: true,
      windSpeed: true,
    };

    // Check if min temperature condition is satisfied
    if (tempMin && !isNaN(tempMin)) {
      satisfiedConditions.tempMin = parseFloat(tempMin) <= parseFloat(row[config.get('col-temp-curr')]);
    }

    // Check if max temperature condition is satisfied
    if (tempMax && !isNaN(tempMax)) {
      satisfiedConditions.tempMax = parseFloat(row[config.get('col-temp-curr')]) <= parseFloat(tempMax);
    }

    // Check if precipitation condition is satisfied
    if (onlyIfPrecipitation) {
      satisfiedConditions.precip = row[config.get('col-precip-curr')];
    }

    // Check if wind speed condition is satisfied
    if (windMin && !isNaN(windMin)) {
      satisfiedConditions.windSpeed = parseFloat(row[config.get('col-wind-curr')]) >= parseFloat(windMin);
    }

    // Check if all conditions are satisfied
    const activate = Utils.allObjectPropertiesTrue(satisfiedConditions);

    // Switch Status
    if (lineItemId) {
      dv360.switchLIStatus(advertiserId, lineItemId, activate);
    }
    else if (insertionOrderId) {
      dv360.switchIOStatus(advertiserId, insertionOrderId, activate)
    }

    // Update status in spreadsheet
    row[config.get('col-status')] = activate ? 'Active' : 'Paused';

    // Set last update timestamp
    row[config.get('col-last-update')] = new Date().toISOString();

    // Write back to Sheet
    if (!sheetsApi.write([row], configSpreadsheetName + '!A' + (i + 1))) {
      Logger.log('An error occurred, retrying in 30s');
      Utilities.sleep(30000);

      // Decrement i so that it ends up the same in the next for-loop iteration
      i--;
    }
  }

  Logger.log('[END] monitorWeatherAndSyncWithDV360');
}