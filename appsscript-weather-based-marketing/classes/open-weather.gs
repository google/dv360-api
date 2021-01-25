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
 * Helper class to wrap calls to OpenWeatherMap API
 */
class OpenWeather {
  /**
   * Constructor
   *
   * @param {string} apiKey Needed for Open Weather API calls
   */
  constructor(apiKey) {
    if (! apiKey) {
      throw 'OpenWeather API key cannot be empty. Please edit "config.gs"';
    }

    this.apiKey = apiKey;
  }

  /**
   * Get current and forecast weather data based on geo location
   *
   * @param {number} lat
   * @param {number} lon
   *
   * @returns {Object}
   */
  getCurrent(lat, lon) {
    const params = {
      lat: lat,
      lon: lon,
      exclude: "minutely,hourly",
      units: "metric",
      appid: this.apiKey
    }

    const url = "https://api.openweathermap.org/data/2.5/onecall?"
      + Utils.encodeParameters(params);
    const res = UrlFetchApp.fetch(url);

    return JSON.parse(res.getContentText()).current;
  }

  /**
   * Get historical weather data based on geo location
   *
   * @param {number} lat
   * @param {number} lon
   * @param {number} daysBack
   *
   * @returns {Object}
   */
  getHistorical(lat, lon, daysBack = 1) {
    const params = {
      lat: lat,
      lon: lon,
      dt: Utils.getPastTimestamp(daysBack),
      units: "metric",
      appid: this.apiKey
    }

    const url = "https://api.openweathermap.org/data/2.5/onecall/timemachine?"
      + Utils.encodeParameters(params);
    const res = UrlFetchApp.fetch(url);

    return JSON.parse(res.getContentText());
  }
}
