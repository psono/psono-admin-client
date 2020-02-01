/**
 * Users service, everything about login / logout ...
 */

import action from '../actions/boundActionCreators';
import host from './host';
import psono_server from './api-server';
import cryptoLibrary from './cryptoLibrary';
import helper from './helper';
import store from './store';
import device from './device';
import notification from './notification';
import browserClient from './browser-client';

let session_password = '';
let verification = {};

/**
 * Updates the global state with username, server, remember_me and trust_device
 * Returns the result of check_host
 *
 * @param username
 * @param server
 * @param remember_me
 * @param trust_device
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function initiate_login(username, server, remember_me, trust_device) {
    action.set_server_url(server);
    let parsed_url = helper.parse_url(server);

    username = helper.form_full_username(username, parsed_url['full_domain']);
    action.set_user_username(username);
    action.set_user_info_1(remember_me, trust_device);

    return host.check_host(server).then(response => {
        return response;
    });
}

/**
 * Triggered once someone comes back from a redirect to a index.html#!/saml/token/... url
 * Will try to use the token to authenticate and login
 *
 * @param {string} saml_token_id The saml token id
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function saml_login(saml_token_id) {
    const server_public_key = store.getState().server.public_key;
    const session_keys = cryptoLibrary.generate_public_private_keypair();
    const onSuccess = function(response) {
        response.data = JSON.parse(
            cryptoLibrary.decrypt_data_public_key(
                response.data.login_info,
                response.data.login_info_nonce,
                server_public_key,
                session_keys.private_key
            )
        );
        const server_session_public_key =
            response.data.server_session_public_key;

        response.data = JSON.parse(
            cryptoLibrary.decrypt_data_public_key(
                response.data.data,
                response.data.data_nonce,
                server_session_public_key,
                session_keys.private_key
            )
        );

        // decrypt user private key
        const user_private_key = cryptoLibrary.decrypt_secret(
            response.data.user.private_key,
            response.data.user.private_key_nonce,
            response.data.password,
            response.data.user.user_sauce
        );
        session_password = response.data.password;

        // decrypt the user_validator
        const user_validator = cryptoLibrary.decrypt_data_public_key(
            response.data.user_validator,
            response.data.user_validator_nonce,
            server_session_public_key,
            user_private_key
        );

        // encrypt the validator as verification
        verification = cryptoLibrary.encrypt_data(
            user_validator,
            response.data.session_secret_key
        );

        action.set_user_username(response.data.user.username);

        action.set_user_info_2(
            user_private_key,
            response.data.user.public_key,
            response.data.session_secret_key,
            response.data.token,
            response.data.user.user_sauce
        );

        const required_multifactors = response.data.required_multifactors;

        return required_multifactors;
    };

    const onError = function(response) {
        return Promise.reject(response.data);
    };

    let login_info = {
        saml_token_id: saml_token_id,
        device_time: new Date().toISOString(),
        device_fingerprint: device.get_device_fingerprint(),
        device_description: device.get_device_description()
    };

    login_info = JSON.stringify(login_info);

    // encrypt the login infos
    const login_info_enc = cryptoLibrary.encrypt_data_public_key(
        login_info,
        server_public_key,
        session_keys.private_key
    );

    let session_duration = 24 * 60 * 60;

    return psono_server
        .saml_login(
            login_info_enc['text'],
            login_info_enc['nonce'],
            session_keys.public_key,
            session_duration
        )
        .then(onSuccess, onError);
}

/**
 * Updates the global state with server, remember_me and trust_device
 * Returns the result of check_host
 *
 * @param server
 * @param remember_me
 * @param trust_device
 * @returns {Promise<AxiosResponse<any>>}
 */
function initiate_saml_login(server, remember_me, trust_device) {
    action.set_server_url(server);
    action.set_user_info_1(remember_me, trust_device);

    return host.check_host(server).then(response => {
        return response;
    });
}

/**
 * Takes the provider id and returns (as a promise) the redirect url to initiate the saml auth flow
 *
 * @param provider_id
 *
 * @returns {promise}
 */
function get_saml_redirect_url(provider_id) {
    const return_to_url = browserClient.get_saml_return_to_url();

    return psono_server
        .saml_initiate_login(provider_id, return_to_url)
        .then(result => {
            return result.data;
        });
}

/**
 * Ajax POST request to the backend with the token
 *
 * @param {string} ga_token The GA Token
 *
 * @returns Promise<AxiosResponse<any>> Returns a promise with the login status
 */
function ga_verify(ga_token) {
    const token = store.getState().user.token;
    const session_secret_key = store.getState().user.session_secret_key;

    return psono_server
        .ga_verify(token, ga_token, session_secret_key)
        .catch(response => {
            if (
                response.hasOwnProperty('data') &&
                response.data.hasOwnProperty('non_field_errors')
            ) {
                return Promise.reject(response.data.non_field_errors);
            } else {
                return Promise.reject(response);
            }
        });
}

/**
 * Ajax POST request to the backend with the token
 *
 * @param {string} [duo_token] (optional) The Duo Token
 *
 * @returns Promise<AxiosResponse<any>> Returns a promise with the login status
 */
function duo_verify(duo_token) {
    const token = store.getState().user.token;
    const session_secret_key = store.getState().user.session_secret_key;

    return psono_server
        .duo_verify(token, duo_token, session_secret_key)
        .catch(response => {
            if (
                response.hasOwnProperty('data') &&
                response.data.hasOwnProperty('non_field_errors')
            ) {
                return Promise.reject(response.data.non_field_errors);
            } else {
                return Promise.reject(response);
            }
        });
}

