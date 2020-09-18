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
      // *Mandatory*
      'open-weather-api-key': '',

      // *Optional*, only if you want to use a service account
      // see https://cloud.google.com/iam/docs/service-accounts
      'service-account': {},
      
      /*
       * *Optional* spreadsheet ID.
       * Specify your configuration Spreadsheet ID or use a current Spreadsheet, e.g.:
       * const configSpreadsheetId = "-1GGwYZP34HHejwrO19cK5r108nQr7FaYfg5YJOcw0jnch4";
       * OR
       * const configSpreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
       */
      'spreadsheet-id': '',

      /*
       * *Optional* sheet (tab) name.
       * Specify your sheet (tab) name with the IOs/LIs IDs,
       * e.g. for testing we use "TEST", for production "PROD".
       * For testing purposes we suggest to use a different DV360 campaign,
       * so you can specify your test IDs in the "TEST" sheet.
       */
      'sheet-name': '',
    };
  }

  /**
   * Returns the config variable value by it's name
   *
   * @param {string} name Config variable name
   * @return {*} Variable value
   */
  get(name) {
    return this.config.hasOwnProperty(name) ? this.config[name] : null;
  }
}
