
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

const Utils = require('../classes/utils.gs');

test('encodeParameters', () => {
    const params = {'foo': 1, 'bar': 2};
    expect(Utils.encodeParameters(params)).toBe('foo=1&bar=2');
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
        Utils.getValueFromJSON('foo.0.foo1', json)
    ).toBe('bar1');

    expect(
        Utils.getValueFromJSON('foo.1.foo2', json)
    ).toBe('bar2');

    expect(
        Utils.getValueFromJSON('bar.bar1', json)
    ).toBe('foo1');

    expect(
        Utils.getValueFromJSON('agg.foo.!MAX', json)
    ).toBe(100);

    expect(
        Utils.getValueFromJSON('agg.foo.!MIN', json)
    ).toBe(0.8);
});

test('arraysToJson', () => {
    const a1 = ['foo', 'bar'];
    const a2 = [1, 2];
    expect(Utils.arraysToJson(a1, a2)).toEqual({'foo': 1, 'bar': 2});
});

test('isDateOlderThanNHours', () => {
    let d1 = new Date();
    let d2 = '2999-01-01';
    expect(Utils.isDateOlderThanNHours(d1, d2, 24)).toBe(false);
    expect(Utils.isDateOlderThanNHours(d1, '', 24)).toBe(true);

    d2 = Date(d1 - 23*60*60*1000);
    expect(Utils.isDateOlderThanNHours(d1, d2, 24)).toBe(false);
    expect(Utils.isDateOlderThanNHours(d1, d2, 0)).toBe(true);

    d2 = new Date(d1 - 25*60*60*1000);
    expect(Utils.isDateOlderThanNHours(d1, d2, 24)).toBe(true);
});