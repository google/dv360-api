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

const Strategy = require('../classes/strategy.gs');
const Config = require('../classes/config.gs');
const Utils = require('../classes/utils.gs');

class StrategyTest {
    constructor() {
    }

    static process(headers, data) {
        return data;
    }
}

class StrategyTest2 {
    constructor() {
    }

    static process(headers, data) {
        return headers;
    }
}

const currentDateTime = new Date().toISOString();

const spreadSheetData = [
    ['Api URL', 'Api Headers', 'Api Param: Region', 'Strategy Test', 'Last Updated'],
    [
        'https://any-api-url.test',
        '{"headers":{"apikey": "some-key"}}',
        'param-value',
        ''
    ],
    [
        'https://any-api-url.test?q={{Api Param: Region}}',
        '{"headers":{"apikey": "{{Api Param: Region}}"}}',
        'param-value',
        `{"StrategyTest2":"${currentDateTime}"}`
    ]
];

test('register-and-process', () => {
    Strategy.register('IN', 'Strategy Test', StrategyTest);
    expect(Strategy.process('IN', spreadSheetData[0], spreadSheetData[1]))
        .toBe(spreadSheetData[1]);

    Strategy.register('OUT', 'Strategy Test', StrategyTest);
    expect(Strategy.process('OUT', spreadSheetData[0], spreadSheetData[1]))
        .toBe(spreadSheetData[1]);
});

test('registerArray', () => {
    Strategy.register('IN', 'Strategy Test', StrategyTest);
    Strategy.register('IN', 'Strategy Test', StrategyTest2);
    expect(Strategy.process('IN', spreadSheetData[0], spreadSheetData[1]))
        .toBe(spreadSheetData[0]);
});

test('helper-functions', () => {
    //jsonParseSafe
    const json = {'key': 'value'};
    expect(Strategy.jsonParseSafe(JSON.stringify(json))).toBe(json);
    expect(Strategy.jsonParseSafe(JSON.stringify(''))).toBe({});
});

test('updateTime', () => {
    const config = new Config();
    config.config['hours-between-updates'] = 1;
    
    Strategy.register('IN', 'Strategy Test', StrategyTest);
    Strategy.register('IN', 'Strategy Test', StrategyTest2);
    expect(Strategy.process('IN', spreadSheetData[0], spreadSheetData[1], config))
        .toBe(spreadSheetData[1]);
});

