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
      console.log('part', part);
      let tmpVal;
      const intVal = parseInt(part);
      if (intVal && intVal in tmpJson) {
        console.log(61);
        tmpVal = tmpJson[intVal];
      } else if (tmpJson.hasOwnProperty(part)) {
        console.log(64);
        tmpVal = tmpJson[part];
      } else {
        console.log(67);
        break;
      }
      
      const typeOf = typeof tmpVal;
      console.log('typeOf', typeOf, 'tmpVal', tmpVal);
      if ('string' == typeOf || 'number' == typeOf) {
        return tmpVal;
      } else {
        tmpJson = tmpVal;
      }
    }

    return val;
  }
}

module.exports = Utils;