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
 * Helper class to wrap calls to Sheets API
 */
class SheetsApi {
  constructor(spreadsheetId) {
    /** @type {string} */
    this.spreadsheetId = spreadsheetId;
  }

  /**
   * Writes data to spreadsheet
   *
   * @param {!Array<!Array<string|number|boolean>>} rows Rows
   * @param {string} range Range
   *
   * @return {boolean} True if successful
   */
  write(rows, range) {
    const valueRange = Sheets_v4.newValueRange();
    valueRange.values = rows;

    const options = {
      valueInputOption: "USER_ENTERED",
    };

    try {
      Sheets_v4.Spreadsheets.Values
        .update(valueRange, this.spreadsheetId, range, options);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Fetches data from sheet
   *
   * @param {string} range A1-Range
   *
   * @return {!Array<!Array<!Object>>}
   */
  get(range) {
    return Sheets_v4.Spreadsheets.Values.get(this.spreadsheetId, range);
  }
}