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
 * This Ads Script code works with the Weather Based Marketing spreadsheet
 * to activate or pause AdGroups according to the "Activation Formula"
 * and the "AdGroup Name" columns.
 * This script supports: Search/Display Ad Groups, Video Ad Groups, Shopping Ad Groups
 */

// ==== Configuration Start   ==== //
// 
// *Mandatory*: Please specify your spreadsheet URL below 
// (copy and paste the Weather Based Marketing Spreadsheet URL)
var SPREADSHEET_URL = '';

// *Mandatory*: Specify the sheet and the columns names
var SHEET_NAME = 'Triggers';
var ACTIVATION_FORMULA = 'Activation Formula';
var AD_GROUP_NAME = 'AdGroup Name';
// ==== Configuration End   ==== //

/**
 * The main entry point for the Ads Script
 */
function main() {
  if (! SPREADSHEET_URL) {
    throw 'Error: Please specify SPREADSHEET_URL!';
  }

  var rows = getSheetData(SPREADSHEET_URL, SHEET_NAME);
  var activationFormulaIdx = rows[0].indexOf(ACTIVATION_FORMULA);
  var adGroupIdx = rows[0].indexOf(AD_GROUP_NAME);

  if (activationFormulaIdx < 0 || adGroupIdx < 0) {
    Logger.log(
        'Spreadsheet columns "%s" OR "%s" not found',
        ACTIVATION_FORMULA, AD_GROUP_NAME
    );
    throw 'Wrong spreadsheet format, please check logs';
  }
  
  for (var i=1; i<rows.length; i++) {
    var row = rows[i];
    if (row[activationFormulaIdx]) {
      Logger.log('Activating: %s', row[adGroupIdx]);
    } else {
      Logger.log('Pausing: %s', row[adGroupIdx]);
    }
    
    switchAdGroupStatus(row[adGroupIdx], row[activationFormulaIdx]);
  }
}

/**
 * Activate or pause the AdGroup by it's name
 * 
 * @param {string} adGroupName Ad Group name
 * @param {bool} activate If true, then activate, else pause
 * @returns {void}
 */
function switchAdGroupStatus(adGroupName, activate) {
  var selectors = [
    AdsApp.adGroups(), 
    AdsApp.videoAdGroups(),
    AdsApp.shoppingAdGroups()
  ];
  for(var i = 0; i < selectors.length; i++) {
    var adGroupIter = selectors[i]
        .withCondition('Name = "' + adGroupName + '"')
        .get();
    
    if (adGroupIter.hasNext()) {
      var currentAdGroup = adGroupIter.next();
      if (activate) {
        currentAdGroup.enable();
      } else {
        currentAdGroup.pause();
      }
    }
  }
}

/**
 * Retrieves the data for a worksheet.
 *
 * @param {Object} spreadsheetUrl The spreadsheet.
 * @param {string} sheetName The sheet name.
 * @return {Array} The data as a two dimensional array.
 */
function getSheetData(spreadsheetUrl, sheetName) {
    var spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
    var sheet = spreadsheet.getSheetByName(sheetName);
    var range = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());

    return range.getValues();
}