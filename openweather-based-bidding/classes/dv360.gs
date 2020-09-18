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
 * DV360 API Wrapper class. Implements DV360 API calls.
 */
class DV360 {
  /**
   * Set the DV360 wrapper configuration
   *
   * @param {string} authToken A token needed to connect to DV360 API
   */
  constructor(authToken) {
    if (! authToken) {
      throw 'authToken cannot be empty';
    }

    this.authToken = authToken;

    /**
     * DV360 Write API Endpoint Prefix
     * See more: https://developers.google.com/display-video/api/reference/rest
     */
    this.dv360EndPointPrefix = 'https://displayvideo.googleapis.com/v1';
  }

  /**
   * Make an HTTPS API request using specified auth method (see 'Auth' class)
   * @param {string} url - API endpoint to be requested
   * @param {string} method - HTTP(S) method, e.g. GET, PATCH, etc.
   * @param {string} payload - What should be updated
   * @returns {JSON} Result of the operation
   */
  fetchUrl(url, method, payload) {
    const params = {
      muteHttpExceptions: true,
      method: method || 'get',
      headers: {
        'Authorization': 'Bearer ' + this.authToken,
        'Accept': '*/*'
      }
    };

    if (payload) {
      params.headers['Content-type'] = 'application/json';
      params.payload = JSON.stringify(payload);
    }

    const res = UrlFetchApp.fetch(url, params);
    if(200 != res.getResponseCode() && 204 != res.getResponseCode()) {
      Logger.log('HTTP code: ' + res.getResponseCode());
      Logger.log('API error: ' + res.getContentText());
      Logger.log('URL: ' + url);
      Logger.log('params: ' + JSON.stringify(params, 0, 2));
      throw new Error(res.getContentText());
    }

    return res.getContentText() ? JSON.parse(res.getContentText()) : {};
  }

  /**
   * Returns a correct DV360 API status string
   *
   * @param {bool} turnOn
   * @return {string} Status string
   */
  apiStatus(turnOn) {
    return turnOn ? 'ENTITY_STATUS_ACTIVE' : 'ENTITY_STATUS_PAUSED';
  }

  /**
   * Change DV360 entity status (Active/Paused) for the specified ID.
   * See more: https://developers.google.com/display-video/api/reference/rest/v1/advertisers.lineItems
   * See more: https://developers.google.com/display-video/api/reference/rest/v1/advertisers.insertionOrders
   * @param {integer} advertiserId - DV360 Advertiser ID
   * @param {integer} entityId - DV360 Line Item ID
   * @param {bool} turnOn - "true" - activate the entity, "false" - deactivate it
   */
  switchEntityStatus(advertiserId, entityId, turnOn, entity) {
    const newStatus = this.apiStatus(turnOn);
    const updateMask = {
      'entityStatus': newStatus
    };

    const url = Utilities.formatString(
      '%s/advertisers/%s/%s/%s?updateMask=entityStatus',
      this.dv360EndPointPrefix,
      advertiserId,
      entity,
      entityId
    );

    this.fetchUrl(url, 'patch', updateMask);

    Logger.log(
      `* [DV360:switch ${entity}]: DONE, ID: ${entityId} new status ${newStatus}`
    );
  }

  /**
   * Change Insertion Order status (Active/Paused) for the specified IO ID.
   *
   * @param {integer} advertiserId - DV360 Advertiser ID
   * @param {integer} insertionOrderId - DV360 Line Item ID
   * @param {bool} turnOn - "true" - activate IO, "false" - deactivate IO
   */
  switchIOStatus(advertiserId, insertionOrderId, turnOn) {
    const newStatus = this.switchEntityStatus(
      advertiserId, insertionOrderId, turnOn, 'insertionOrders'
    );
  }

  /**
   * Change Line Item status (Active/Paused) for the specified LI ID.
   *
   * @param {integer} advertiserId - DV360 Advertiser ID
   * @param {integer} lineItemId - DV360 Line Item ID
   * @param {bool} turnOn - "true" - activate IO, "false" - deactivate IO
   */
  switchLIStatus(advertiserId, lineItemId, turnOn) {
    const newStatus = this.switchEntityStatus(
      advertiserId, lineItemId, turnOn, 'lineItems'
    );
  }

}
