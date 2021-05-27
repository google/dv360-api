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
 * A storage which contains all the registered strategies
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
     * @returns {Array} The output of the classHandler.process(...), always of
     *  the same length as the row in the spreadsheet.
     */
    static process(queueName, header, data, config, idx = null) {
        if (! config) {
            throw 'ERROR:Strategy.process: Empty `config` variable.';
        }

        for (const columnName in STRATEGYQUEUE[queueName]) {
            if (
                header.indexOf(columnName) > -1
                && STRATEGYQUEUE[queueName][columnName]
            ) {
                // We don't want to change the original row data
                let processedRow = [...data];

                // Looking for the strategy
                for (let i in STRATEGYQUEUE[queueName][columnName]) {
                    const lastUpdatedIdx = config.getHeaderIndex('col-last-updated');
                    const strategyName = STRATEGYQUEUE[queueName][columnName][i].name;

                    if (!this.strategyAlreadyProcessed(
                            strategyName,
                            processedRow[ lastUpdatedIdx ],
                            config.get('hours-between-updates')
                    )) {
                        processedRow = STRATEGYQUEUE[queueName][columnName][i]
                            .process(header, processedRow, config, idx);

                        processedRow[ lastUpdatedIdx ] = this
                            .genLastUpdatedJSON(
                                strategyName,
                                processedRow[ lastUpdatedIdx ]
                            );
                    }
                }
                
                return processedRow;
            }
        }

        console.log(
            'LOG:Strategy.process: No handler class is found, nothing to process.', 
            queueName, header, data, STRATEGYQUEUE
        );
    }

    /**
     * Returns TRUE if strategy is already processed, else FALSE
     * 
     * @param {string} strategyName Strategy name
     * @param {string} lastUpdatedJSON Value of the "Last Updated", in JSON format
     * @param {int} hoursBetweenUpdates Hours between updates
     * @returns {bool}
     */
    static strategyAlreadyProcessed(
        strategyName, 
        lastUpdatedJSON, 
        hoursBetweenUpdates
    ) {
        const lastUpdated = this.getLastUpdated(
            strategyName,
            lastUpdatedJSON
        );
        const currentDateTime = new Date();
        
        return ! this.isDateOlderThanNHours(
            currentDateTime, 
            lastUpdated,
            hoursBetweenUpdates
        );
    }

    /**
     * Extract and return the last updated date for the specific strategy
     * 
     * @param {string} strategyName Strategy name
     * @param {strng} json Value of the "Last Updated", in JSON format
     * @returns {string} Return empty string if date is not found
     */
    static getLastUpdated(strategyName, json) {
        json = this.jsonParseSafe(json);
        return strategyName in json ? json[strategyName] : '';
    }

    /**
     * Safe way to parse JSON, not triggering exception.
     * 
     * @param {string} json JSON to parse
     * @returns {Object} JSON Object
     */
    static jsonParseSafe(json) {
        try {
            return JSON.parse(json);
        } catch (e) {
            return {};
        }
    }

    /**
     * Generate the correct JSON string with the updated date/time of the last 
     *  update.
     * 
     * @param {string} strategyName Strategy name
     * @param {string} json JSON string
     * @returns {string}
     */
    static genLastUpdatedJSON(strategyName, json) {
        json = this.jsonParseSafe(json);
        json[ strategyName ] = (new Date()).toISOString();

        return JSON.stringify(json);
    }

    /**
   * Check if the lastUpdated is older then `currentDateTime - hoursBetweenUpdates`
   * 
   * @param {string|Date} currentDateTime Current date
   * @param {string|Date} lastUpdated Date of the last update
   * @param {int} hoursBetweenUpdates Number of hours between events. If 0, then
   *  always will return true 
   * @param {float} errorDiff For apps script scheduler (e.g. daily 8AM-9AM) 
   *  which doesn't run at the very same hour and minute as the last run
   * @returns {bool} TRUE if it is older else FALSE
   */
  static isDateOlderThanNHours(
    currentDateTime, 
    lastUpdated, 
    hoursBetweenUpdates, 
    errorDiff = 0.17
  ) {
    hoursBetweenUpdates = parseInt(hoursBetweenUpdates);
    if (! hoursBetweenUpdates) {
      return true;
    }

    if (!lastUpdated) {
      return true;
    }

    if (! currentDateTime instanceof Date) {
      currentDateTime = new Date(currentDateTime);
    }

    if (! (lastUpdated instanceof Date)) {
      lastUpdated = new Date(lastUpdated);
    }

    const diffHours = (currentDateTime - lastUpdated) / 1000 / 60 / 60;
    return 0 < diffHours && diffHours > (hoursBetweenUpdates - errorDiff);
  }
}

// For tests
if (typeof module !== 'undefined') {
    module.exports = Strategy;
}