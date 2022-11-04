/**
 * Fido / Webauthn and all the functions to create / edit / delete it ...
 */

import psonoServer from './api-server';
import store from './store';
import helperService from './helper';

/**
 * Returns the current origin
 *
 * @returns {string} Returns the current origin
 */
function getOrigin() {
    const parsedUrl = helperService.parse_url(window.location.href);
    return parsedUrl.base_url;
}

/**
 * Initiate the second factor authentication with webauthn
 *
 * @returns {Promise} Returns a promise with the user information
 */
function verifyWebauthnInit() {
    const token = store.getState().user.token;
    const sessionSecretKey = store.getState().user.session_secret_key;

    const onSuccess = function (request) {
        return request.data;
    };
    const onError = function (request) {
        return Promise.reject(request.data);
    };
    return psonoServer
        .webauthnVerifyInit(token, sessionSecretKey, getOrigin())
        .then(onSuccess, onError);
}

/**
 * Solve the second factor webauthn authentication
 *
 * @param {string} credential The credentials passed by the browser
 *
 * @returns {Promise} Returns a promise with the user information
 */
function verifyWebauthn(credential) {
    const token = store.getState().user.token;
    const sessionSecretKey = store.getState().user.session_secret_key;

    const onSuccess = function (request) {
        return request.data;
    };
    const onError = function (request) {
        return Promise.reject(request.data);
    };
    return psonoServer
        .webauthnVerify(token, sessionSecretKey, credential)
        .then(onSuccess, onError);
}

const webauthnService = {
    verifyWebauthnInit,
    verifyWebauthn,
};

export default webauthnService;
