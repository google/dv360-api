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
 * This is a "Simple Trigger" (https://developers.google.com/apps-script/guides/triggers#onopene).
 * It adds a custom menu item into the spreadsheet menu.
 *
 * @param {Event} e The onOpen event.
 */
function onOpen(e) {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Weather Based Marketing')
    .addItem('Check weather and sync DV360', 'monitorWeatherAndSyncWithDV360')
    .addItem('Only check weather', 'checkWeather')
    .addSeparator()
    .addItem('Create sample config', 'createExampleTable')
    .addToUi();
}

/**
 * Creates a sheet with the example table.
 * The table is a main configuration source for the AppsScript code.
 */
function createExampleTable() {
  const spreadsheet = SpreadsheetApp.openById(configSpreadsheetId);
  let sheet = spreadsheet.getSheetByName(configSpreadsheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(configSpreadsheetName);
  } else {
    const msg = `ERROR: A sheet with the name "${configSpreadsheetName}" already exists.`
        + ' Please rename or delete it.';

    SpreadsheetApp.getUi().alert(msg);
    Logger.log(msg);
    return;
  }

  // Populate values
  sheet.getRange("A1:N3").setValues(getExampleTableValues());

  // Add colors
  sheet.getRange("A1:N1")
    .setBackgroundRGB(102, 204, 255)
    .setFontWeight("bold");

  SpreadsheetApp.getUi().alert("Done");
}

/**
 * Returns a default configuration table structure.
 *
 * @return {array} The configuration structure.
 */
function getExampleTableValues() {
  return [
    [
      'City',
      'Weather condition',
      'Activation Formula',
      'Line Item Id',
      'Insertion Order Id',
      'Advertiser ID',
      'Latitude',
      'Longitude',
      'Last Updated',
      'api:daily.0.clouds',
      'api:daily.0.rain',
      'api:daily.0.snow',
      'api:daily.0.feels_like.!MIN',
      'api:daily.0.feels_like.!MAX',
    ],
    [
      'Hamburg',
      'Rain or clouds',
      '=OR(J2>=50, K2>=10)',
      '<Integer: Line Item ID>',
      '<Integer: Insertion Order Id>',
      '<Integer: Advertiser ID>',
      '53.55',
      '10',
      '',
      '',
      '',
      '',
      '',
      '',
    ],
    [
      'Hamburg',
      'Feels cold',
      '=N3<0',
      '<Integer: Line Item ID>',
      '<Integer: Insertion Order Id>',
      '<Integer: Advertiser ID>',
      '53.55',
      '10',
      '',
      '',
      '',
      '',
      '',
      '',
    ],
  ];
}
