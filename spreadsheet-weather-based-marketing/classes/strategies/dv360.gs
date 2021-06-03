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
 * Class to process DV360 API calls from the spreadsheet
 */
class DV360APIStrategy {
    /**
     * Update the LI or IO status in DV360 (Activate/Deactivate)
     * 
     * @param {Array} headers Spreadsheet headers
     * @param {Array} data Spreadsheet row data
     * @returns {Object} JSON output
     */
    static process(headers, data, config) {
        const activate = data[ config.getHeaderIndex('col-formula') ],
            lineItemId = parseInt(
                data[ config.getHeaderIndex('col-line-item-id', '') ]
            ),
            insertionOrderId = parseInt(
                data[ config.getHeaderIndex('col-insertion-order-id', '') ]
            ),
            advertiserId = parseInt(
                data[ config.getHeaderIndex('col-advertiser-id') ]
            );
        
        if (advertiserId <= 0) {
            return;
        }
        
        const auth     = new Auth(config.get('service-account'));
        const dv360    = new DV360(auth.getAuthToken());

        // Max 3 retries
        const maxRetries = 3;
        for (let i=0; i<maxRetries; i++) {
            try {
                // Switch Status according to the activation formula value
                if (!isNaN(lineItemId) && lineItemId > 0) {
                    dv360.switchLIStatus(advertiserId, lineItemId, activate);
                } else if (!isNaN(insertionOrderId) && insertionOrderId > 0) {
                    dv360.switchIOStatus(advertiserId, insertionOrderId, activate);
                }

                break;
            } catch (e) {
                const secs = 5 * (i + 1);
                Logger.log(`Error updating DV360 API, retrying in ${secs}s`);
                Logger.log(e);
                if (i == maxRetries-1) {
                    throw `Failed to update DV360 API after ${maxRetries} retries`;
                }

                Utilities.sleep(1000*secs);
            }
        }
    }
}