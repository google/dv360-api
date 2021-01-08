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
      'col-line-item-id':       'Line Item Id',
      'col-insertion-order-id': 'Insertion Order Id',
      'col-advertiser-id':      'Advertiser ID',
      'col-lat':                'Latitude',
      'col-lon':                'Longitude',
      'col-formula':            'Activation Formula',
      'col-last-updated':       'Last Updated',

      // Spreadsheet headers
      'headers': [],
    };
  }

  /**
   * Set headers array for further processing
   *
   * @param headers Headers array
   */
  setHeaders(headers) {
    this.config.headers = headers;
  }

  /**
   * Returns the index of the header entity
   * 
   * @param idx Header notation (from `this.config`) we are looking for
   * @return {integer} Index, if not exists then -1.
   */
  getHeaderIndex(idx, plusOne) {
    idx = this.config.headers.indexOf(this.config[idx]);
    return plusOne ? 1+idx : idx;
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

// For tests
if (typeof module !== 'undefined') {
  module.exports = Config;
}