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
 * Helper class to wrap calls to Sheets API.
 * Sheets API Read/Write usually works faster then reading and writing from/to
 * spreadsheet directly.
 */
class SheetsApi {
  constructor(spreadsheetId) {
    /** @type {string} */
    this.spreadsheetId = spreadsheetId;

    /** @type {null|Object} */
    this.sheetObj = null;

    /** @type {string} */
    this.defaultMode = 'FORMULA';
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
      SpreadsheetApp.flush();

      return true;
    } catch (e) {
      Logger.log(e);
      return false;
    }
  }

  /**
   * Fetches data from sheet
   *
   * @param {string} range A1-Range
   * @param {string|bool} renderMode Render mode, [more info](https://developers.google.com/sheets/api/reference/rest/v4/ValueRenderOption)
   *
   * @return {!Array<!Array<!Object>>}
   */
  get(range, renderModeString = false) {
    if (! this.spreadsheetId) {
      this.getSheetObject();
    }

    return Sheets_v4.Spreadsheets.Values.get(
        this.spreadsheetId,
        range,
        {
          'valueRenderOption': renderModeString || this.defaultMode,
        }
      )['values'];
  }

  /**
   * Fetches data from one cell from the sheet
   *
   * @param {string} row Row number
   * @param {string} col Column number
   *
   * @return {Object}
   */
  getCellValue(row, col) {
    if (!this.sheetObj) {
      this.getSheetObject();
    }

    return this.sheetObj.getRange(row, col).getValues()[0][0];
  }

  /**
   * Get values for the formulas in the row
   *
   * @param {Array} row Data from the sheet
   * @param {integer} rowNum Row number in the sheet
   * @param {Array} excludeIdx Do not evaluate these array elements
   * @returns {Array} Evaluated data
   */
  getEvaluated(row, rowNum, excludeIdx) {
    for (let i=0; i<row.length; i++) {
      if (
        excludeIdx.indexOf(i) < 0
        && 'string' == typeof row[i]
        && row[i].startsWith('=')
      ) {
        row[i] = this.getCellValue(rowNum+1, i+1);
      }
    }

    return row;
  }

  /**
   * Get a spreadsheet object to perform read/write operations.
   * Check if specified spreadsheet settings are correct 
   * and init default sheet object.s
   * 
   * @param name Optional. Sheet name.
   * @return {Object}
   */
  getSheetObject(name) {
    const sheet = SpreadsheetApp.openById(configSpreadsheetId)
      .getSheetByName(name || configSpreadsheetName);
    if (!sheet) {
      throw 'Cannot find spreadsheet with the name: '
        + (name || configSpreadsheetName);
    }

    if (!name) {
      this.sheetObj = sheet;
    }

    return sheet;
  }

  /**
   * Process sheet formulas (force them to be re-evaluated)
   *
   * @param {number} row Row number
   * @param {number} col Column number
   * @returns {*} The evaluated formula output
   */
  forceFormulasEval(row, col) {
    const formula = this.sheetObj.getRange(row,col).getFormula();

    this.sheetObj.getRange(row, col).setFormula(''); 
    SpreadsheetApp.flush();

    this.sheetObj.getRange(row, col).setFormula(formula);
    SpreadsheetApp.flush();

    return this.getCellValue(row, col);
  }
}