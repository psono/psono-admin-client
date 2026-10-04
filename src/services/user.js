/**
 * Users service, everything about login / logout ...
 */

import action from '../actions/boundActionCreators';
import host from './host';
import apiClient from './api-server';
import cryptoLibrary from './cryptoLibrary';
import helper from './helper';
import store from './store';
import device from './device';
import notification from './notification';
import browserClient from './browser-client';
import i18n from '../i18n';
import { getHashingSettings } from './hashing-parameters';

let sessionPassword = '';
let verification = {};

/**
 * Updates the global state with username, server, remember_me and trust_device
 * Returns the result of checkHost
 *
 * @param username
 * @param server
 * @param remember_me
 * @param trust_device
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function initiateLogin(username, server, remember_me, trust_device) {
    action.setServerUrl(server);
    let parsed_url = helper.parse_url(server);

    username = helper.form_full_username(username, parsed_url['full_domain']);
    action.setUserUsername(username);
    action.setUserInfo1(remember_me, trust_device);

    return host.checkHost(server).then((response) => {
        return response;
    });
}

/**
 * Triggered once someone comes back from a redirect to a index.html#!/saml/token/... url
 * Will try to use the token to authenticate and login
 *
 * @param {string} samlTokenId The saml token id
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function samlLogin(samlTokenId) {
    const serverPublicKey = store.getState().server.public_key;
    const sessionKeys = cryptoLibrary.generatePublicPrivateKeypair();
    const password = '';
    const onSuccess = function (response) {
        return handleLoginResponse(
            response,
            password,
            sessionKeys,
            serverPublicKey,
            'SAML'
        );
    };

    const onError = function (response) {
        return Promise.reject(response.data);
    };

    let login_info = {
        saml_token_id: samlTokenId,
        device_time: new Date().toISOString(),
        device_fingerprint: device.getDeviceFingerprint(),
        device_description: device.getDeviceDescription(),
    };

    login_info = JSON.stringify(login_info);

    // encrypt the login infos
    const loginInfoEnc = cryptoLibrary.encryptDataPublicKey(
        login_info,
        serverPublicKey,
        sessionKeys.private_key
    );

    let sessionDuration = 24 * 60 * 60;
    const trustDevice = store.getState().user.trust_device;
    if (trustDevice) {
        sessionDuration = 24 * 60 * 60 * 30;
    }

    return apiClient
        .samlLogin(
            loginInfoEnc['text'],
            loginInfoEnc['nonce'],
            sessionKeys.public_key,
            sessionDuration
        )
        .then(onSuccess, onError);
}

/**
 * Updates the global state with server, remember_me and trust_device
 * Returns the result of checkHost
 *
 * @param server
 * @param remember_me
 * @param trust_device
 * @returns {Promise<AxiosResponse<any>>}
 */
