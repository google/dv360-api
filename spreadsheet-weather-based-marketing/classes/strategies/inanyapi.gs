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
 * Class to process Any API calls from the spreadsheet
 */
class INAnyAPIStrategy {
    /**
     * Fetch the any api URL and return it's content in the JSON format.
     * 
     * @param {Array} headers Spreadsheet headers
     * @param {Array} data Spreadsheet row data
     * @returns {Object} JSON output
     */
    static process(headers, data, config) {
        const url = data[ config.getHeaderIndex('col-api-url') ];
        const apiHttpHeaders = data[ config.getHeaderIndex('col-api-headers', null) ];
        const anyApi = new AnyAPI(url, apiHttpHeaders);
        
        const params = Utils.arraysToJson(headers, data);
        anyApi.setParams(params);

        return anyApi.get();
    }
}