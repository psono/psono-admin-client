/**
 * Ivalt and all the functions to create / edit / delete it ...
 */

import psono_server from './api-server';
import store from './store';

function sendTwoFactorNotification() {
    const token = store.getState().user.token;
    const sessionSecretKey = store.getState().user.session_secret_key;
    const onSuccess = function () {
        return true;
    };
    const onError = function () {
        return false;
    };
    return psono_server
        .ivaltVerify(token, sessionSecretKey, 'notification')
        .then(onSuccess, onError);
}

function validateIvaltTwoFactor() {
    const token = store.getState().user.token;
    const sessionSecretKey = store.getState().user.session_secret_key;
    const onSuccess = function (res) {
        return res;
    };
    const onError = function (res) {
        return res;
    };
    return psono_server
        .ivaltVerify(token, sessionSecretKey, 'verification')
        .then(onSuccess, onError);
}

const ivaltService = {
    sendTwoFactorNotification,
    validateIvaltTwoFactor,
};

export default ivaltService;
