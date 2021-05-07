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
 * Main spreadsheet monitoring function.
 * Will check:
 * - If all activation formulas exist (not empty)
 * - If spreadsheet item status is same as DV360 item status
 */
function watchdog() {
    // Register sheet processors
    Strategy.register('IN', config.get('col-formula'), DV360WatchdogStrategy);

    // Get items from Sheet. 
    // See https://developers.google.com/sheets/api/reference/rest/v4/ValueRenderOption
    const rows = sheetsApi.get(configSpreadsheetName, 'UNFORMATTED_VALUE');
    
    // Pre-process sheet headers
    const sheetHeaders = rows[0];
    config.setHeaders(sheetHeaders);
    
    for (let i = 1; i < rows.length; i++) {
        Strategy.process('IN', sheetHeaders, rows[i], config, i);
    }
}