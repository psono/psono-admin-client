/**
 * Server Service, implements the Psono API
 */

import axios from 'axios';
import store from './store';
import cryptoLibrary from './cryptoLibrary';
import user from './user';
import device from './device';
import i18n from '../i18n';

/**
 * Decrypts data with a secret
 * @param session_secret_key
 * @param data
 * @returns {*}
 */
function decrypt_data(session_secret_key, data) {
    if (
        session_secret_key &&
        data !== null &&
        data.hasOwnProperty('data') &&
        data.data.hasOwnProperty('text') &&
        data.data.hasOwnProperty('nonce')
    ) {
        data.data = JSON.parse(
            cryptoLibrary.decrypt_data(
                data.data.text,
                data.data.nonce,
                session_secret_key
            )
        );
    }

    return data;
}

/**
 * Helper function that handled the actual requests and encrypts them and decrypts the result (if applicable)
 *
 * @param {function} method
 * @param {string} endpoint
 * @param {object} data
 * @param {object} headers
 * @param {string} session_secret_key
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function call(method, endpoint, data, headers, session_secret_key) {
    const url = store.getState().server.url + endpoint;

    if (session_secret_key && data !== null) {
        data = cryptoLibrary.encrypt_data(
            JSON.stringify(data),
            session_secret_key
        );
    }

    if (
        session_secret_key &&
        headers &&
        headers.hasOwnProperty('Authorization')
    ) {
        const validator = {
            request_time: new Date().toISOString(),
            request_device_fingerprint: device.get_device_fingerprint(),
        };
        headers['Authorization-Validator'] = JSON.stringify(
            cryptoLibrary.encrypt_data(
                JSON.stringify(validator),
                session_secret_key
            )
        );
    }

    return new Promise((resolve, reject) => {
        axios({
            method,
            url,
            data,
            headers,
        })
            .then((data) => {
                resolve(decrypt_data(session_secret_key, data));
            })
            .catch(function (error) {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    if (error.response.status === 403 && user.is_logged_in()) {
                        // User did not have permission
                        user.logout(i18n.t('PERMISSION_DENIED'));
                    }
                    if (error.response.status === 401 && user.is_logged_in()) {
                        // session expired, lets log the user out
                        user.logout(i18n.t('SESSION_EXPIRED'));
                    }
                    console.log(error.response);
                    return reject(
                        decrypt_data(session_secret_key, error.response)
                    );
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log(error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                }
                console.log(error.config);
                reject({ errors: ['Server offline.'] });
            });
    });
}

/**
 * GET: Returns the server info
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function info() {
    const endpoint = '/info/';
    const method = 'GET';
    const data = null;
    const headers = null;

    return call(method, endpoint, data, headers);
}

/**
 * GET: Returns the server healthcheck
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function healthcheck() {
    const endpoint = '/healthcheck/';
    const method = 'GET';
    const data = null;
    const headers = null;

    return call(method, endpoint, data, headers);
}

/**
 * GET: Returns the statistics for browser
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_stats_browser(token, session_secret_key) {
    const endpoint = '/admin/stats/browser/';
    const method = 'GET';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * GET: Returns the statistics for devices
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_stats_device(token, session_secret_key) {
    const endpoint = '/admin/stats/device/';
    const method = 'GET';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * GET: Returns the statistics for the OS
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_stats_os(token, session_secret_key) {
    const endpoint = '/admin/stats/os/';
    const method = 'GET';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * GET: Returns the statistics for two factor
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_stats_two_factor(token, session_secret_key) {
    const endpoint = '/admin/stats/two-factor/';
    const method = 'GET';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * GET: Returns the server info (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_info(token, session_secret_key) {
    const endpoint = '/admin/info/';
    const method = 'GET';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * GET: Returns a list of all users (for administrators) or the user details of a single user
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} [user_id] (optional) The user id
 * @param {object} [params] (optional) Other search params
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_user(token, session_secret_key, user_id, params) {
    const endpoint = '/admin/user/' + (!user_id ? '' : user_id + '/');
    const method = 'GET';
    const data = null;

    const queryParams =
        !params || Object.keys(params).length === 0
            ? ''
            : '?' + new URLSearchParams(params).toString();

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(
        method,
        endpoint + queryParams,
        data,
        headers,
        session_secret_key
    );
}

/**
 * GET: Returns a list of all sessions (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {object} [params] (optional) Other search params
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_session(token, session_secret_key, params) {
    const endpoint = '/admin/session/';
    const method = 'GET';
    const data = null;

    const queryParams =
        !params || Object.keys(params).length === 0
            ? ''
            : '?' + new URLSearchParams(params).toString();

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(
        method,
        endpoint + queryParams,
        data,
        headers,
        session_secret_key
    );
}

/**
 * GET: Returns a list of all groups (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} [group_id] (optional) The group id
 * @param {object} [params] (optional) Other search params
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_group(token, session_secret_key, group_id, params) {
    const endpoint = '/admin/group/' + (!group_id ? '' : group_id + '/');
    const method = 'GET';
    const data = null;

    const queryParams =
        !params || Object.keys(params).length === 0
            ? ''
            : '?' + new URLSearchParams(params).toString();

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(
        method,
        endpoint + queryParams,
        data,
        headers,
        session_secret_key
    );
}

/**
 * GET: Returns a list of all groups (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} security_report_id (optional) The security report id
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_security_report(token, session_secret_key, security_report_id) {
    const endpoint =
        '/admin/security-report/' +
        (!security_report_id ? '' : security_report_id + '/');
    const method = 'GET';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * GET: Returns a list of all ldap users (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_ldap_user(token, session_secret_key) {
    const endpoint = '/admin/ldap/user/';
    const method = 'GET';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * GET: Returns a list of all ldap groups (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_ldap_group(token, session_secret_key) {
    const endpoint = '/admin/ldap/group/';
    const method = 'GET';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * POST: Creates a LDAP group map (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} group_id The group id of the mapping entry
 * @param {uuid} ldap_group_id The ldap group id of the mapping entry
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_ldap_create_group_map(
    token,
    session_secret_key,
    group_id,
    ldap_group_id
) {
    const endpoint = '/admin/ldap/group/map/';
    const method = 'POST';
    const data = {
        group_id: group_id,
        ldap_group_id: ldap_group_id,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * PUT: Updates a LDAP group map (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} ldap_group_map_id The group map id
 * @param {uuid} group_admin The group admin privilege
 * @param {uuid} share_admin The share admin privilege
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_ldap_update_group_map(
    token,
    session_secret_key,
    ldap_group_map_id,
    group_admin,
    share_admin
) {
    const endpoint = '/admin/ldap/group/map/';
    const method = 'PUT';
    const data = {
        ldap_group_map_id: ldap_group_map_id,
        group_admin: group_admin,
        share_admin: share_admin,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a LDAP group map (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} group_id The group id of the mapping entry
 * @param {uuid} ldap_group_id The ldap group id of the mapping entry
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_ldap_delete_group_map(
    token,
    session_secret_key,
    group_id,
    ldap_group_id
) {
    const endpoint = '/admin/ldap/group/map/';
    const method = 'DELETE';
    const data = {
        group_id: group_id,
        ldap_group_id: ldap_group_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * POST: Triggers a sync of the servers LDAP groups and the actual LDAP groups and returns a list of them (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_ldap_group_sync(token, session_secret_key) {
    const endpoint = '/admin/ldap/group/';
    const method = 'POST';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * GET: Returns a list of all SCIM groups (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_scim_group(token, session_secret_key) {
    const endpoint = '/admin/scim/group/';
    const method = 'GET';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a SCIM group (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} scim_group_id The id of the SCIM group to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_scim_group(token, session_secret_key, scim_group_id) {
    const endpoint = '/admin/scim/group/';
    const method = 'DELETE';
    const data = {
        scim_group_id: scim_group_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * GET: Returns a list of all SAML groups (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_saml_group(token, session_secret_key) {
    const endpoint = '/admin/saml/group/';
    const method = 'GET';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a SAML group (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} saml_group_id The id of the SAML group to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_saml_group(token, session_secret_key, saml_group_id) {
    const endpoint = '/admin/saml/group/';
    const method = 'DELETE';
    const data = {
        saml_group_id: saml_group_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a OIDC group (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} oidc_group_id The id of the OIDC group to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_oidc_group(token, session_secret_key, oidc_group_id) {
    const endpoint = '/admin/oidc/group/';
    const method = 'DELETE';
    const data = {
        oidc_group_id: oidc_group_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a LDAP group (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} ldap_group_id The id of the LDAP group to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_ldap_group(token, session_secret_key, ldap_group_id) {
    const endpoint = '/admin/ldap/group/';
    const method = 'DELETE';
    const data = {
        ldap_group_id: ldap_group_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * POST: Triggers a sync of the servers SAML groups and the actual SAML groups and returns a list of them (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_saml_group_sync(token, session_secret_key) {
    const endpoint = '/admin/saml/group/';
    const method = 'POST';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * POST: Creates a SCIM group map (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} group_id The group id of the mapping entry
 * @param {uuid} scim_group_id The scim group id of the mapping entry
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_scim_create_group_map(
    token,
    session_secret_key,
    group_id,
    scim_group_id
) {
    const endpoint = '/admin/scim/group/map/';
    const method = 'POST';
    const data = {
        group_id: group_id,
        scim_group_id: scim_group_id,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * PUT: Updates a SCIM group map (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} scim_group_map_id The group map id
 * @param {uuid} group_admin The group admin privilege
 * @param {uuid} share_admin The share admin privilege
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_scim_update_group_map(
    token,
    session_secret_key,
    scim_group_map_id,
    group_admin,
    share_admin
) {
    const endpoint = '/admin/scim/group/map/';
    const method = 'PUT';
    const data = {
        scim_group_map_id: scim_group_map_id,
        group_admin: group_admin,
        share_admin: share_admin,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a SCIM group map (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} group_id The group id of the mapping entry
 * @param {uuid} scim_group_id The scim group id of the mapping entry
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_scim_delete_group_map(
    token,
    session_secret_key,
    group_id,
    scim_group_id
) {
    const endpoint = '/admin/scim/group/map/';
    const method = 'DELETE';
    const data = {
        group_id: group_id,
        scim_group_id: scim_group_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * POST: Creates a SAML group map (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} group_id The group id of the mapping entry
 * @param {uuid} saml_group_id The saml group id of the mapping entry
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_saml_create_group_map(
    token,
    session_secret_key,
    group_id,
    saml_group_id
) {
    const endpoint = '/admin/saml/group/map/';
    const method = 'POST';
    const data = {
        group_id: group_id,
        saml_group_id: saml_group_id,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * PUT: Updates a SAML group map (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} saml_group_map_id The group map id
 * @param {uuid} group_admin The group admin privilege
 * @param {uuid} share_admin The share admin privilege
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_saml_update_group_map(
    token,
    session_secret_key,
    saml_group_map_id,
    group_admin,
    share_admin
) {
    const endpoint = '/admin/saml/group/map/';
    const method = 'PUT';
    const data = {
        saml_group_map_id: saml_group_map_id,
        group_admin: group_admin,
        share_admin: share_admin,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a SAML group map (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} group_id The group id of the mapping entry
 * @param {uuid} saml_group_id The saml group id of the mapping entry
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_saml_delete_group_map(
    token,
    session_secret_key,
    group_id,
    saml_group_id
) {
    const endpoint = '/admin/saml/group/map/';
    const method = 'DELETE';
    const data = {
        group_id: group_id,
        saml_group_id: saml_group_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * GET: Returns a list of all OIDC groups (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_oidc_group(token, session_secret_key) {
    const endpoint = '/admin/oidc/group/';
    const method = 'GET';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * POST: Creates a OIDC group map (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} group_id The group id of the mapping entry
 * @param {uuid} oidc_group_id The oidc group id of the mapping entry
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_oidc_create_group_map(
    token,
    session_secret_key,
    group_id,
    oidc_group_id
) {
    const endpoint = '/admin/oidc/group/map/';
    const method = 'POST';
    const data = {
        group_id: group_id,
        oidc_group_id: oidc_group_id,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * PUT: Updates a OIDC group map (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} oidc_group_map_id The group map id
 * @param {uuid} group_admin The group admin privilege
 * @param {uuid} share_admin The share admin privilege
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_oidc_update_group_map(
    token,
    session_secret_key,
    oidc_group_map_id,
    group_admin,
    share_admin
) {
    const endpoint = '/admin/oidc/group/map/';
    const method = 'PUT';
    const data = {
        oidc_group_map_id: oidc_group_map_id,
        group_admin: group_admin,
        share_admin: share_admin,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a OIDC group map (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} group_id The group id of the mapping entry
 * @param {uuid} oidc_group_id The oidc group id of the mapping entry
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_oidc_delete_group_map(
    token,
    session_secret_key,
    group_id,
    oidc_group_id
) {
    const endpoint = '/admin/oidc/group/map/';
    const method = 'DELETE';
    const data = {
        group_id: group_id,
        oidc_group_id: oidc_group_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * POST: Creates a user (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {string} username The name of the user to create
 * @param {string} email The email of the user to create
 * @param {string} password The password of the user to create
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_create_user(
    token,
    session_secret_key,
    username,
    password,
    email
) {
    const endpoint = '/admin/user/';
    const method = 'POST';
    const data = {
        username: username,
        email: email,
        password: password,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a user (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} user_id The user id of the user to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_user(token, session_secret_key, user_id) {
    const endpoint = '/admin/user/';
    const method = 'DELETE';
    const data = {
        user_id: user_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a session (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} session_id The session id of the session to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_session(token, session_secret_key, session_id) {
    const endpoint = '/admin/session/';
    const method = 'DELETE';
    const data = {
        session_id: session_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * POST: Creates a managed group (for administrators)
 * (EE Only)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {string} name The name of the group to create
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_create_group(token, session_secret_key, name) {
    const endpoint = '/admin/group/';
    const method = 'POST';
    const data = {
        name: name,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a group (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} group_id The group id of the group to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_group(token, session_secret_key, group_id) {
    const endpoint = '/admin/group/';
    const method = 'DELETE';
    const data = {
        group_id: group_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request to update a group membership with the token as authentication (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} membership_id The membership id to update
 * @param {boolean} group_admin Weather the users should have group admin rights or not
 * @param {boolean} share_admin Weather the users should have share admin rights or not
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function admin_update_membership(
    token,
    session_secret_key,
    membership_id,
    group_admin,
    share_admin
) {
    const endpoint = '/admin/membership/';
    const method = 'PUT';
    const data = {
        membership_id: membership_id,
        group_admin: group_admin,
        share_admin: share_admin,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a group membership (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} membership_id The id of the membership to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_membership(token, session_secret_key, membership_id) {
    const endpoint = '/admin/membership/';
    const method = 'DELETE';
    const data = {
        membership_id: membership_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a duo (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} duo_id The id of the duo to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_duo(token, session_secret_key, duo_id) {
    const endpoint = '/admin/duo/';
    const method = 'DELETE';
    const data = {
        duo_id: duo_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a yubikey otp (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} yubikey_otp_id The id of the yubikey otp to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_yubikey_otp(token, session_secret_key, yubikey_otp_id) {
    const endpoint = '/admin/yubikey-otp/';
    const method = 'DELETE';
    const data = {
        yubikey_otp_id: yubikey_otp_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a webauthn (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} webauthn_id The id of the webauthn to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_webauthn(token, session_secret_key, webauthn_id) {
    const endpoint = '/admin/webautn/';
    const method = 'DELETE';
    const data = {
        webauthn_id: webauthn_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a google authenticator (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} google_authenticator_id The id of the google authenticator to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_google_authenticator(
    token,
    session_secret_key,
    google_authenticator_id
) {
    const endpoint = '/admin/google-authenticator/';
    const method = 'DELETE';
    const data = {
        google_authenticator_id: google_authenticator_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a recovery code (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} recovery_code_id The id of the recovery code to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_recovery_code(
    token,
    session_secret_key,
    recovery_code_id
) {
    const endpoint = '/admin/recovery-code/';
    const method = 'DELETE';
    const data = {
        recovery_code_id: recovery_code_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a emergency code (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} emergency_code_id The id of the emergency code to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_emergency_code(
    token,
    session_secret_key,
    emergency_code_id
) {
    const endpoint = '/admin/emergency-code/';
    const method = 'DELETE';
    const data = {
        emergency_code_id: emergency_code_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a link share (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} link_share_id The id of the link share to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_link_share(token, session_secret_key, link_share_id) {
    const endpoint = '/admin/link-share/';
    const method = 'DELETE';
    const data = {
        link_share_id: link_share_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * PUT: Update a user (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} user_id The user id of the user to delete
 * @param {string} [email] (optional) The new email address
 * @param {boolean} [is_active] (optional) Activates (or deactivates) the user
 * @param {boolean} [is_email_active] (optional) Activates (or deactivates) the user
 * @param {boolean} [is_superuser] (optional) Activates (or deactivates) the user
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_update_user(
    token,
    session_secret_key,
    user_id,
    email,
    is_active,
    is_email_active,
    is_superuser
) {
    const endpoint = '/admin/user/';
    const method = 'PUT';
    const data = {
        user_id: user_id,
        email: email,
        is_active: is_active,
        is_email_active: is_email_active,
        is_superuser: is_superuser,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request to the backend with email and authkey for login, saves a token together with user_id
 * and all the different keys of a user in the apidata storage
 *
 * @param {string} login_info The encrypted login info (username, authkey, device fingerprint, device description)
 * @param {string} login_info_nonce The nonce of the login info
 * @param {string} public_key The session public key
 * @param {int} session_duration The time the session should be valid for in seconds
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the login status
 */
