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
 * Class to process OpenWeatherMap API calls from the spreadsheet
 */
class OpenWeatherAPIStrategy {
    /**
     * Fetch the URL and return it's content in the JSON format.
     * 
     * @param {Array} headers Spreadsheet headers
     * @param {Array} data Spreadsheet row data
     * @returns {Object} JSON output
     */
    static process(headers, data, config) {
        const apiKey = config.get('open-weather-api-key');
        if (! apiKey) {
            throw 'OpenWeather API key cannot be empty. Please put your key' 
                + ' to the "open-weather-api-key" config section.';
        }

        const params = {
            lat: data[ config.getHeaderIndex('col-lat') ],
            lon: data[ config.getHeaderIndex('col-lon') ],
            exclude: "minutely,hourly",
            units: config.get('open-weather-api-units'),
            appid: apiKey,
        };
        
        const url = "https://api.openweathermap.org/data/2.5/onecall?"
            + Utils.encodeParameters(params);
        const anyApi = new AnyAPI(url);

        return anyApi.get();
    }
}