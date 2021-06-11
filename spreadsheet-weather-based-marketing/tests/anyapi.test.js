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

const AnyAPI = require('../classes/anyapi.gs');

test('constructor-and-urlparser', () => {
    let inApi = new AnyAPI(
        'https://any-api-url.test',
        '{"headers":{"apikey": "some-key"}}'
    );

    expect(inApi.url).toBe('https://any-api-url.test');
    expect(inApi.headers).toBe('{"headers":{"apikey": "some-key"}}');

    inApi = new AnyAPI(
        'https://any-api-url.test?q={{Api Param: Region}}', 
        '{"headers":{"apikey": "{{Api Param: Region}}"}}'
    );
    inApi.setParams({'Api Param: Region': 'param-value'});

    expect(inApi.url).toBe('https://any-api-url.test?q=param-value');
    expect(JSON.parse(inApi.headers).headers.apikey).toBe('param-value');
});

test('get', () => {
    let inApi = new AnyAPI('', '');

    expect(() => {inApi.get()}).toThrow('API URL cannot be empty.');

    inApi = new AnyAPI('https://any-api-url.test', '');
    inApi.setCache('https://any-api-url.test|"{}"', {'test': 'OK'});

    expect(inApi.get()).toEqual({'test': 'OK'});
});