function login(login_info, login_info_nonce, public_key, session_duration) {
    const endpoint = '/authentication/login/';
    const method = 'POST';
    const data = {
        login_info: login_info,
        login_info_nonce: login_info_nonce,
        public_key: public_key,
        session_duration: session_duration,
    };
    const headers = null;

    return call(method, endpoint, data, headers);
}

/**
 * Ajax POST request to the backend with saml_provider_id and return_to_url. Will return an url where we have
 * to redirect the user to.
 *
 * @param {int} saml_provider_id The saml provider id
 * @param {string} return_to_url The url to index.html
 *
 * @returns {promise} Returns a promise with the login status
 */
function saml_initiate_login(saml_provider_id, return_to_url) {
    const endpoint = '/saml/' + saml_provider_id + '/initiate-login/';
    const method = 'POST';
    const data = {
        return_to_url: return_to_url,
    };
    const headers = null;

    return call(method, endpoint, data, headers);
}

/**
 * Ajax POST request to the backend with email and authkey for login, saves a token together with user_id
 * and all the different keys of a user in the apidata storage
 *
 * @param {string} login_info The encrypted login info (username, authkey, device fingerprint, device description)
 * @param {string} login_info_nonce The nonce of the login info
 * @param {string} public_key The session public key
 * @param {int} session_duration The time the session should be valid for in seconds
 *
 * @returns {promise} Returns a promise with the login status
 */
