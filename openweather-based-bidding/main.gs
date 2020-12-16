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

const config   = new Config();
const configSpreadsheetId = config.get('spreadsheet-id')
  || SpreadsheetApp.getActiveSpreadsheet().getId();
const configSpreadsheetName = config.get('sheet-name')
  || "TEST";

/**
 * Checks the weather conditions from the Open Weather API and adjusts the
 * DV360 entities status (e.g. IO switched on/off) with DV360 API.
 */
function monitorWeatherAndSyncWithDV360() {
  Logger.log('[START] monitorLineItemChangesAndSyncWithDV360');

  // Configure all wrapper classes
  const auth     = new Auth(config.get('service-account'));
  const dv360    = new DV360(auth.getAuthToken());
  const weather  = new OpenWeather(config.get('open-weather-api-key'));

  // Get config from the spreadsheet
  const sheet = SpreadsheetApp.openById(configSpreadsheetId)
    .getSheetByName(configSpreadsheetName);
  if (! sheet) {
    throw 'Cannot find spreadsheet with the name: ' + configSpreadsheetName;
  }

  // Filter out empty rows, since we took all rows from the specified range
  const configFromSpreadsheet = sheet.getRange('A:I').getValues()
    .filter((a) => a[0] || a[1]);

  for (let i = 1; i < configFromSpreadsheet.length; i++) {
    const lineItemId        = parseInt(configFromSpreadsheet[i][0]),
        insertionOrderId    = parseInt(configFromSpreadsheet[i][1]),
        advertiserId        = parseInt(configFromSpreadsheet[i][2]),
        lat                 = configFromSpreadsheet[i][3],
        lon                 = configFromSpreadsheet[i][4],
        tempMin             = configFromSpreadsheet[i][5],
        tempMax             = configFromSpreadsheet[i][6],
        onlyIfRainingOrSnow = configFromSpreadsheet[i][7],
        windMin             = configFromSpreadsheet[i][8];

    const currentWeather = weather.getCurrent(lat, lon);

    const currentTemperature        = currentWeather.temp;
    const currentRainSnowCondition  = currentWeather.hasOwnProperty('snow')
      || currentWeather.hasOwnProperty('rain');
    const currentWindspeed          = currentWeather.wind_speed;

    // Check if min temperature condition is satisfied
    let tempConditionSatisfied = true;
    if (tempMin || tempMin !== '') {
      tempConditionSatisfied = (tempMin <= currentTemperature);
    }

    // Check if max temperature condition is satisfied
    if (tempMax || tempMax !== '') {
      tempConditionSatisfied = tempConditionSatisfied
        && (currentTemperature <= tempMax);
    }

    // Check if rain/snow condition is satisfied
    let rainSnowConditionSatisfied = true;
    if (onlyIfRainingOrSnow) {
      rainSnowConditionSatisfied = currentRainSnowCondition;
    }

    // Check if wind speed condition is satisfied
    let windConditionSatisfied = true;
    if (windMin) {
      windConditionSatisfied = (currentWindspeed >= windMin);
    }

    // Check if all conditions are satisfied
    const activate = (rainSnowConditionSatisfied) && tempConditionSatisfied && windConditionSatisfied;

    // Log status to debug panel
    Logger.log(
      `+ Updating: IO:${insertionOrderId}, LI:${lineItemId}, Active:${activate}, `
      + `Min.:${tempMin}, Max.:${tempMax}, Curr. Temp.:${currentTemperature} `
      + `Curr. Rain/Snow:${currentRainSnowCondition}`
    );

    /*
     * This does the API request to change the LI status.
     * If you wish to change the IO status instead just change to:
     * dv360.switchIOStatus(advertiserId, insertionOrderId, activate)
     */
    dv360.switchLIStatus(advertiserId, lineItemId, activate);

    // Log the status to the spreadsheet
    const row = i + 1;
    sheet.getRange( 'J' + row ).setValue( currentTemperature );
    sheet.getRange( 'K' + row ).setValue( currentRainSnowCondition );
    sheet.getRange( 'L' + row ).setValue( currentWindspeed );
    sheet.getRange( 'M' + row ).setValue( activate ? 'Active' : 'Paused' );
    sheet.getRange( 'N' + row ).setValue( new Date().toISOString() );
  }

  Logger.log('[END] monitorWeatherAndSyncWithDV360');
}
