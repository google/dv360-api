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
 * As storage which contains all the registered classes
 */
const STRATEGYQUEUE = {
    'IN': {},
    'OUT': {},
};

/**
 * Main class to process the spreadsheet by calling the right processor class.
 */
class Strategy {

    /** 
     * Register a new handler class.
     * 
     * @param queueName {string} Decides which queue (IN or OUT)
     * @param fieldName {string} Handle columns with this name
     * @param classHandler {class} This class will handle the data processing
     * @returns {void}
     */
    static register(queueName, fieldName, classHandler) {
        STRATEGYQUEUE[queueName][fieldName] = classHandler;
    }

    /** 
     * Processes the queue and returns the output of the handler class method.
     * 
     * @param queueName {string} Decides which queue (IN or OUT)
     * @param headers {array} List of the header columns from the spreadsheet
     * @param data {array} The data from the spreadsheet row.
     * @returns {*} The output of the classHandler.process(...)
     */
    static process(queueName, header, data, config) {
        for (const columnName in STRATEGYQUEUE[queueName]) {
            if (header.indexOf(columnName) > -1) {
                const tmpObject = new STRATEGYQUEUE[queueName][columnName]();
                return tmpObject.process(header, data, config);
            }
        }

        console.log(
            'Strategy.process: No handler class is found, nothing to process.', 
            queueName, header, data, STRATEGYQUEUE
        );
    }

    /** 
     * Flush (empty) the queue.
     * 
     * @param queueName {string} Flush this queue (IN or OUT). If empty then flush both.
     * @returns {void}
     */
    static flush(queueName = '') {
        if (queueName) {
            STRATEGYQUEUE[queueName] = {};
        } else {
            STRATEGYQUEUE = {
                'IN': {},
                'OUT': {},
            };
        }
    }
}

// For tests
if (typeof module !== 'undefined') {
    module.exports = Strategy;
}