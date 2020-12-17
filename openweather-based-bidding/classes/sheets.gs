/**
 * Copyright 2020 Google LLC.
 * This solution, including any related sample code or data,
 * is made available on an “as is,” “as available,” and “with all faults” basis,
 * solely for illustrative purposes, and without warranty or representation of
 * any kind.
 * This solution is experimental, unsupported and provided solely for your
 * convenience. Your use of it is subject to your agreements with Google, as
 * applicable, and may constitute a beta feature as defined under those
 * agreements.
 *
 * To the extent that you make any data available to Google in connection with
 * your use of the solution, you represent and warrant that you have all
 * necessary and appropriate rights, consents and permissions to permit Google
 * to use and process that data.
 * By using any portion of this solution, you acknowledge, assume and accept all
 * risks, known and unknown, associated with its usage, including with respect
 * to your deployment of any portion of this solution in your systems, or usage
 * in connection with your business, if at all.
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
      Sheets_v4.Spreadsheets.Values.update(valueRange, this.spreadsheetId, range,
                                        options);
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