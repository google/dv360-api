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
 * Class to compare activation formula value with the DV360 status
 */
class DV360WatchdogStrategy {
    /**
     * Check the LI or IO status in DV360 (is it Activate or Paused)
     * 
     * @param {Array} headers Spreadsheet headers
     * @param {Array} data Spreadsheet row data
     * @param {Config} config Config object
     * @param {int} rowIdx Row index (for reporting purposes)
     * @returns {bool} Status
     */
    static process(headers, data, config, rowIdx) {
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
        
        if ('' === activate) {
            // Empty formula, nothing to do
            return false;
        }

        if (
            advertiserId <= 0 
            || (
                (isNaN(lineItemId) || lineItemId <= 0)
                && (isNaN(insertionOrderId) || insertionOrderId <= 0)
            )
        ) {
            // Nothing to check, since no DV360 entity is not specifed
            return false;
        }
        
        const auth     = new Auth(config.get('service-account'));
        const dv360    = new DV360(auth.getAuthToken());

        // Save DV360 status to this variable
        let dv360StatusActive;

        // Max 3 retries
        const maxRetries = 3;
        for (let i=0; i<maxRetries; i++) {
            try {
                // Check Status
                if (!isNaN(lineItemId) && lineItemId > 0) {
                    dv360StatusActive = dv360.isLIActive(
                        advertiserId, lineItemId
                    );
                } else if (!isNaN(insertionOrderId) && insertionOrderId > 0) {
                    dv360StatusActive = dv360.isOIActive(
                        advertiserId, insertionOrderId
                    );
                }

                break;
            } catch (e) {
                const secs = 5 * (i + 1);
                Logger.log(`Error requesting DV360 API, retrying in ${secs}s`);
                Utilities.sleep(1000*secs);

                if (i == maxRetries-1) {
                    throw `Failed to request DV360 API after ${maxRetries} retries`;
                }
            }
        }

        if (activate !== dv360StatusActive) {
            Strategy.addErrorMessage(
                `DV360 status is "${dv360StatusActive}"`
                + ` but spreadsheet status is "${activate}" (row:${rowIdx+1},`
                + ` IO:${insertionOrderId}, LI:${lineItemId})`
            );
        }

        return true;
    }
}