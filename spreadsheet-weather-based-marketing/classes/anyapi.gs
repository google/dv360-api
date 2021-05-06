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

const ANYAPICACHE = {};

/**
 * Main class to process API calls
 */
class AnyAPI {
    /**
     * Constructor
     *
     * @param {string} url API Endpoint
     * @param {Object} headers HTTP Headers for the api call
     */
    constructor(url, headers = '') {
        this.url = url;
        this.headers = headers;

        // Placeholders in the URL & headers
        this.placeholderStart = '{{';
        this.placeholderEnd   = '}}';
    }

    /**
     * Set url and http header params
     *
     * @param {Object} params URL and Headers params {name => value, ...}
     * @return {void}
     */
    setParams(params) {
        for (const p in params) {
            const pattern = this.placeholderStart + p + this.placeholderEnd;

            this.url = this.url.replace(pattern, params[p]);
            this.headers = this.headers.replace(pattern, params[p]);
        }
    }

    /**
     * Get API response JSON.
     * Bad test coverage since `UrlFetchApp.fetch` is Apps Script specific.
     *
     * @returns {Object}
     */
    get() {
        if (!this.url) {
            throw 'API URL cannot be empty.';
        }

        // Headers are optional
        this.headers = this.headers || '{}';

        const cacheKey = this.url + '|' + JSON.stringify(this.headers);
        if (! (cacheKey in ANYAPICACHE)) {
            const res = UrlFetchApp.fetch(this.url, JSON.parse(this.headers));
            ANYAPICACHE[cacheKey] = JSON.parse(res.getContentText());
        }

        return ANYAPICACHE[cacheKey];
    }

    /**
     * Add something to the cache
     * 
     * @param {*} key Key
     * @param {*} value Value
     */
    setCache(key, value) {
        ANYAPICACHE[key] = value;
    }
}

// For tests
if (typeof module !== 'undefined') {
    module.exports = AnyAPI;
}