/**
 * Ajax POST request to the backend with the token
 *
 * @param {string} yubikey_otp The YubiKey OTP token
 *
 * @returns Promise<AxiosResponse<any>> Returns a promise with the login status
 */
function yubikey_otp_verify(yubikey_otp) {
    const token = store.getState().user.token;
    const session_secret_key = store.getState().user.session_secret_key;

    return psono_server
        .yubikey_otp_verify(token, yubikey_otp, session_secret_key)
        .catch(response => {
            if (
                response.hasOwnProperty('data') &&
                response.data.hasOwnProperty('non_field_errors')
            ) {
                return Promise.reject(response.data.non_field_errors);
            } else {
                return Promise.reject(response);
            }
        });
}

/**
 * Handles the validation of the token with the server by solving the cryptographic puzzle
 *
 * @returns Promise<AxiosResponse<any>> Returns a promise with the the final activate token was successful or not
 */
function activate_token() {
    const token = store.getState().user.token;
    const session_secret_key = store.getState().user.session_secret_key;
    const user_sauce = store.getState().user.user_sauce;

    const onSuccess = function(activation_data) {
        // decrypt user secret key
        const user_secret_key = cryptoLibrary.decrypt_secret(
            activation_data.data.user.secret_key,
            activation_data.data.user.secret_key_nonce,
            session_password,
            user_sauce
        );

        action.set_user_info_3(
            activation_data.data.user.id,
            activation_data.data.user.email,
            user_secret_key
        );

        // no need anymore for the public / private session keys
        session_password = '';
        verification = {};

        return {
            response: 'success'
        };
    };

    return psono_server
        .activate_token(
            token,
            verification.text,
            verification.nonce,
            session_secret_key
        )
        .then(onSuccess);
}

/**
 * handles the response of the login with all the necessary cryptography and returns the required multifactors
 *
 * @param {object} response The login response
 * @param {string} password The password
 * @param {object} session_keys The session keys
 * @param {string} server_public_key The server's public key
 *
 * @returns {Array} The list of required multifactor challenges to solve
 */
function handle_login_response(
    response,
    password,
    session_keys,
    server_public_key
) {
    response.data = JSON.parse(
        cryptoLibrary.decrypt_data_public_key(
            response.data.login_info,
            response.data.login_info_nonce,
            server_public_key,
            session_keys.private_key
        )
    );

    const token = response.data.token;
    const user_sauce = response.data.user.user_sauce;
    const user_public_key = response.data.user.public_key;
    session_password = password;

    // decrypt the session key
    const session_secret_key = cryptoLibrary.decrypt_data_public_key(
        response.data.session_secret_key,
        response.data.session_secret_key_nonce,
        response.data.session_public_key,
        session_keys.private_key
    );

    // decrypt user private key
    const user_private_key = cryptoLibrary.decrypt_secret(
        response.data.user.private_key,
        response.data.user.private_key_nonce,
        password,
        user_sauce
    );

    // decrypt the user_validator
    const user_validator = cryptoLibrary.decrypt_data_public_key(
        response.data.user_validator,
        response.data.user_validator_nonce,
        response.data.session_public_key,
        user_private_key
    );

    // encrypt the validator as verification
    verification = cryptoLibrary.encrypt_data(
        user_validator,
        session_secret_key
    );

    action.set_user_info_2(
        user_private_key,
        user_public_key,
        session_secret_key,
        token,
        user_sauce
    );

    const required_multifactors = response.data['required_multifactors'];

    return required_multifactors;
}

function login(password, server_info, send_plain) {
    const username = store.getState().user.username;
    const trust_device = store.getState().user.trust_device;
    const server_public_key = server_info.info.public_key;

    let authkey = cryptoLibrary.generate_authkey(username, password);

    const session_keys = cryptoLibrary.generate_public_private_keypair();

    const onSuccess = function(response) {
        return handle_login_response(
            response,
            password,
            session_keys,
            server_public_key
        );
    };

    const onError = function(response) {
        if (
            response.hasOwnProperty('data') &&
            response.data.hasOwnProperty('non_field_errors')
        ) {
            return Promise.reject(response.data.non_field_errors);
        } else {
            return Promise.reject(response);
        }
    };

    let login_info = {
        username: username,
        authkey: authkey,
        device_time: new Date().toISOString(),
        device_fingerprint: device.get_device_fingerprint(),
        device_description: device.get_device_description()
    };

    if (send_plain) {
        login_info['password'] = password;
    }

    login_info = JSON.stringify(login_info);

    // encrypt the login infos
    const login_info_enc = cryptoLibrary.encrypt_data_public_key(
        login_info,
        server_public_key,
        session_keys.private_key
    );

    let session_duration = 24 * 60 * 60;
    if (trust_device) {
        session_duration = 24 * 60 * 60 * 30;
    }

    return psono_server
        .login(
            login_info_enc['text'],
            login_info_enc['nonce'],
            session_keys.public_key,
            session_duration
        )
        .then(onSuccess, onError);
}

/**
 * Initiates the logout, deletes all data including user tokens and session secrets
 *
 * @param {string} msg An optional message to display
 */
function logout(msg = '') {
    const token = store.getState().user.token;
    const session_secret_key = store.getState().user.session_secret_key;

    psono_server.logout(token, session_secret_key);
    action.logout(store.getState().user.remember_me);
    if (msg) {
        notification.info_send(msg);
    }
}

function is_logged_in() {
    return store.getState().user.isLoggedIn;
}

const service = {
    initiate_login,
    saml_login,
    initiate_saml_login,
    get_saml_redirect_url,
    login,
    activate_token,
    ga_verify,
    duo_verify,
    yubikey_otp_verify,
    logout,
    is_logged_in
};

export default service;
