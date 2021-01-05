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

/**
 * This class contains all the config variables in one place.
 */
class Config {
  /**
   * Init all the config variables
   *
   */
  constructor() {
    this.config = {
      /** 
       * *Mandatory* configuration param.
       * First you need to get an OpenWeather API key (aka "appid"):
       * https://openweathermap.org/appid
       */
      'open-weather-api-key': '',

      /** 
       * *Optional*, only if you want to use a service account.
       * If you leave this parameter empty, apps script will use
       * an active Google account under which you run the apps script. 
       * For more see: https://cloud.google.com/iam/docs/service-accounts
       */
      'service-account': {},
      
      /**
       * *Optional*, spreadsheet ID.
       * Specify your configuration Spreadsheet ID or use a current Spreadsheet, e.g.:
       * const configSpreadsheetId = "-1GGwYZP34HHejwrO19cK5r108nQr7FaYfg5YJOcw0jnch4";
       * OR
       * const configSpreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
       */
      'spreadsheet-id': '',

      /**
       * *Optional*, sheet (tab) name.
       * Specify your sheet (tab) name with the IOs/LIs IDs,
       * e.g. for testing we use "TEST", for production "PROD".
       * For testing purposes we suggest to use a different DV360 campaign,
       * so you can specify your test IDs in the "TEST" sheet.
       */
      'sheet-name': '',

      // Column mappings
      'col-line-item-id': 0,
      'col-insertion-order-id': 1,
      'col-advertiser-id': 2,
      'col-lat': 3,
      'col-lon': 4,
      'col-temp-min': 5,
      'col-temp-max': 6,
      'col-precip': 7,
      'col-wind-min': 8,
      'col-temp-curr': 9,
      'col-precip-curr': 10,
      'col-wind-curr': 11,
      'col-status': 12,
      'col-last-update': 13
    };
  }

  /**
   * Returns the config variable value by its name
   *
   * @param {string} name Config variable name
   * @return {*} Variable value
   */
  get(name) {
    return this.config.hasOwnProperty(name) ? this.config[name] : null;
  }
}