function saml_login(
    login_info,
    login_info_nonce,
    public_key,
    session_duration
) {
    const endpoint = '/saml/login/';
    const method = 'POST';
    const data = {
        login_info: login_info,
        login_info_nonce: login_info_nonce,
        public_key: public_key,
        session_duration: session_duration,
    };
    const headers = null;

    return call(method, endpoint, data, headers);
}

/**
 * Ajax POST request to the backend with oidc_provider_id and return_to_url. Will return an url where we have
 * to redirect the user to.
 *
 * @param {int} oidc_provider_id The oidc provider id
 * @param {string} return_to_url The url to index.html
 *
 * @returns {promise} Returns a promise with the login status
 */
function oidc_initiate_login(oidc_provider_id, return_to_url) {
    const endpoint = '/oidc/' + oidc_provider_id + '/initiate-login/';
    const method = 'POST';
    const data = {
        return_to_url: return_to_url,
    };
    const headers = null;

    return call(method, endpoint, data, headers);
}

/**
 * Ajax POST request to the backend with email and authkey for login, saves a token together with user_id
 * and all the different keys of a user in the apidata storage
 *
 * @param {string} login_info The encrypted login info (username, authkey, device fingerprint, device description)
 * @param {string} login_info_nonce The nonce of the login info
 * @param {string} public_key The session public key
 * @param {int} session_duration The time the session should be valid for in seconds
 *
 * @returns {promise} Returns a promise with the login status
 */