function initiateSamlLogin(server, remember_me, trust_device) {
    action.setServerUrl(server);
    action.setUserInfo1(remember_me, trust_device);

    return host.checkHost(server).then((response) => {
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

    return apiClient
        .samlInitiateLogin(provider_id, return_to_url)
        .then((result) => {
            return result.data;
        });
}

/**
 * Triggered once someone comes back from a redirect to a index.html#!/oidc/token/... url
 * Will try to use the token to authenticate and login
 *
 * @param {string} oidcTokenId The oidc token id
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function oidcLogin(oidcTokenId) {
    const serverPublicKey = store.getState().server.public_key;
    const sessionKeys = cryptoLibrary.generatePublicPrivateKeypair();
    const password = '';
    const onSuccess = function (response) {
        return handleLoginResponse(
            response,
            password,
            sessionKeys,
            serverPublicKey,
            'OIDC'
        );
    };

    const onError = function (response) {
        return Promise.reject(response.data);
    };

    let login_info = {
        oidc_token_id: oidcTokenId,
        device_time: new Date().toISOString(),
        device_fingerprint: device.getDeviceFingerprint(),
        device_description: device.getDeviceDescription(),
    };

    login_info = JSON.stringify(login_info);

    // encrypt the login infos
    const loginInfoEnc = cryptoLibrary.encryptDataPublicKey(
        login_info,
        serverPublicKey,
        sessionKeys.private_key
    );

    let sessionDuration = 24 * 60 * 60;
    const trustDevice = store.getState().user.trust_device;
    if (trustDevice) {
        sessionDuration = 24 * 60 * 60 * 30;
    }

    return apiClient
        .oidcLogin(
            loginInfoEnc['text'],
            loginInfoEnc['nonce'],
            sessionKeys.public_key,
            sessionDuration
        )
        .then(onSuccess, onError);
}

/**
 * Updates the global state with server, remember_me and trust_device
 * Returns the result of checkHost
 *
 * @param server
 * @param remember_me
 * @param trust_device
 * @returns {Promise<AxiosResponse<any>>}
 */
function initiateOidcLogin(server, remember_me, trust_device) {
    action.setServerUrl(server);
    action.setUserInfo1(remember_me, trust_device);

    return host.checkHost(server).then((response) => {
        return response;
    });
}

/**
 * Takes the provider id and returns (as a promise) the redirect url to initiate the oidc auth flow
 *
 * @param provider_id
 *
 * @returns {promise}
 */
function get_oidc_redirect_url(provider_id) {
    const return_to_url = browserClient.get_oidc_return_to_url();

    return apiClient
        .oidcInitiateLogin(provider_id, return_to_url)
        .then((result) => {
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

    return apiClient
        .ga_verify(token, ga_token, session_secret_key)
        .catch((response) => {
            if (
                response.hasOwnProperty('data') &&
                response.data.hasOwnProperty('non_field_errors')
            ) {
                return Promise.reject(response.data.non_field_errors);
            } else if (
                response.hasOwnProperty('data') &&
                response.data.hasOwnProperty('ga_token')
            ) {
                return Promise.reject(response.data.ga_token);
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

    return apiClient
        .duo_verify(token, duo_token, session_secret_key)
        .catch((response) => {
            if (
                response.hasOwnProperty('data') &&
                response.data.hasOwnProperty('non_field_errors')
            ) {
                return Promise.reject(response.data.non_field_errors);
            } else if (
                response.hasOwnProperty('data') &&
                response.data.hasOwnProperty('duo_token')
            ) {
                return Promise.reject(response.data.duo_token);
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

    return apiClient
        .yubikey_otp_verify(token, yubikey_otp, session_secret_key)
        .catch((response) => {
            if (
                response.hasOwnProperty('data') &&
                response.data.hasOwnProperty('non_field_errors')
            ) {
                return Promise.reject(response.data.non_field_errors);
            } else if (
                response.hasOwnProperty('data') &&
                response.data.hasOwnProperty('yubikey_otp')
            ) {
                return Promise.reject(response.data.yubikey_otp);
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
function activateToken() {
    const token = store.getState().user.token;
    const sessionSecretKey = store.getState().user.session_secret_key;
    const userSauce = store.getState().user.user_sauce;
    const hashingAlgorithm = store.getState().user.hashingAlgorithm;
    const hashingParameters = store.getState().user.hashingParameters;

    const onSuccess = function (activationData) {
        // decrypt user secret key
        const userSecretKey = cryptoLibrary.decryptSecret(
            activationData.data.user.secret_key,
            activationData.data.user.secret_key_nonce,
            sessionPassword,
            userSauce,
            hashingAlgorithm,
            hashingParameters
        );

        let serverSecretExists = ['SAML', 'OIDC', 'LDAP'].includes(
            activationData.data.user.authentication
        );
        if (activationData.data.user.hasOwnProperty('server_secret_exists')) {
            serverSecretExists = activationData.data.user.server_secret_exists;
        }

        action.setUserInfo3(
            activationData.data.user.id,
            activationData.data.user.email,
            userSecretKey,
            serverSecretExists,
            activationData.data.user.require_password_change || false
        );

        // no need anymore for the public / private session keys
        sessionPassword = '';
        verification = {};

        return apiClient
            .admin_authorization(token, sessionSecretKey)
            .then((response) => {
                action.setAuthorization(response.data);
                return {
                    response: 'success',
                };
            })
            .catch((error) => {
                action.logout(store.getState().user.remember_me);
                return Promise.reject(error);
            });
    };

    return apiClient
        .activateToken(
            token,
            verification.text,
            verification.nonce,
            sessionSecretKey
        )
        .then(onSuccess);
}

/**
 * handles the response of the login with all the necessary cryptography and returns the required multifactors
 *
 * @param {object} response The login response
 * @param {string} password The password
 * @param {object} sessionKeys The session keys
 * @param {string} serverPublicKey The server's public key
 * @param {string} defaultAuthentication The default authentication if not provided by the server
 *
 * @returns {Array} The list of required multifactor challenges to solve
 */
function handleLoginResponse(
    response,
    password,
    sessionKeys,
    serverPublicKey,
    defaultAuthentication
) {
    const loginEnvelope = JSON.parse(
        cryptoLibrary.decryptDataPublicKey(
            response.data.login_info,
            response.data.login_info_nonce,
            serverPublicKey,
            sessionKeys.private_key
        )
    );
    const server_session_public_key =
        loginEnvelope.server_session_public_key ||
        loginEnvelope.session_public_key;
    let decrypted_response_data;

    if (
        Object.hasOwn(loginEnvelope, 'data') &&
        Object.hasOwn(loginEnvelope, 'data_nonce')
    ) {
        decrypted_response_data = JSON.parse(
            cryptoLibrary.decryptDataPublicKey(
                loginEnvelope.data,
                loginEnvelope.data_nonce,
                server_session_public_key,
                sessionKeys.private_key
            )
        );
    } else {
        decrypted_response_data = loginEnvelope;
    }

    if (!Object.hasOwn(decrypted_response_data.user, 'hashing_algorithm')) {
        decrypted_response_data.user.hashing_algorithm =
            defaultAuthentication === 'AUTHKEY'
                ? store.getState().user.hashingAlgorithm
                : 'scrypt';
    }
    if (!Object.hasOwn(decrypted_response_data.user, 'hashing_parameters')) {
        decrypted_response_data.user.hashing_parameters =
            defaultAuthentication === 'AUTHKEY'
                ? store.getState().user.hashingParameters
                : undefined;
    }
    if (
        !Object.hasOwn(decrypted_response_data.user, 'require_password_change')
    ) {
        decrypted_response_data.user.require_password_change = false;
    }
    const { hashingAlgorithm, hashingParameters } = getHashingSettings(
        decrypted_response_data.user.hashing_algorithm,
        decrypted_response_data.user.hashing_parameters
    );
    Object.assign(decrypted_response_data.user, {
        hashing_algorithm: hashingAlgorithm,
        hashing_parameters: hashingParameters,
    });
    action.sethashingParameters(
        decrypted_response_data.user.hashing_algorithm,
        decrypted_response_data.user.hashing_parameters
    );

    sessionPassword =
        password || !decrypted_response_data.hasOwnProperty('password')
            ? password
            : decrypted_response_data.password;

    // decrypt the session key
    let sessionSecretKey = decrypted_response_data.session_secret_key;
    if (decrypted_response_data.hasOwnProperty('session_secret_key_nonce')) {
        sessionSecretKey = cryptoLibrary.decryptDataPublicKey(
            decrypted_response_data.session_secret_key,
            decrypted_response_data.session_secret_key_nonce,
            decrypted_response_data.session_public_key,
            sessionKeys.private_key
        );
    }

    const authentication = decrypted_response_data.user.authentication
        ? decrypted_response_data.user.authentication
        : defaultAuthentication;

    let user_private_key;
    try {
        // decrypt user private key which may fail if the user server's password isn't correct and the user
        // needs to enter one
        user_private_key = cryptoLibrary.decryptSecret(
            decrypted_response_data.user.private_key,
            decrypted_response_data.user.private_key_nonce,
            sessionPassword,
            decrypted_response_data.user.user_sauce,
            decrypted_response_data.user.hashing_algorithm,
            decrypted_response_data.user.hashing_parameters
        );
    } catch (error) {
        return {
            require_password: (password) =>
                handleLoginResponse(
                    response,
                    password,
                    sessionKeys,
                    serverPublicKey,
                    defaultAuthentication
                ),
        };
    }

    // decrypt the user_validator
    const user_validator = cryptoLibrary.decryptDataPublicKey(
        decrypted_response_data.user_validator,
        decrypted_response_data.user_validator_nonce,
        server_session_public_key,
        user_private_key
    );

    // encrypt the validator as verification
    verification = cryptoLibrary.encryptData(user_validator, sessionSecretKey);

    action.setUserUsername(decrypted_response_data.user.username);

    action.setUserInfo2(
        user_private_key,
        decrypted_response_data.user.public_key,
        sessionSecretKey,
        decrypted_response_data.token,
        decrypted_response_data.user.user_sauce,
        authentication
    );

    if (
        decrypted_response_data.user.hasOwnProperty('language') &&
        i18n.options.supportedLngs.includes(
            decrypted_response_data.user.language
        )
    ) {
        i18n.changeLanguage(decrypted_response_data.user.language);
    }

    return decrypted_response_data;
}

function prelogin(username) {
    const onSuccess = function (response) {
        if (
            !Object.hasOwn(response.data, 'hashing_algorithm') ||
            response.data.hashing_algorithm !== 'scrypt'
        ) {
            return Promise.reject('UNSUPPORTED_ALGORITHM_UPDATE_CLIENT');
        }
        if (!Object.hasOwn(response.data, 'hashing_parameters')) {
            return Promise.reject('UNSUPPORTED_ALGORITHM_UPDATE_CLIENT');
        }
        try {
            getHashingSettings(
                response.data.hashing_algorithm,
                response.data.hashing_parameters
            );
        } catch (error) {
            return Promise.reject(error.message);
        }
        return response;
    };

    const onError = function (response) {
        if (
            Object.hasOwn(response, 'data') &&
            Object.hasOwn(response.data, 'non_field_errors')
        ) {
            return Promise.reject(response.data.non_field_errors);
        } else {
            return Promise.reject(response);
        }
    };

    return apiClient.prelogin(username).then(onSuccess, onError);
}

function login(password, serverInfo, sendPlain) {
    const username = store.getState().user.username;
    const trustDevice = store.getState().user.trust_device;
    const serverPublicKey = serverInfo.info.public_key;

    const onSuccess = function (response) {
        action.sethashingParameters(
            response.data.hashing_algorithm,
            response.data.hashing_parameters
        );
        const authkey = cryptoLibrary.generateAuthkey(
            username,
            password,
            response.data.hashing_algorithm,
            response.data.hashing_parameters
        );
        const sessionKeys = cryptoLibrary.generatePublicPrivateKeypair();

        const onSuccess = function (response) {
            return handleLoginResponse(
                response,
                password,
                sessionKeys,
                serverPublicKey,
                'AUTHKEY'
            );
        };
        const onError = function (response) {
            if (
                Object.hasOwn(response, 'data') &&
                Object.hasOwn(response.data, 'non_field_errors')
            ) {
                return Promise.reject(response.data.non_field_errors);
            } else {
                return Promise.reject(response);
            }
        };

        const loginInfo = {
            username: username,
            authkey: authkey,
            device_time: new Date().toISOString(),
            device_fingerprint: device.getDeviceFingerprint(),
            device_description: device.getDeviceDescription(),
        };
        if (sendPlain) {
            loginInfo.password = password;
        }

        const loginInfoEnc = cryptoLibrary.encryptDataPublicKey(
            JSON.stringify(loginInfo),
            serverPublicKey,
            sessionKeys.private_key
        );
        let sessionDuration = 24 * 60 * 60;
        if (trustDevice) {
            sessionDuration = 24 * 60 * 60 * 30;
        }

        return apiClient
            .login(
                loginInfoEnc.text,
                loginInfoEnc.nonce,
                sessionKeys.public_key,
                sessionDuration
            )
            .then(onSuccess, onError);
    };
    const onError = (response) => Promise.reject(response);

    return prelogin(username).then(onSuccess, onError);
}

function updateUser(
    email,
    authkey,
    authkeyOld,
    privateKey,
    privateKeyNonce,
    secretKey,
    secretKeyNonce,
    language,
    hashingAlgorithm,
    hashingParameters
) {
    const token = store.getState().user.token;
    const sessionSecretKey = store.getState().user.session_secret_key;
    return apiClient.updateUser(
        token,
        sessionSecretKey,
        email,
        authkey,
        authkeyOld,
        privateKey,
        privateKeyNonce,
        secretKey,
        secretKeyNonce,
        language,
        hashingAlgorithm,
        hashingParameters
    );
}

/**
 * Initiates the logout, deletes all data including user tokens and session secrets
 *
 * @param {string} msg An optional message to display
 */
function logout(msg = '') {
    const token = store.getState().user.token;
    const session_secret_key = store.getState().user.session_secret_key;

    apiClient.logout(token, session_secret_key);
    action.logout(store.getState().user.remember_me);
    if (msg) {
        notification.infoSend(msg);
    }
}

function isLoggedIn() {
    return store.getState().user.isLoggedIn;
}

/**
 * Saves a new password for the currently authenticated user
 *
 * @param {string} newPassword The new password
 * @param {string} newPasswordRepeat The repeated new password
 * @param {string} oldPassword The old password
 *
 * @returns {Promise<{msgs: string[]}>}
 */
function saveNewPassword(newPassword, newPasswordRepeat, oldPassword) {
    const passwordValidation = helper.is_valid_password(
        newPassword,
        newPasswordRepeat
    );
    if (passwordValidation !== true) {
        return Promise.reject({ errors: [passwordValidation] });
    }

    if (!oldPassword || oldPassword.length === 0) {
        return Promise.reject({ errors: ['OLD_PASSWORD_REQUIRED'] });
    }

    const username = store.getState().user.username;
    const userPrivateKey = store.getState().user.user_private_key;
    const userSecretKey = store.getState().user.user_secret_key;
    const userSauce = store.getState().user.user_sauce;
    const hashingAlgorithm = store.getState().user.hashingAlgorithm;
    const hashingParameters = store.getState().user.hashingParameters;
    const authkeyOld = cryptoLibrary.generateAuthkey(
        username,
        oldPassword,
        hashingAlgorithm,
        hashingParameters
    );
    const newAuthkey = cryptoLibrary.generateAuthkey(
        username,
        newPassword,
        hashingAlgorithm,
        hashingParameters
    );

    const privKeyEnc = cryptoLibrary.encryptSecret(
        userPrivateKey,
        newPassword,
        userSauce,
        hashingAlgorithm,
        hashingParameters
    );
    const secretKeyEnc = cryptoLibrary.encryptSecret(
        userSecretKey,
        newPassword,
        userSauce,
        hashingAlgorithm,
        hashingParameters
    );

    const onSuccess = () => {
        action.setRequirePasswordChange(false);
        return { msgs: ['SAVE_SUCCESS'] };
    };
    const onError = () =>
        Promise.reject({ errors: ['OLD_PASSWORD_INCORRECT'] });
    return updateUser(
        null,
        newAuthkey,
        authkeyOld,
        privKeyEnc.text,
        privKeyEnc.nonce,
        secretKeyEnc.text,
        secretKeyEnc.nonce,
        undefined,
        hashingAlgorithm,
        hashingParameters
    ).then(onSuccess, onError);
}

/**
 * Saves a new language for the currently authenticated user
 *
 * @param {string} language The new language
 *
 * @returns {Promise<{msgs: string[]}>}
 */
function saveNewLanguage(language) {
    return updateUser(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        language
    ).then(
        () => ({ msgs: ['SAVE_SUCCESS'] }),
        (result) => Promise.reject(result)
    );
}

const service = {
    initiateLogin,
    samlLogin,
    initiateSamlLogin,
    get_saml_redirect_url,
    oidcLogin,
    initiateOidcLogin,
    get_oidc_redirect_url,
    login,
    activateToken,
    ga_verify,
    duo_verify,
    yubikey_otp_verify,
    logout,
    isLoggedIn,
    saveNewPassword,
    saveNewLanguage,
};

export default service;
