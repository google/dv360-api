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
const config = new Config();

class StrategyTest {
    static process(headers, data) {
        return data;
    }
}

class StrategyTest2 {
    static process(headers, data) {
        return headers;
    }
}

class StrategyTest3 {
    static process(headers, data) {
        return {
            'foo': {
                'bar': 'test1',
            },
            'foo2': 'test2'
        };
    }
}

const currentDateTime = new Date();
const spreadSheetData = [
    [
        'Api URL', 
        'Api Headers', 
        'Api Param: Region', 
        'Strategy Test', 
        'Last Updated',
        'api:foo.bar',
        'api:foo2',
    ],
    [
        'https://any-api-url.test',
        '{"headers":{"apikey": "some-key"}}',
        'param-value',
        '',
        '',
        '',
        '',
    ],
    [
        'https://any-api-url.test?q={{Api Param: Region}}',
        '{"headers":{"apikey": "{{Api Param: Region}}"}}',
        'param-value',
        '',
        `{"StrategyTest2":"${currentDateTime.toISOString()}"}`,
        '',
        '',
    ]
];
config.setHeaders(spreadSheetData[0]);
config.config['hours-between-updates'] = 1;

test('register-and-process', () => {
    Strategy.register('IN', 'Strategy Test', StrategyTest);
    expect(Strategy.process('IN', spreadSheetData[0], spreadSheetData[1], config))
        .toEqual(expect.arrayContaining(spreadSheetData[1]));

    Strategy.register('OUT', 'Strategy Test', StrategyTest);
    expect(Strategy.process('OUT', spreadSheetData[0], spreadSheetData[1], config))
        .toEqual(expect.arrayContaining(spreadSheetData[1]));
});

test('registerArray', () => {
    Strategy.register('IN', 'Strategy Test', StrategyTest);
    Strategy.register('IN', 'Strategy Test', StrategyTest2);
    expect(Strategy.process('IN', spreadSheetData[0], spreadSheetData[1], config))
        .toBe(spreadSheetData[0]);
});

test('isDateOlderThanNHours', () => {
    let d1 = new Date();
    let d2 = '2999-01-01';
    expect(Strategy.isDateOlderThanNHours(d1, d2, 24)).toBe(false);
    expect(Strategy.isDateOlderThanNHours(d1, '', 24)).toBe(true);

    d2 = Date(d1 - 23*60*60*1000);
    expect(Strategy.isDateOlderThanNHours(d1, d2, 24)).toBe(false);
    expect(Strategy.isDateOlderThanNHours(d1, d2, 0)).toBe(true);

    d2 = new Date(d1 - 25*60*60*1000);
    expect(Strategy.isDateOlderThanNHours(d1, d2, 24)).toBe(true);
});

test('json/date helper functions', () => {
    // jsonParseSafe
    const json = {"key": "value", "test": "2019-05-27T07:24:50.750Z"};
    expect(Strategy.jsonParseSafe(JSON.stringify(json))).toStrictEqual(json);
    expect(Strategy.jsonParseSafe('', true)).toStrictEqual({});

    // getLastUpdated
    expect(Strategy.getLastUpdated('key', JSON.stringify(json))).toBe('value');

    // genLastUpdatedJSON
    const jsonLastUpdated = Strategy.genLastUpdatedJSON('key2', JSON.stringify(json));

    expect(Strategy.getLastUpdated('key', jsonLastUpdated)).toBe('value');

    const dateTime = new Date(Strategy.getLastUpdated('key2', jsonLastUpdated));
    expect(dateTime.getDate()).toBe(currentDateTime.getDate());
    expect(dateTime.getMonth()).toBe(currentDateTime.getMonth());
    expect(dateTime.getFullYear()).toBe(currentDateTime.getFullYear());

    // strategyAlreadyProcessed
    expect(Strategy.strategyAlreadyProcessed('test', jsonLastUpdated, 1))
        .toBe(false);
    expect(Strategy.strategyAlreadyProcessed('test2', jsonLastUpdated, 1))
        .toBe(false);
    expect(Strategy.strategyAlreadyProcessed('key2', jsonLastUpdated, 1))
        .toBe(true);
    expect(Strategy
        .strategyAlreadyProcessed('StrategyTest2', spreadSheetData[2][4], 1)
    ).toBe(true);
});

test('Processing of the already precessed stratigy', () => {
    Strategy.register('IN', 'Strategy Test', StrategyTest);
    Strategy.register('IN', 'Strategy Test', StrategyTest2);

    expect(Strategy.process('IN', spreadSheetData[0], spreadSheetData[1], config))
        .toBe(spreadSheetData[0]);
    
    const processed = Strategy
        .process('IN', spreadSheetData[0], spreadSheetData[2], config);
    
    for (let i=0; i<4; i++) {
        expect(processed[i]).toBe(spreadSheetData[2][i]);
    }
});

test('getValueFromJSON', () => {
    const json = {
        'foo': [
            {
                'foo1': 'bar1'
            },
            {
                'foo2': 'bar2'
            },
        ], 
        'bar': {
            'bar1': 'foo1',
        },
        'agg': {
            'foo': {
                'key1': 10,
                'key2': 100,
                'key3': 0.8,
            }
        }
    };

    expect(
        Strategy.getValueFromJSON('foo.0.foo1', json)
    ).toBe('bar1');

    expect(
        Strategy.getValueFromJSON('foo.1.foo2', json)
    ).toBe('bar2');

    expect(
        Strategy.getValueFromJSON('bar.bar1', json)
    ).toBe('foo1');

    expect(
        Strategy.getValueFromJSON('agg.foo.!MAX', json)
    ).toBe(100);

    expect(
        Strategy.getValueFromJSON('agg.foo.!MIN', json)
    ).toBe(0.8);
});

test('Processing api outputs', () => {
    Strategy.register('IN', 'Strategy Test', StrategyTest);
    Strategy.register('IN', 'Strategy Test', StrategyTest2);
    Strategy.register('IN', 'Strategy Test', StrategyTest3);

    const processed = Strategy
        .process('IN', spreadSheetData[0], spreadSheetData[1], config);
    
    expect(processed[5]).toBe('test1');
    expect(processed[6]).toBe('test2');
});

test('Error messages', () => {
    Strategy.addErrorMessage('Test 1');
    Strategy.addErrorMessage('Test 2');
    expect(Strategy.getErrorMessages()).toBe("Test 1\nTest 2");
});