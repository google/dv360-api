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
 * Class to do calls and process output for any API
 */
class AnyApi {
  /**
   * Constructor
   *
   * @param {string} url API Endpoint
   * @param {Object} httpHeaders HTTP Headers for the api call
   * @param {Array} spreadsheetHeaders List of headers from the spreadsheet
   */
  constructor(url, httpHeaders, spreadsheetHeaders) {
    this.url                = url;
    this.httpHeaders        = httpHeaders;
    this.spreadsheetHeaders = spreadsheetHeaders;
    this.cache              = {};

    // Placeholders
    this.placeholderStart = '{{';
    this.placeholderEnd   = '}}';
  }

  /**
   * Get API response JSON
   *
   * @returns {Object}
   */
  get(url, httpHeaders) {
    url = url || this.url;
    if (!url) {
      throw 'API URL cannot be empty. Check the column "Api URL".';
    }

    // Headers are optional
    httpHeaders = httpHeaders || this.httpHeaders || {};

    const cacheKey = url + '|' + JSON.stringify(httpHeaders);
    if (cacheKey in this.cache) {
      return this.cache[cacheKey];
    }

    const res = UrlFetchApp.fetch(url, JSON.parse(httpHeaders));
    this.cache[cacheKey] = JSON.parse(res.getContentText());

    return this.cache[cacheKey];
  }

  /**
   * Process the API endpoint URL params and return the API response JSON
   *
   * @param {Array} params Values to replace placeholders
   * @returns {Object}
   */
  getWithParams(params) {
    let url = this.url;
    let httpHeaders = this.httpHeaders;

    let i = 0;
    for (const paramName of this.spreadsheetHeaders) {
      const pattern = this.placeholderStart + paramName + this.placeholderEnd;

      url = url.replace(pattern, params[i]);
      httpHeaders = httpHeaders.replace(pattern, params[i]);

      i++;
    }

    return this.get(url, httpHeaders);
  }
}