function oidc_login(
    login_info,
    login_info_nonce,
    public_key,
    session_duration
) {
    const endpoint = '/oidc/login/';
    const method = 'POST';
    const data = {
        login_info: login_info,
        login_info_nonce: login_info_nonce,
        public_key: public_key,
        session_duration: session_duration,
    };
    const headers = null;

    return call(method, endpoint, data, headers);
}

/**
 * Ajax POST request to the backend with the OATH-TOTP Token
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} ga_token The OATH-TOTP Token
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the verification status
 */
function ga_verify(token, ga_token, session_secret_key) {
    const endpoint = '/authentication/ga-verify/';
    const method = 'POST';
    const data = {
        ga_token: ga_token,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request to the backend with the Duo Token
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} [duo_token] (optional) The Duo token
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the verification status
 */
function duo_verify(token, duo_token, session_secret_key) {
    const endpoint = '/authentication/duo-verify/';
    const method = 'POST';
    const data = {
        duo_token: duo_token,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request to the backend with the YubiKey OTP Token
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} yubikey_otp The YubiKey OTP
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the verification status
 */
function yubikey_otp_verify(token, yubikey_otp, session_secret_key) {
    const endpoint = '/authentication/yubikey-otp-verify/';
    const method = 'POST';
    const data = {
        yubikey_otp: yubikey_otp,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request to activate the token
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} verification hex of first decrypted user_validator (from login) the re-encrypted with session key
 * @param {string} verification_nonce hex of the nonce of the verification
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function activate_token(
    token,
    verification,
    verification_nonce,
    session_secret_key
) {
    const endpoint = '/authentication/activate-token/';
    const method = 'POST';
    const data = {
        verification: verification,
        verification_nonce: verification_nonce,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax GET request get all sessions
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function get_sessions(token, session_secret_key) {
    const endpoint = '/authentication/sessions/';
    const method = 'GET';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request to destroy the token and logout the user
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {string|undefined} [session_id] An optional session ID to logout
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the logout status
 */
function logout(token, session_secret_key, session_id) {
    const endpoint = '/authentication/logout/';
    const method = 'POST';
    const data = {
        session_id: session_id,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request to the backend with the email and authkey, returns nothing but an email is sent to the user
 * with an activation_code for the email
 *
 * @param {string} email email address of the user
 * @param {string} username username of the user (in email format)
 * @param {string} authkey authkey gets generated by generate_authkey(email, password)
 * @param {string} public_key public_key of the public/private key pair for asymmetric encryption (sharing)
 * @param {string} private_key private_key of the public/private key pair, encrypted with encrypt_secret
 * @param {string} private_key_nonce the nonce for decrypting the encrypted private_key
 * @param {string} secret_key secret_key for symmetric encryption, encrypted with encrypt_secret
 * @param {string} secret_key_nonce the nonce for decrypting the encrypted secret_key
 * @param {string} user_sauce the random user sauce used
 * @param {string} base_url the base url for the activation link creation
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function register(
    email,
    username,
    authkey,
    public_key,
    private_key,
    private_key_nonce,
    secret_key,
    secret_key_nonce,
    user_sauce,
    base_url
) {
    const endpoint = '/authentication/register/';
    const method = 'POST';
    const data = {
        email: email,
        username: username,
        authkey: authkey,
        public_key: public_key,
        private_key: private_key,
        private_key_nonce: private_key_nonce,
        secret_key: secret_key,
        secret_key_nonce: secret_key_nonce,
        user_sauce: user_sauce,
        base_url: base_url,
    };
    const headers = null;

    return call(method, endpoint, data, headers);
}

/**
 * Ajax POST request to the backend with the activation_code for the email, returns nothing. If successful the user
 * can login afterwards
 *
 * @param {string} activation_code The activation code that has been sent via email
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the activation status
 */
function verify_email(activation_code) {
    const endpoint = '/authentication/verify-email/';
    const method = 'POST';
    const data = {
        activation_code: activation_code,
    };
    const headers = null;

    return call(method, endpoint, data, headers);
}

/**
 * AJAX PUT request to the backend with new user informations like for example a new password (means new
 * authkey) or new public key
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {string} email New email address
 * @param {string} authkey The new authkey
 * @param {string} authkey_old The old authkey
 * @param {string} private_key The (encrypted) private key
 * @param {string} private_key_nonce The nonce for the private key
 * @param {string} secret_key The (encrypted) secret key
 * @param {string} secret_key_nonce The nonce for the secret key
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the update status
 */
function update_user(
    token,
    session_secret_key,
    email,
    authkey,
    authkey_old,
    private_key,
    private_key_nonce,
    secret_key,
    secret_key_nonce
) {
    const endpoint = '/user/update/';
    const method = 'PUT';
    const data = {
        email: email,
        authkey: authkey,
        authkey_old: authkey_old,
        private_key: private_key,
        private_key_nonce: private_key_nonce,
        secret_key: secret_key,
        secret_key_nonce: secret_key_nonce,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * AJAX PUT request to the backend with the encrypted data (private_key, and secret_key) for recovery purposes
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {string} recovery_authkey The recovery_authkey (derivative of the recovery_password)
 * @param {string} recovery_data The Recovery Data, an encrypted json object
 * @param {string} recovery_data_nonce The nonce used for the encryption of the data
 * @param {string} recovery_sauce The random sauce used as salt
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the recovery_data_id
 */
function write_recoverycode(
    token,
    session_secret_key,
    recovery_authkey,
    recovery_data,
    recovery_data_nonce,
    recovery_sauce
) {
    const endpoint = '/recoverycode/';
    const method = 'POST';
    const data = {
        recovery_authkey: recovery_authkey,
        recovery_data: recovery_data,
        recovery_data_nonce: recovery_data_nonce,
        recovery_sauce: recovery_sauce,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * AJAX POST request to the backend with the recovery_authkey to initiate the reset of the password
 *
 * @param {string} username the account's username e.g dummy@example.com
 * @param {string} recovery_authkey The recovery_authkey (derivative of the recovery_password)
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the recovery_data
 */
function enable_recoverycode(username, recovery_authkey) {
    const endpoint = '/password/';
    const method = 'POST';
    const data = {
        username: username,
        recovery_authkey: recovery_authkey,
    };
    const headers = null;

    return call(method, endpoint, data, headers);
}

/**
 * AJAX POST request to the backend to actually set the new encrypted private and secret key
 *
 * @param {string} username the account's username e.g dummy@example.com
 * @param {string} recovery_authkey The recovery_authkey (derivative of the recovery_password)
 * @param {string} update_data The private and secret key object encrypted with the verifier
 * @param {string} update_data_nonce The nonce of the encrypted private and secret key object
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the recovery_data
 */
function set_password(
    username,
    recovery_authkey,
    update_data,
    update_data_nonce
) {
    const endpoint = '/password/';
    const method = 'PUT';
    const data = {
        username: username,
        recovery_authkey: recovery_authkey,
        update_data: update_data,
        update_data_nonce: update_data_nonce,
    };
    const headers = null;

    return call(method, endpoint, data, headers);
}

/**
 * Ajax GET request with the token as authentication to get the current user's datastore
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid|undefined} [datastore_id=null] (optional) the datastore ID
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function read_datastore(token, session_secret_key, datastore_id) {
    const endpoint = '/datastore/' + (!datastore_id ? '' : datastore_id + '/');
    const method = 'GET';
    const data = null;
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax PUT request to create a datatore with the token as authentication and optional already some data,
 * together with the encrypted secret key and nonce
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {string} type the type of the datastore
 * @param {string} description the description of the datastore
 * @param {string|undefined} [encrypted_data] (optional) data for the new datastore
 * @param {string|undefined} [encrypted_data_nonce] (optional) nonce for data, necessary if data is provided
 * @param {string|undefined} [is_default] (optional) Is the new default datastore of this type
 * @param {string} encrypted_data_secret_key encrypted secret key
 * @param {string} encrypted_data_secret_key_nonce nonce for secret key
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function create_datastore(
    token,
    session_secret_key,
    type,
    description,
    encrypted_data,
    encrypted_data_nonce,
    is_default,
    encrypted_data_secret_key,
    encrypted_data_secret_key_nonce
) {
    const endpoint = '/datastore/';
    const method = 'PUT';
    const data = {
        type: type,
        description: description,
        data: encrypted_data,
        data_nonce: encrypted_data_nonce,
        is_default: is_default,
        secret_key: encrypted_data_secret_key,
        secret_key_nonce: encrypted_data_secret_key_nonce,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax DELETE request with the token as authentication to delete a datastore
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} datastore_id The datastore id
 * @param {string} authkey The authkey of the user
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the status of the delete operation
 */
function delete_datastore(token, session_secret_key, datastore_id, authkey) {
    const endpoint = '/datastore/';
    const method = 'DELETE';
    const data = {
        datastore_id: datastore_id,
        authkey: authkey,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request with the token as authentication and the datastore's new content
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} datastore_id the datastore ID
 * @param {string|undefined} [encrypted_data] (optional) data for the datastore
 * @param {string|undefined} [encrypted_data_nonce] (optional) nonce for data, necessary if data is provided
 * @param {string|undefined} [encrypted_data_secret_key] (optional) encrypted secret key, wont update on the server if not provided
 * @param {string|undefined} [encrypted_data_secret_key_nonce] (optional) nonce for secret key, wont update on the server if not provided
 * @param {string|undefined} [description] (optional) The new description of the datastore
 * @param {boolean|undefined} [is_default] (optional) Is this the new default datastore
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function write_datastore(
    token,
    session_secret_key,
    datastore_id,
    encrypted_data,
    encrypted_data_nonce,
    encrypted_data_secret_key,
    encrypted_data_secret_key_nonce,
    description,
    is_default
) {
    const endpoint = '/datastore/';
    const method = 'POST';
    const data = {
        datastore_id: datastore_id,
        data: encrypted_data,
        data_nonce: encrypted_data_nonce,
        secret_key: encrypted_data_secret_key,
        secret_key_nonce: encrypted_data_secret_key_nonce,
        description: description,
        is_default: is_default,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax GET request with the token as authentication to get the current user's secret
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} secret_id secret ID
 * @param {boolean|undefined} [synchronous] (optional) Synchronous or Asynchronous
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function read_secret(token, session_secret_key, secret_id, synchronous) {
    const endpoint = '/secret/' + secret_id + '/';
    const method = 'GET';
    const data = null;
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(
        method,
        endpoint,
        data,
        headers,
        session_secret_key,
        synchronous
    );
}

/**
 * Ajax PUT request to create a datatore with the token as authentication and optional already some data,
 * together with the encrypted secret key and nonce
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {string} encrypted_data data for the new secret
 * @param {string} encrypted_data_nonce nonce for data, necessary if data is provided
 * @param {string} link_id the local id of the share in the datastructure
 * @param {string|undefined} [parent_datastore_id] (optional) id of the parent datastore, may be left empty if the share resides in a share
 * @param {string|undefined} [parent_share_id] (optional) id of the parent share, may be left empty if the share resides in the datastore
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the new secret_id
 */
function create_secret(
    token,
    session_secret_key,
    encrypted_data,
    encrypted_data_nonce,
    link_id,
    parent_datastore_id,
    parent_share_id
) {
    const endpoint = '/secret/';
    const method = 'PUT';
    const data = {
        data: encrypted_data,
        data_nonce: encrypted_data_nonce,
        link_id: link_id,
        parent_datastore_id: parent_datastore_id,
        parent_share_id: parent_share_id,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax PUT request with the token as authentication and the new secret content
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} secret_id the secret ID
 * @param {string|undefined} [encrypted_data] (optional) data for the new secret
 * @param {string|undefined} [encrypted_data_nonce] (optional) nonce for data, necessary if data is provided
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function write_secret(
    token,
    session_secret_key,
    secret_id,
    encrypted_data,
    encrypted_data_nonce
) {
    const endpoint = '/secret/';
    const method = 'POST';
    const data = {
        secret_id: secret_id,
        data: encrypted_data,
        data_nonce: encrypted_data_nonce,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request with the token as authentication to move a link between a secret and a datastore or a share
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} link_id the link id
 * @param {uuid|undefined} [new_parent_share_id=null] (optional) new parent share ID, necessary if no new_parent_datastore_id is provided
 * @param {uuid|undefined} [new_parent_datastore_id=null] (optional) new datastore ID, necessary if no new_parent_share_id is provided
 *
 * @returns {Promise<AxiosResponse<any>>} Returns promise with the status of the move
 */
function move_secret_link(
    token,
    session_secret_key,
    link_id,
    new_parent_share_id,
    new_parent_datastore_id
) {
    const endpoint = '/secret/link/';
    const method = 'POST';
    const data = {
        link_id: link_id,
        new_parent_share_id: new_parent_share_id,
        new_parent_datastore_id: new_parent_datastore_id,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax DELETE request with the token as authentication to delete the secret link
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} link_id The link id
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the status of the delete operation
 */
function delete_secret_link(token, session_secret_key, link_id) {
    const endpoint = '/secret/link/';
    const method = 'DELETE';
    const data = {
        link_id: link_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax GET request with the token as authentication to get the content for a single share
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} share_id the share ID
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function read_share(token, session_secret_key, share_id) {
    const endpoint = '/share/' + share_id + '/';
    const method = 'GET';
    const data = null;
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax GET request with the token as authentication to get the current user's shares
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function read_shares(token, session_secret_key) {
    const endpoint = '/share/';
    const method = 'GET';
    const data = null;
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax PUT request to create a datastore with the token as authentication and optional already some data,
 * together with the encrypted secret key and nonce
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {string|undefined} [encrypted_data] (optional) The data for the new share
 * @param {string|undefined} [encrypted_data_nonce] (optional) The nonce for data, necessary if data is provided
 * @param {string} key encrypted key used by the encryption
 * @param {string} key_nonce nonce for key, necessary if a key is provided
 * @param {string|undefined} [parent_share_id] (optional) The id of the parent share, may be left empty if the share resides in the datastore
 * @param {string|undefined} [parent_datastore_id] (optional) The id of the parent datastore, may be left empty if the share resides in a share
 * @param {string} link_id the local id of the share in the datastructure
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the status and the new share id
 */
function create_share(
    token,
    session_secret_key,
    encrypted_data,
    encrypted_data_nonce,
    key,
    key_nonce,
    parent_share_id,
    parent_datastore_id,
    link_id
) {
    const endpoint = '/share/';
    const method = 'POST';
    const data = {
        data: encrypted_data,
        data_nonce: encrypted_data_nonce,
        key: key,
        key_nonce: key_nonce,
        key_type: 'symmetric',
        parent_share_id: parent_share_id,
        parent_datastore_id: parent_datastore_id,
        link_id: link_id,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax PUT request with the token as authentication and the new share content
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} share_id the share ID
 * @param {string|undefined} [encrypted_data] (optional) data for the new share
 * @param {string|undefined} [encrypted_data_nonce] (optional) nonce for data, necessary if data is provided
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the status of the update
 */
function write_share(
    token,
    session_secret_key,
    share_id,
    encrypted_data,
    encrypted_data_nonce
) {
    const endpoint = '/share/';
    const method = 'PUT';
    const data = {
        share_id: share_id,
        data: encrypted_data,
        data_nonce: encrypted_data_nonce,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax GET request with the token as authentication to get the users and groups rights of the share
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} share_id the share ID
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function read_share_rights(token, session_secret_key, share_id) {
    const endpoint = '/share/rights/' + share_id + '/';
    const method = 'GET';
    const data = null;
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax GET request with the token as authentication to get all the users share rights
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function read_share_rights_overview(token, session_secret_key) {
    const endpoint = '/share/right/';
    const method = 'GET';
    const data = null;
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax PUT request with the token as authentication to create share rights for a user
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {string} encrypted_title The title shown to the user before he accepts
 * @param {string} encrypted_title_nonce The corresponding title nonce
 * @param {string} encrypted_type The type of the share
 * @param {string} encrypted_type_nonce The corresponding type nonce
 * @param {uuid} share_id The share ID
 * @param {uuid} [user_id] (optional) The target user's user ID
 * @param {uuid} [group_id] (optional) The target group's group ID
 * @param {string} key The encrypted share secret, encrypted with the public key of the target user
 * @param {string} key_nonce The unique nonce for decryption
 * @param {bool} read read permission
 * @param {bool} write write permission
 * @param {bool} grant grant permission
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function create_share_right(
    token,
    session_secret_key,
    encrypted_title,
    encrypted_title_nonce,
    encrypted_type,
    encrypted_type_nonce,
    share_id,
    user_id,
    group_id,
    key,
    key_nonce,
    read,
    write,
    grant
) {
    const endpoint = '/share/right/';
    const method = 'PUT';
    const data = {
        title: encrypted_title,
        title_nonce: encrypted_title_nonce,
        type: encrypted_type,
        type_nonce: encrypted_type_nonce,
        share_id: share_id,
        user_id: user_id,
        group_id: group_id,
        key: key,
        key_nonce: key_nonce,
        read: read,
        write: write,
        grant: grant,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request with the token as authentication to update the share rights for a user
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} share_id the share ID
 * @param {uuid} user_id the target user's user ID
 * @param {uuid} group_id the target user's user ID
 * @param {bool} read read right
 * @param {bool} write write right
 * @param {bool} grant grant right
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function update_share_right(
    token,
    session_secret_key,
    share_id,
    user_id,
    group_id,
    read,
    write,
    grant
) {
    const endpoint = '/share/right/';
    const method = 'POST';
    const data = {
        share_id: share_id,
        user_id: user_id,
        group_id: group_id,
        read: read,
        write: write,
        grant: grant,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax DELETE request with the token as authentication to delete the user / group share right
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} user_share_right_id the user share right ID
 * @param {uuid} group_share_right_id the group share right ID
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function delete_share_right(
    token,
    session_secret_key,
    user_share_right_id,
    group_share_right_id
) {
    const endpoint = '/share/right/';
    const method = 'DELETE';
    const data = {
        user_share_right_id: user_share_right_id,
        group_share_right_id: group_share_right_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax GET request with the token as authentication to get all the users inherited share rights
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function read_share_rights_inherit_overview(token, session_secret_key) {
    const endpoint = '/share/right/inherit/';
    const method = 'GET';
    const data = null;
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request with the token as authentication to accept a share right and in the same run updates it
 * with the re-encrypted key
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} share_right_id The share right id
 * @param {string} key The encrypted key of the share
 * @param {string} key_nonce The nonce of the key
 * @param {string} key_type The type of the key (default: symmetric)
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function accept_share_right(
    token,
    session_secret_key,
    share_right_id,
    key,
    key_nonce,
    key_type
) {
    const endpoint = '/share/right/accept/';
    const method = 'POST';
    const data = {
        share_right_id: share_right_id,
        key: key,
        key_nonce: key_nonce,
        key_type: key_type,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request with the token as authentication to decline a share right
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} share_right_id The share right id
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function decline_share_right(token, session_secret_key, share_right_id) {
    const endpoint = '/share/right/decline/';
    const method = 'POST';
    const data = {
        share_right_id: share_right_id,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request with the token as authentication to get the public key of a user by user_id or user_email
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid|undefined} [user_id] (optional) the user ID
 * @param {email|undefined} [user_username] (optional) the username
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the user information
 */
function search_user(token, session_secret_key, user_id, user_username) {
    const endpoint = '/user/search/';
    const method = 'POST';
    const data = {
        user_id: user_id,
        user_username: user_username,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax PUT request with the token as authentication to generate a google authenticator
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {string} title The title of the new GA
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the secret
 */
function create_ga(token, session_secret_key, title) {
    const endpoint = '/user/ga/';
    const method = 'PUT';
    const data = {
        title: title,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax GET request to get a list of all registered google authenticators
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with a list of all google authenticators
 */
function read_ga(token, session_secret_key) {
    const endpoint = '/user/ga/';
    const method = 'GET';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request to activate registered Google Authenticator
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} google_authenticator_id The Google Authenticator id to activate
 * @param {string} google_authenticator_token One Google Authenticator Code
 *
 * @returns {Promise<AxiosResponse<any>>} Returns weather it was successful or not
 */
function activate_ga(
    token,
    session_secret_key,
    google_authenticator_id,
    google_authenticator_token
) {
    const endpoint = '/user/ga/';
    const method = 'POST';
    const data = {
        google_authenticator_id: google_authenticator_id,
        google_authenticator_token: google_authenticator_token,
    };

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax DELETE request to delete a given Google authenticator
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} google_authenticator_id The google authenticator id to delete
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise which can succeed or fail
 */
function delete_ga(token, session_secret_key, google_authenticator_id) {
    const endpoint = '/user/ga/';
    const method = 'DELETE';
    const data = {
        google_authenticator_id: google_authenticator_id,
    };

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax PUT request with the token as authentication to generate a duo
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {string} title The title of the duo
 * @param {string} integration_key The integration_key of the duo
 * @param {string} secret_key The secret_key of the duo
 * @param {string} host The host of the duo
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the secret
 */
function create_duo(
    token,
    session_secret_key,
    title,
    integration_key,
    secret_key,
    host
) {
    const endpoint = '/user/duo/';
    const method = 'PUT';
    const data = {
        title: title,
        integration_key: integration_key,
        secret_key: secret_key,
        host: host,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax GET request to get a list of all registered duo
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with a list of all duo
 */
function read_duo(token, session_secret_key) {
    const endpoint = '/user/duo/';
    const method = 'GET';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request to activate registered duo
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} duo_id The duo id to activate
 * @param {string} [duo_token] (optional) The duo id to activate
 *
 * @returns {Promise<AxiosResponse<any>>} Returns weather it was successful or not
 */
function activate_duo(token, session_secret_key, duo_id, duo_token) {
    const endpoint = '/user/duo/';
    const method = 'POST';
    const data = {
        duo_id: duo_id,
        duo_token: duo_token,
    };

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax DELETE request to delete a given Google authenticator
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} duo_id The duo id to delete
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise which can succeed or fail
 */
function delete_duo(token, session_secret_key, duo_id) {
    const endpoint = '/user/duo/';
    const method = 'DELETE';
    const data = {
        duo_id: duo_id,
    };

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax PUT request with the token as authentication to create / set a new YubiKey OTP token
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {string} title The title of the new Yubikey OTP token
 * @param {string} yubikey_otp One YubiKey OTP Code
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the secret
 */
function create_yubikey_otp(token, session_secret_key, title, yubikey_otp) {
    const endpoint = '/user/yubikey-otp/';
    const method = 'PUT';
    const data = {
        title: title,
        yubikey_otp: yubikey_otp,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax GET request to get a list of all registered Yubikey OTP token
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with a list of all Yubikey OTP token
 */
function read_yubikey_otp(token, session_secret_key) {
    const endpoint = '/user/yubikey-otp/';
    const method = 'GET';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request to activate registered YubiKey
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} yubikey_id The Yubikey id to activate
 * @param {string} yubikey_otp The Yubikey OTP
 *
 * @returns {Promise<AxiosResponse<any>>} Returns weather it was successful or not
 */
function activate_yubikey_otp(
    token,
    session_secret_key,
    yubikey_id,
    yubikey_otp
) {
    const endpoint = '/user/yubikey-otp/';
    const method = 'POST';
    const data = {
        yubikey_id: yubikey_id,
        yubikey_otp: yubikey_otp,
    };

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax DELETE request to delete a given Yubikey for OTP
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} yubikey_otp_id The Yubikey id to delete
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise which can succeed or fail
 */
function delete_yubikey_otp(token, session_secret_key, yubikey_otp_id) {
    const endpoint = '/user/yubikey-otp/';
    const method = 'DELETE';
    const data = {
        yubikey_otp_id: yubikey_otp_id,
    };

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax PUT request with the token as authentication to create a link between a share and a datastore or another
 * (parent-)share
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} link_id the link id
 * @param {uuid} share_id the share ID
 * @param {uuid|undefined} [parent_share_id=null] (optional) parent share ID, necessary if no parent_datastore_id is provided
 * @param {uuid|undefined} [parent_datastore_id=null] (optional) parent datastore ID, necessary if no parent_share_id is provided
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function create_share_link(
    token,
    session_secret_key,
    link_id,
    share_id,
    parent_share_id,
    parent_datastore_id
) {
    const endpoint = '/share/link/';
    const method = 'PUT';
    const data = {
        link_id: link_id,
        share_id: share_id,
        parent_share_id: parent_share_id,
        parent_datastore_id: parent_datastore_id,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request with the token as authentication to move a link between a share and a datastore or another
 * (parent-)share
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} link_id the link id
 * @param {uuid|undefined} [new_parent_share_id=null] (optional) new parent share ID, necessary if no new_parent_datastore_id is provided
 * @param {uuid|undefined} [new_parent_datastore_id=null] (optional) new datastore ID, necessary if no new_parent_share_id is provided
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function move_share_link(
    token,
    session_secret_key,
    link_id,
    new_parent_share_id,
    new_parent_datastore_id
) {
    const endpoint = '/share/link/';
    const method = 'POST';
    const data = {
        link_id: link_id,
        new_parent_share_id: new_parent_share_id,
        new_parent_datastore_id: new_parent_datastore_id,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax DELETE request with the token as authentication to delete a link
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} link_id The Link ID
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function delete_share_link(token, session_secret_key, link_id) {
    const endpoint = '/share/link/';
    const method = 'DELETE';
    const data = {
        link_id: link_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax GET request with the token as authentication to get the current user's groups
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid|undefined} [group_id=null] (optional) group ID
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function read_group(token, session_secret_key, group_id) {
    const endpoint = '/group/' + (!group_id ? '' : group_id + '/');
    const method = 'GET';
    const data = null;
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax PUT request to create a group with the token as authentication and together with the name of the group
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {string} name name of the new group
 * @param {string} secret_key encrypted secret key of the group
 * @param {string} secret_key_nonce nonce for secret key
 * @param {string} private_key encrypted private key of the group
 * @param {string} private_key_nonce nonce for private key
 * @param {string} public_key the public_key of the group
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function create_group(
    token,
    session_secret_key,
    name,
    secret_key,
    secret_key_nonce,
    private_key,
    private_key_nonce,
    public_key
) {
    const endpoint = '/group/';
    const method = 'PUT';
    const data = {
        name: name,
        secret_key: secret_key,
        secret_key_nonce: secret_key_nonce,
        private_key: private_key,
        private_key_nonce: private_key_nonce,
        public_key: public_key,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request to update a given Group
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} group_id The group id to update
 * @param {string} name The new name of the group
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise which can succeed or fail
 */
function update_group(token, session_secret_key, group_id, name) {
    const endpoint = '/group/';
    const method = 'POST';
    const data = {
        group_id: group_id,
        name: name,
    };

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax DELETE request to delete a given Group
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} group_id The group id to delete
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise which can succeed or fail
 */
function delete_group(token, session_secret_key, group_id) {
    const endpoint = '/group/';
    const method = 'DELETE';
    const data = {
        group_id: group_id,
    };

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax GET request with the token as authentication to get all the group rights accessible by a user
 * or for a specific group
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid|undefined} [group_id=null] (optional) group ID
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function read_group_rights(token, session_secret_key, group_id) {
    const endpoint = '/group/rights/' + (!group_id ? '' : group_id + '/');
    const method = 'GET';
    const data = null;
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax PUT request to create a group membership for another user for a group with the token as authentication
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} group_id ID of the group
 * @param {uuid} user_id ID of the user
 * @param {string} secret_key encrypted secret key of the group
 * @param {string} secret_key_nonce nonce for secret key
 * @param {string} secret_key_type type of the secret key
 * @param {string} private_key encrypted private key of the group
 * @param {string} private_key_nonce nonce for private key
 * @param {string} private_key_type type of the private key
 * @param {boolean} group_admin Weather the users should have group admin rights or not
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function create_membership(
    token,
    session_secret_key,
    group_id,
    user_id,
    secret_key,
    secret_key_nonce,
    secret_key_type,
    private_key,
    private_key_nonce,
    private_key_type,
    group_admin
) {
    const endpoint = '/membership/';
    const method = 'PUT';
    const data = {
        group_id: group_id,
        user_id: user_id,
        secret_key: secret_key,
        secret_key_nonce: secret_key_nonce,
        secret_key_type: secret_key_type,
        private_key: private_key,
        private_key_nonce: private_key_nonce,
        private_key_type: private_key_type,
        group_admin: group_admin,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request to update a group membership with the token as authentication
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} membership_id The membership id to update
 * @param {boolean} group_admin Weather the users should have group admin rights or not
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function update_membership(
    token,
    session_secret_key,
    membership_id,
    group_admin
) {
    const endpoint = '/membership/';
    const method = 'POST';
    const data = {
        membership_id: membership_id,
        group_admin: group_admin,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax DELETE request to delete a given group membership
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} membership_id The membership id to delete
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise which can succeed or fail
 */
function delete_membership(token, session_secret_key, membership_id) {
    const endpoint = '/membership/';
    const method = 'DELETE';
    const data = {
        membership_id: membership_id,
    };

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request with the token as authentication to accept a membership and in the same run updates it
 * with the re-encrypted key
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} membership_id The share right id
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function accept_membership(token, session_secret_key, membership_id) {
    const endpoint = '/membership/accept/';
    const method = 'POST';
    const data = {
        membership_id: membership_id,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request with the token as authentication to decline a membership
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} membership_id The share right id
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function decline_membership(token, session_secret_key, membership_id) {
    const endpoint = '/membership/decline/';
    const method = 'POST';
    const data = {
        membership_id: membership_id,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax DELETE request with the token as authentication to delete a user account
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} authkey The authkey of the user
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function delete_account(token, session_secret_key, authkey) {
    const endpoint = '/user/delete/';
    const method = 'DELETE';
    const data = {
        authkey: authkey,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax PUT request to the backend to initiate the second factor authentication with webauthn
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} sessionSecretKey The session secret key
 * @param {string} origin The current origin e.g. https://example.com
 *
 * @returns {Promise} Returns a promise with the verification status
 */
function webauthnVerifyInit(token, sessionSecretKey, origin) {
    const endpoint = '/authentication/webauthn-verify/';
    const method = 'PUT';
    const data = {
        origin: origin,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, sessionSecretKey);
}

/**
 * Ajax POST request to the backend with the response from the browser to solve the webauthn challenge
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} sessionSecretKey The session secret key
 * @param {string} credential The credentials passed by the browser
 *
 * @returns {Promise} Returns a promise with the verification status
 */
function webauthnVerify(token, sessionSecretKey, credential) {
    const endpoint = '/authentication/webauthn-verify/';
    const method = 'POST';
    const data = {
        credential: credential,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, sessionSecretKey);
}

const service = {
    info,
    healthcheck,
    admin_stats_browser,
    admin_stats_device,
    admin_stats_os,
    admin_stats_two_factor,
    admin_info,
    admin_user,
    admin_session,
    admin_group,
    admin_security_report,
    admin_create_user,
    admin_delete_user,
    admin_delete_session,
    admin_create_group,
    admin_delete_group,
    admin_update_membership,
    admin_delete_membership,
    admin_delete_duo,
    admin_delete_yubikey_otp,
    admin_delete_webauthn,
    admin_delete_google_authenticator,
    admin_delete_recovery_code,
    admin_delete_emergency_code,
    admin_delete_link_share,
    admin_ldap_user,
    admin_ldap_group,
    admin_ldap_create_group_map,
    admin_ldap_update_group_map,
    admin_ldap_delete_group_map,
    admin_ldap_group_sync,
    admin_scim_group,
    admin_delete_scim_group,
    admin_saml_group,
    admin_delete_saml_group,
    admin_delete_oidc_group,
    admin_delete_ldap_group,
    admin_saml_group_sync,
    admin_scim_create_group_map,
    admin_scim_update_group_map,
    admin_scim_delete_group_map,
    admin_saml_create_group_map,
    admin_saml_update_group_map,
    admin_saml_delete_group_map,
    admin_oidc_group,
    admin_oidc_create_group_map,
    admin_oidc_update_group_map,
    admin_oidc_delete_group_map,
    admin_update_user,
    login,
    saml_initiate_login,
    saml_login,
    oidc_initiate_login,
    oidc_login,
    ga_verify,
    duo_verify,
    yubikey_otp_verify,
    activate_token,
    get_sessions,
    logout,
    register,
    verify_email,
    update_user,
    write_recoverycode,
    enable_recoverycode,
    set_password,
    read_datastore,
    write_datastore,
    create_datastore,
    delete_datastore,
    read_secret,
    write_secret,
    create_secret,
    move_secret_link,
    delete_secret_link,
    read_share,
    read_shares,
    write_share,
    create_share,
    read_share_rights,
    read_share_rights_overview,
    create_share_right,
    update_share_right,
    delete_share_right,
    read_share_rights_inherit_overview,
    accept_share_right,
    decline_share_right,
    search_user,
    read_ga,
    activate_ga,
    delete_ga,
    create_ga,
    read_duo,
    activate_duo,
    delete_duo,
    create_duo,
    read_yubikey_otp,
    activate_yubikey_otp,
    delete_yubikey_otp,
    create_yubikey_otp,
    create_share_link,
    move_share_link,
    delete_share_link,
    read_group,
    create_group,
    update_group,
    delete_group,
    read_group_rights,
    create_membership,
    update_membership,
    delete_membership,
    accept_membership,
    decline_membership,
    delete_account,
    webauthnVerifyInit,
    webauthnVerify,
};

export default service;
