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
       * *Optional*, Imperial VS. Metric units.
       * Possible values: "standard" (default, if empty), "metric" and "imperial"
       */
      'open-weather-api-units': 'metric',

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
      'col-api-url':            'Api URL',
      'col-api-headers':        'Api Headers',

      // Spreadsheet headers
      'headers': [],

      /**
       * *Optional*
       * How often do you want to check and update?
       * If set to 0, checks and updates will run
       * each time the script is triggered.
       * You can use this feature when running into issues
       * with execution limits.
       */
      'hours-between-updates': 0,
    };
  }

  /**
   * Set headers array for further processing
   *
   * @param headers Headers array
   */
  setHeaders(headers) {
    this.config.headers = [...headers];
  }

  /**
   * Returns the index of the header entity
   * 
   * @param {string} name Header notation (from `this.config`) we are looking for.
   * @param {*} defaultValue Default value if the entry is not found.
   * @return {integer} Index, if not exists then -1.
   */
  getHeaderIndex(name, defaultValue) {
    const idx = this.config.headers.indexOf(this.config[name]);
    if (-1 === idx) {
      if ('undefined' === typeof defaultValue) {
        throw `ERROR: Column '${name}' not found.`;
      }

      return defaultValue;
    }

    return idx;
  }

  /**
   * Get headers that start with a specified prefix
   *
   * @param {string} prefix Prefix
   * @returns {Object} List of the headers in the format {'<header wo/prefix>': <column number>}
   */
  getHeadersWithPrefix(prefix) {
    let i = 0;
    const output = {};
    for (const header of this.config.headers) {
      if (header.startsWith(prefix)) {
        output[ header.substring(prefix.length) ] = i;
      }

      i++;
    }

    return output;
  }

  /**
   * Get api related headers (those which are in the form "api:<entity1>.<entity2>")
   *
   * @returns {Object} List of the api related headers in the format {'<entity1>.<entity2>': <column number>}
   */
  getApiHeaders() {
    return this.getHeadersWithPrefix('api:');
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