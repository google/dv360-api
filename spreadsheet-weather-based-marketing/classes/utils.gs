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
 * This class contains different utility functional
 */
class Utils {
  /**
   * Take an object and transform it to a URL safe parameter string
   *
   * @param {object} params
   * @returns {string}
   */
  static encodeParameters(params) {
    return Object.keys(params).map(function(key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
  }

  /**
   * Get timestamp of [daysBack] days ago in microseconds
   *
   * @param {number} daysBack
   * @returns {string}
   */
  static getPastTimestamp(daysBack) {
    let daysAgoMillis = new Date().getTime() - daysBack * 24 * 60 * 60 * 1000;

    return (Math.floor(daysAgoMillis / 1000)).toString();
  }

  /**
   * Get JSON entry value for the provided path (similar to XPath in XML)
   *
   * @param {string} path Format "<entity>.<entity>.<array index>.<entity>"
   * @param {JSON} json JSON or JavaScript Object
   * @returns {*|null} Value from JSON or null if value does not exist
   */
  static getValueFromJSON(path, json) {
    let tmpJson  = json, 
        val       = null;
    
    for (const part of path.split('.')) {
      if (part.startsWith('!')) {
        return Utils.getAgregatedValueFromJSON(part.substring(1), tmpJson);
      }

      let tmpVal;
      const intVal = parseInt(part);
      if (intVal && intVal in tmpJson) {
        tmpVal = tmpJson[intVal];
      } else if (tmpJson.hasOwnProperty(part)) {
        tmpVal = tmpJson[part];
      } else {
        break;
      }
      
      const typeOf = typeof tmpVal;
      if ('string' == typeOf || 'number' == typeOf) {
        return tmpVal;
      } else {
        tmpJson = tmpVal;
      }
    }

    return val;
  }

  /**
   * Get aggregated value (e.g. MAX, MIN, etc.) from JSON entry values.
   *
   * @param {string} aggFunction Aggregation function (now only MIN and MAX function are supported)
   * @param {JSON} json JSON or JavaScript Object
   * @returns {number} Agregated value from JSON
   */
  static getAgregatedValueFromJSON(aggFunction, json) {
    switch (aggFunction.toLowerCase()) {
      case 'min':
        return Math.min.apply(Math, Object.values(json));
        
      case 'max':
        return Math.max.apply(Math, Object.values(json));

      default:
        throw `Aggregation function "${aggFunction}" is not supported`;
    }
  }

  /**
   * Combine two arrays of the same size to the JSON.
   * 
   * @param {Array} a1 Array for keys
   * @param {Array} a2 Array for values
   * @returns {Object} Json { a1.element: a2.element, ... }
   */
  static arraysToJson(a1, a2) {
    const result = {};
    a1.forEach((key, i) => { result[ key ] = a2[ i ] });

    return result;
  }

  /**
   * Logging of the successful processing (in CSV format for the further analysis).
   * `[ROW DATA]` is just a label, so the logs can be filtered out by it.
   * 
   * @param {Array} row The spreadsheet row
   * @param {string} label A lable to be added to the log message
   * @returns {void}
   */
  static logRowData(row, label='[ROW DATA]') {
    row.push(label);
    Logger.log(row.join(','));
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
    if (! currentDateTime instanceof Date) {
      currentDateTime = new Date(currentDateTime);
    }

    if (! (lastUpdated instanceof Date)) {
      lastUpdated = new Date(lastUpdated);
    }

    hoursBetweenUpdates = parseInt(hoursBetweenUpdates);
    if (! hoursBetweenUpdates) {
      return true;
    }

    const diffHours = (currentDateTime - lastUpdated) / 1000 / 60 / 60;
    return 0 < diffHours && diffHours > (hoursBetweenUpdates - errorDiff);
  }
}

// For tests
if (typeof module !== 'undefined') {
  module.exports = Utils;
}