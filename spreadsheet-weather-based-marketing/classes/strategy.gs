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
        if (! (fieldName in STRATEGYQUEUE[queueName])) {
            STRATEGYQUEUE[queueName][fieldName] = [];
        }

        STRATEGYQUEUE[queueName][fieldName].push(classHandler);
    }

    /** 
     * Register am array of new handler classes.
     * 
     * @param queueName {string} Decides which queue (IN or OUT)
     * @param handlers {Array} This array contains classes which handle the data 
     *  processing
     * @returns {void}
     */
    static registerArray(queueName, handlers) {
        if (! handlers) {
            return;
        }

        for (let i in handlers) {
            const key = Object.keys(handlers[i])[0];
            this.register(queueName, key, handlers[i][key]);
        }
    }

    /** 
     * Processes the queue and returns the output of the handler class method.
     * 
     * @param queueName {string} Decides which queue (IN or OUT)
     * @param headers {array} List of the header columns from the spreadsheet
     * @param data {array} The data from the spreadsheet row.
     * @param idx {int} Row index, for reporting purposes.
     * @returns {*} The output of the classHandler.process(...)
     */
    static process(queueName, header, data, config, idx = null) {
        for (const columnName in STRATEGYQUEUE[queueName]) {
            if (
                header.indexOf(columnName) > -1
                && STRATEGYQUEUE[queueName][columnName]
            ) {
                let processedRow = data;
                for (let i in STRATEGYQUEUE[queueName][columnName]) {
                    if (
                        !this.strategyAlreadyProcessed(
                            STRATEGYQUEUE[queueName][columnName][i],
                            processedRow
                        )
                    ) {
                        processedRow = STRATEGYQUEUE[queueName][columnName][i]
                            .process(header, processedRow, config, idx);
                    }
                }
                
                return processedRow;
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