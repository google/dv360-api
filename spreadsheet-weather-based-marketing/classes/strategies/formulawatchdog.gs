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
 * Class to check that activation formula value is not empty
 */
class FormulaWatchdogStrategy {
    /**
     * Check formula
     * 
     * @param {Array} headers Spreadsheet headers
     * @param {Array} data Spreadsheet row data
     * @param {Config} config Config object
     * @param {int} rowIdx Row index (for reporting purposes)
     * @returns {Object} JSON output
     */
    static process(headers, data, config, rowIdx) {
        const activate = data[ config.getHeaderIndex('col-formula') ];
        
        if ('' === activate) {
            Strategy.addErrorMessage(
                `Activation formula is empty! Row ${rowIdx+1}`
            );
        } else if (
            'string' != typeof activate
            || '=' !== activate.substring(0, 1)
        ) {
            Strategy.addErrorMessage(
                `Activation formula does not start with "=" (value: "${activate}")!`
                + ` Row ${rowIdx+1}`
            );
        }

        return data;
    }
}