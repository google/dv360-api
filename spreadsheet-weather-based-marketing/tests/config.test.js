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
 * This is a test file, which is based on [jest](https://jestjs.io/docs/en/getting-started.html).
 * In order to run the test just use a shell command:
 * ```
 * ~$ npm run test
 * ```
 */

const Config = require('../classes/config.gs');

test('headerOperations', () => {
    const config = new Config();
    const headers = [
        'Line Item Id',	
        'Insertion Order Id',
        'Advertiser ID',
        'Latitude',
        'Longitude',
    ];

    config.setHeaders(headers);
    expect(config.getHeaderIndex('col-line-item-id')).toBe(0);
    expect(config.getHeaderIndex('col-lon')).toBe(4);

    expect(() => {config.getHeaderIndex('Line Item Id')})
        .toThrow("ERROR: Column 'Line Item Id' not found.");
});

test('getApiHeaders', () => {
    const config = new Config();
    
    const headers = [
        'no api header 1',
        'api:header1',
        'no api header 2',
        'api:header2'
    ];

    config.setHeaders(headers);
    expect(config.getApiHeaders()).toStrictEqual(
        {'header1': 1, 'header2': 3}
    );
});