import type { ApiRecord } from '../types/api';
import type { HashingParameters } from '../types/api';
/**
 * Server Service, implements the Psono API
 */

import store from './store';
import cryptoLibrary from './cryptoLibrary';
import user from './user';
import device from './device';
import i18n from '../i18n';
import type { ApiResponse, AdminRecovery } from '../types/api';

/**
 * Decrypts data with a secret
 * @param sessionSecretKey
 * @param data
 * @returns {*}
 */
function decryptData<T = ApiRecord>(
    sessionSecretKey: string | null | undefined,
    data: any
): ApiResponse<T> {
    if (
        sessionSecretKey &&
        data !== null &&
        data.hasOwnProperty('data') &&
        data.data !== '' &&
        (!data.data.hasOwnProperty('text') ||
            !data.data.hasOwnProperty('nonce'))
    ) {
        // we expected an encrypted response, yet the response was unencrypted, so we don't trust it.
        console.log('UNENCRYPTED_RESPONSE_RECEIVED', data.data);
        throw new Error('UNENCRYPTED_RESPONSE_RECEIVED');
    }
    if (
        sessionSecretKey &&
        data !== null &&
        data.hasOwnProperty('data') &&
        data.data.hasOwnProperty('text') &&
        data.data.hasOwnProperty('nonce')
    ) {
        data.data = JSON.parse(
            cryptoLibrary.decryptData(
                data.data.text,
                data.data.nonce,
                sessionSecretKey
            )
        );
    }

    return data;
}

function _statelessCall<T = ApiRecord>(
    method: string,
    endpoint: string,
    body: unknown,
    headers: Record<string, string> | null,
    sessionSecretKey: string | null | undefined,
    serverUrl: string,
    deviceFingerprint: string | number,
    sideEffect: (response: Response) => void
) {
    const url = serverUrl + endpoint;

    if (sessionSecretKey && body !== null) {
        body = cryptoLibrary.encryptData(
            JSON.stringify(body),
            sessionSecretKey
        );
    }

    if (
        sessionSecretKey &&
        headers &&
        headers.hasOwnProperty('Authorization')
    ) {
        const validator = {
            request_time: new Date().toISOString(),
            request_device_fingerprint: deviceFingerprint,
        };
        headers['Authorization-Validator'] = JSON.stringify(
            cryptoLibrary.encryptData(
                JSON.stringify(validator),
                sessionSecretKey
            )
        );
    }

    // TODO add later for audit log again
    // let log_audit = storage.find_key('config','server_info')
    // if (log_audit) {
    //     log_audit = log_audit.value['log_audit']
    // }
    //
    // if (sessionSecretKey && headers && headers.hasOwnProperty(AUDIT_LOG_HEADER) && log_audit) {
    //     headers[AUDIT_LOG_HEADER] = JSON.stringify(cryptoLibrary.encryptData(JSON.stringify(headers[AUDIT_LOG_HEADER]), sessionSecretKey));
    // } else if (headers && headers.hasOwnProperty(AUDIT_LOG_HEADER)) {
    //     delete headers[AUDIT_LOG_HEADER];
    // }

    const req: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    };

    if (body != null) {
        req['body'] = JSON.stringify(body);
    }

    return new Promise<ApiResponse<T>>(async (resolve, reject) => {
        let rawResponse;
        try {
            rawResponse = await fetch(url, req);
        } catch (e) {
            console.log(e);
            reject({ errors: ['SERVER_OFFLINE'] });
            return;
        }

        if (typeof sideEffect === 'function') {
            sideEffect(rawResponse);
        }

        let data: any = await rawResponse.text();
        if (data) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                // pass
            }
        }

        let decryptedData;

        // compatibility to old axios library
        if (data) {
            data = {
                data,
            };
        }

        if (!rawResponse.ok) {
            console.log(rawResponse);
            console.log(data);
            if (rawResponse.status === 404) {
                if (rawResponse.statusText) {
                    return reject(rawResponse.statusText);
                }
                return reject({ errors: ['RESOURCE_NOT_FOUND'] });
            }

            if (rawResponse.status >= 500) {
                if (rawResponse.statusText) {
                    return reject(rawResponse.statusText);
                }
                return reject({ errors: ['SERVER_OFFLINE'] });
            }
            // received error 400. We fall through here and check below with rawResponse.ok whether we have to return
            // a success or failed response
        }

        try {
            decryptedData = decryptData<T>(sessionSecretKey, data);
        } catch (e) {
            return reject({ errors: ['UNENCRYPTED_RESPONSE_RECEIVED'] });
        }
        if (rawResponse.ok) {
            return resolve(decryptedData);
        } else {
            return reject(decryptedData);
        }
    });
}

function call<T = ApiRecord>(
    method: string,
    endpoint: string,
    body: unknown,
    headers: Record<string, string> | null,
    sessionSecretKey?: string | null,
    _synchronous?: boolean
) {
    const serverUrl = store.getState().server.url;
    const deviceFingerprint = device.getDeviceFingerprint();
    const sideEffect = (rawResponse: Response) => {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (rawResponse.status === 403 && user.isLoggedIn()) {
            // User did not have permission
            user.logout(i18n.t('PERMISSION_DENIED'));
        }
        if (rawResponse.status === 401 && user.isLoggedIn()) {
            // session expired, lets log the user out
            user.logout(i18n.t('SESSION_EXPIRED'));
        }
        if (rawResponse.status === 423 && user.isLoggedIn()) {
            // server error, lets log the user out
            user.logout(rawResponse.statusText);
        }
        if (rawResponse.status === 502 && user.isLoggedIn()) {
            // server error, lets log the user out
            user.logout(rawResponse.statusText);
        }
        if (rawResponse.status === 503 && user.isLoggedIn()) {
            // server error, lets log the user out
            user.logout(rawResponse.statusText);
        }
    };
    return _statelessCall<T>(
        method,
        endpoint,
        body,
        headers,
        sessionSecretKey,
        serverUrl,
        deviceFingerprint,
        sideEffect
    );
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
function admin_stats_browser(token: string, session_secret_key: string) {
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
function admin_stats_device(token: string, session_secret_key: string) {
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
function admin_stats_os(token: string, session_secret_key: string) {
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
function admin_stats_two_factor(token: string, session_secret_key: string) {
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
function admin_info(token: string, session_secret_key: string) {
    const endpoint = '/admin/info/';
    const method = 'GET';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

function admin_authorization(token: string, session_secret_key: string) {
    return call(
        'GET',
        '/admin/authorization/',
        null,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_capability(token: string, session_secret_key: string) {
    return call(
        'GET',
        '/admin/capability/',
        null,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_tenant(
    token: string,
    session_secret_key: string,
    tenant_id?: string | null,
    params?: Record<string, string | number>
) {
    const queryParams =
        !params || Object.keys(params).length === 0
            ? ''
            : '?' +
              new URLSearchParams(
                  Object.entries(params).map(([key, value]) => [
                      key,
                      String(value),
                  ])
              ).toString();
    return call(
        'GET',
        '/admin/tenant/' + (tenant_id ? tenant_id + '/' : '') + queryParams,
        null,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_create_tenant(
    token: string,
    session_secret_key: string,
    data: ApiRecord
) {
    return call(
        'POST',
        '/admin/tenant/',
        data,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_update_tenant(
    token: string,
    session_secret_key: string,
    tenant_id: string,
    data: ApiRecord
) {
    return call(
        'PUT',
        '/admin/tenant/' + tenant_id + '/',
        data,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_delete_tenant(
    token: string,
    session_secret_key: string,
    tenant_id: string
) {
    return call(
        'DELETE',
        '/admin/tenant/' + tenant_id + '/',
        null,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_tenant_membership(
    token: string,
    session_secret_key: string,
    method: string,
    data: ApiRecord
) {
    return call(
        method,
        '/admin/tenant-membership/',
        data,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_administrative_role(
    token: string,
    session_secret_key: string,
    role_id?: string
) {
    return call(
        'GET',
        '/admin/administrative-role/' + (role_id ? role_id + '/' : ''),
        null,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_create_administrative_role(
    token: string,
    session_secret_key: string,
    data: ApiRecord
) {
    return call(
        'POST',
        '/admin/administrative-role/',
        data,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_update_administrative_role(
    token: string,
    session_secret_key: string,
    role_id: string,
    data: ApiRecord
) {
    return call(
        'PUT',
        '/admin/administrative-role/' + role_id + '/',
        data,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_delete_administrative_role(
    token: string,
    session_secret_key: string,
    role_id: string
) {
    return call(
        'DELETE',
        '/admin/administrative-role/' + role_id + '/',
        null,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_administrative_role_assignment(
    token: string,
    session_secret_key: string,
    assignment_id?: string
) {
    return call(
        'GET',
        '/admin/administrative-role-assignment/' +
            (assignment_id ? assignment_id + '/' : ''),
        null,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_create_administrative_role_assignment(
    token: string,
    session_secret_key: string,
    data: ApiRecord
) {
    return call(
        'POST',
        '/admin/administrative-role-assignment/',
        data,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_update_administrative_role_assignment(
    token: string,
    session_secret_key: string,
    assignment_id: string,
    data: ApiRecord
) {
    return call(
        'PUT',
        '/admin/administrative-role-assignment/' + assignment_id + '/',
        data,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_delete_administrative_role_assignment(
    token: string,
    session_secret_key: string,
    assignment_id: string
) {
    return call(
        'DELETE',
        '/admin/administrative-role-assignment/' + assignment_id + '/',
        null,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
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
function admin_user(
    token: string,
    session_secret_key: string,
    user_id?: string | null,
    params?: Record<string, string | number>
) {
    const endpoint = '/admin/user/' + (!user_id ? '' : user_id + '/');
    const method = 'GET';
    const data = null;

    const queryParams =
        !params || Object.keys(params).length === 0
            ? ''
            : '?' +
              new URLSearchParams(
                  Object.entries(params).map(([key, value]) => [
                      key,
                      String(value),
                  ])
              ).toString();

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
function admin_session(
    token: string,
    session_secret_key: string,
    params?: Record<string, string | number>
) {
    const endpoint = '/admin/session/';
    const method = 'GET';
    const data = null;

    const queryParams =
        !params || Object.keys(params).length === 0
            ? ''
            : '?' +
              new URLSearchParams(
                  Object.entries(params).map(([key, value]) => [
                      key,
                      String(value),
                  ])
              ).toString();

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
function admin_group(
    token: string,
    session_secret_key: string,
    group_id?: string | null,
    params?: Record<string, string | number>
) {
    const endpoint = '/admin/group/' + (!group_id ? '' : group_id + '/');
    const method = 'GET';
    const data = null;

    const queryParams =
        !params || Object.keys(params).length === 0
            ? ''
            : '?' +
              new URLSearchParams(
                  Object.entries(params).map(([key, value]) => [
                      key,
                      String(value),
                  ])
              ).toString();

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
 * PUT: Update a user (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} group_id The id of the group to update
 * @param {string} name The new name for the group
 * @param {boolean} forcedMembership
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_update_group(
    token: string,
    session_secret_key: string,
    group_id: string,
    name: string,
    forcedMembership: boolean
) {
    const endpoint = '/admin/group/';
    const method = 'PUT';
    const data = {
        group_id: group_id,
        name: name,
        forced_membership: forcedMembership,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
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
function admin_security_report(
    token: string,
    session_secret_key: string,
    security_report_id?: string | null
) {
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
function admin_ldap_user(token: string, session_secret_key: string) {
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
function admin_ldap_group(token: string, session_secret_key: string) {
    const endpoint = '/admin/ldap/group/';
    const method = 'GET';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

function admin_update_external_group_tenants(
    token: string,
    session_secret_key: string | null,
    provider: string,
    groupId: string,
    tenantIds: string[]
) {
    const endpoint = '/admin/identity-provider/group-tenant/';
    const method = 'PUT';
    const data = {
        provider,
        group_id: groupId,
        tenant_ids: tenantIds,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

function admin_update_ldap_group_tenants(
    token: string,
    session_secret_key: string | null,
    ldapGroupId: string,
    tenantIds: string[]
) {
    return admin_update_external_group_tenants(
        token,
        session_secret_key,
        'ldap',
        ldapGroupId,
        tenantIds
    );
}

function admin_update_saml_group_tenants(
    token: string,
    session_secret_key: string | null,
    samlGroupId: string,
    tenantIds: string[]
) {
    return admin_update_external_group_tenants(
        token,
        session_secret_key,
        'saml',
        samlGroupId,
        tenantIds
    );
}

function admin_update_oidc_group_tenants(
    token: string,
    session_secret_key: string | null,
    oidcGroupId: string,
    tenantIds: string[]
) {
    return admin_update_external_group_tenants(
        token,
        session_secret_key,
        'oidc',
        oidcGroupId,
        tenantIds
    );
}

function admin_update_scim_group_tenants(
    token: string,
    session_secret_key: string | null,
    scimGroupId: string,
    tenantIds: string[]
) {
    return admin_update_external_group_tenants(
        token,
        session_secret_key,
        'scim',
        scimGroupId,
        tenantIds
    );
}

function admin_identity_provider_tenant(
    token: string,
    session_secret_key: string | null,
    params: Record<string, string | number>
) {
    const query = new URLSearchParams(
        Object.entries(params || {}).map(([key, value]) => [key, String(value)])
    ).toString();
    const endpoint =
        '/admin/identity-provider/tenant/' + (query ? `?${query}` : '');
    const method = 'GET';
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, null, headers, session_secret_key);
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
    token: string,
    session_secret_key: string,
    group_id: string,
    ldap_group_id: string
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
    token: string,
    session_secret_key: string,
    ldap_group_map_id: string,
    group_admin: boolean,
    share_admin: boolean
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
    token: string,
    session_secret_key: string,
    group_id: string,
    ldap_group_id: string
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
function admin_ldap_group_sync(token: string, session_secret_key: string) {
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
function admin_scim_group(token: string, session_secret_key: string) {
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
function admin_delete_scim_group(
    token: string,
    session_secret_key: string,
    scim_group_id: string
) {
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
function admin_saml_group(token: string, session_secret_key: string) {
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
function admin_delete_saml_group(
    token: string,
    session_secret_key: string,
    saml_group_id: string
) {
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
function admin_delete_oidc_group(
    token: string,
    session_secret_key: string,
    oidc_group_id: string
) {
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
function admin_delete_ldap_group(
    token: string,
    session_secret_key: string,
    ldap_group_id: string
) {
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
function admin_saml_group_sync(token: string, session_secret_key: string) {
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
    token: string,
    session_secret_key: string,
    group_id: string,
    scim_group_id: string
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
    token: string,
    session_secret_key: string,
    scim_group_map_id: string,
    group_admin: boolean,
    share_admin: boolean
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
    token: string,
    session_secret_key: string,
    group_id: string,
    scim_group_id: string
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
    token: string,
    session_secret_key: string,
    group_id: string,
    saml_group_id: string
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
    token: string,
    session_secret_key: string,
    saml_group_map_id: string,
    group_admin: boolean,
    share_admin: boolean
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
    token: string,
    session_secret_key: string,
    group_id: string,
    saml_group_id: string
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
function admin_oidc_group(token: string, session_secret_key: string) {
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
    token: string,
    session_secret_key: string,
    group_id: string,
    oidc_group_id: string
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
    token: string,
    session_secret_key: string,
    oidc_group_map_id: string,
    group_admin: boolean,
    share_admin: boolean
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
    token: string,
    session_secret_key: string,
    group_id: string,
    oidc_group_id: string
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
 * @param {string} language The language of the user to create
 * @param {boolean} require_password_change Require a password change on next login
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_create_user(
    token: string,
    session_secret_key: string,
    username: string,
    password: string,
    email: string,
    language: string,
    require_password_change: boolean,
    tenant_ids: string[]
) {
    const endpoint = '/admin/user/';
    const method = 'POST';
    const data = {
        username: username,
        email: email,
        password: password,
        language: language,
        require_password_change: require_password_change,
        tenant_ids: tenant_ids || [],
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
function admin_delete_user(
    token: string,
    session_secret_key: string,
    user_id: string,
    confirm_shared_ownership = false
) {
    const endpoint = '/admin/user/';
    const method = 'DELETE';
    const data = {
        user_id: user_id,
        confirm_shared_ownership: confirm_shared_ownership,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * POST: Wipes a user (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} user_id The user id of the user to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_wipe_user(
    token: string,
    session_secret_key: string,
    user_id: string
) {
    const endpoint = '/admin/user-wipe/';
    const method = 'POST';
    const data = {
        user_id: user_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

function admin_read_user_password_reset(
    token: string,
    session_secret_key: string | null,
    user_id: string
) {
    const endpoint = '/admin/user-password-reset/' + user_id + '/';
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call<AdminRecovery>(
        'GET',
        endpoint,
        null,
        headers,
        session_secret_key
    );
}

function admin_reset_user_password(
    token: string,
    session_secret_key: string | null,
    user_id: string,
    data: ApiRecord
) {
    const endpoint = '/admin/user-password-reset/' + user_id + '/';
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call('PUT', endpoint, data, headers, session_secret_key);
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
function admin_delete_session(
    token: string,
    session_secret_key: string,
    session_id: string
) {
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
 * GET: Returns a list of all policys (for administrators) or the policy details of a single policy
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} [policy_id] (optional) The policy id
 * @param {object} [params] (optional) Other search params
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_policy(
    token: string,
    session_secret_key: string,
    policy_id?: string | null,
    params?: Record<string, string | number>
) {
    const endpoint = '/admin/policy/' + (!policy_id ? '' : policy_id + '/');
    const method = 'GET';
    const data = null;

    const queryParams =
        !params || Object.keys(params).length === 0
            ? ''
            : '?' +
              new URLSearchParams(
                  Object.entries(params).map(([key, value]) => [
                      key,
                      String(value),
                  ])
              ).toString();

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
 * POST: Creates a policy (for administrators)
 * (EE Only)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {string} title The title of the policy to create
 * @param {object} config The config of the policy to create
 * @param {double} priority The priority of the policy to create
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_create_policy(
    token: string,
    session_secret_key: string,
    title: string,
    config: any,
    priority: number
) {
    const endpoint = '/admin/policy/';
    const method = 'POST';
    const data = {
        title: title,
        config: config,
        priority: priority,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * POST: Creates a policy group mapping (for administrators)
 * (EE Only)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} policy_id The id of the policy to create the group mapping
 * @param {uuid} group_id The id of the group to create the group mapping
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_policy_create_group_map(
    token: string,
    session_secret_key: string,
    policy_id: string,
    group_id: string
) {
    const endpoint = '/admin/policy/group/map/';
    const method = 'POST';
    const data = {
        policy_id: policy_id,
        group_id: group_id,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a policy group map (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} policy_id The policy id of the group mapping to delete
 * @param {uuid} group_id The group id of the group mapping to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_policy_delete_group_map(
    token: string,
    session_secret_key: string,
    policy_id: string,
    group_id: string
) {
    const endpoint = '/admin/policy/group/map/';
    const method = 'DELETE';
    const data = {
        policy_id: policy_id,
        group_id: group_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * POST: Creates a policy user mapping (for administrators)
 * (EE Only)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} policy_id The id of the policy to create the user mapping
 * @param {uuid} user_id The id of the user to create the user mapping
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_policy_create_user_map(
    token: string,
    session_secret_key: string,
    policy_id: string,
    user_id: string
) {
    const endpoint = '/admin/policy/user/map/';
    const method = 'POST';
    const data = {
        policy_id: policy_id,
        user_id: user_id,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a policy user map (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} policy_id The policy id of the user mapping to delete
 * @param {uuid} user_id The user id of the user mapping to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_policy_delete_user_map(
    token: string,
    session_secret_key: string,
    policy_id: string,
    user_id: string
) {
    const endpoint = '/admin/policy/user/map/';
    const method = 'DELETE';
    const data = {
        policy_id: policy_id,
        user_id: user_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * PUT: Updates a policy (for administrators)
 * (EE Only)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {string} policy_id The id of the policy to update
 * @param {string} title The title of the policy to update
 * @param {object} config The config of the policy to update
 * @param {double} priority The priority of the policy to update
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_update_policy(
    token: string,
    session_secret_key: string,
    policy_id: string,
    title: string,
    config: any,
    priority: number
) {
    const endpoint = '/admin/policy/';
    const method = 'PUT';
    const data = {
        policy_id: policy_id,
        title: title,
        config: config,
        priority: priority,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * DELETE: Deletes a policy (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} policy_id The policy id of the group to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_policy(
    token: string,
    session_secret_key: string,
    policy_id: string
) {
    const endpoint = '/admin/policy/';
    const method = 'DELETE';
    const data = {
        policy_id: policy_id,
    };
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

function admin_fileserver_cluster(
    token: string,
    session_secret_key: string,
    cluster_id?: string,
    params?: Record<string, string | number>
) {
    const endpoint =
        '/admin/fileserver-cluster/' + (!cluster_id ? '' : cluster_id + '/');
    const queryParams =
        !params || Object.keys(params).length === 0
            ? ''
            : '?' +
              new URLSearchParams(
                  Object.entries(params).map(([key, value]) => [
                      key,
                      String(value),
                  ])
              ).toString();
    return call(
        'GET',
        endpoint + queryParams,
        null,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_create_fileserver_cluster(
    token: string,
    session_secret_key: string,
    title: string,
    file_size_limit: string | number
) {
    return call(
        'POST',
        '/admin/fileserver-cluster/',
        { title: title, file_size_limit: file_size_limit },
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_update_fileserver_cluster(
    token: string,
    session_secret_key: string,
    cluster_id: string,
    title: string,
    file_size_limit: string | number
) {
    return call(
        'PUT',
        '/admin/fileserver-cluster/',
        {
            cluster_id: cluster_id,
            title: title,
            file_size_limit: file_size_limit,
        },
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_delete_fileserver_cluster(
    token: string,
    session_secret_key: string,
    cluster_id: string
) {
    return call(
        'DELETE',
        '/admin/fileserver-cluster/',
        { cluster_id: cluster_id },
        {
            'Content-Type': 'application/json',
            Authorization: 'Token ' + token,
        },
        session_secret_key
    );
}

function admin_generate_fileserver_cluster_configuration(
    token: string,
    session_secret_key: string,
    cluster_id: string
) {
    return call(
        'POST',
        '/admin/fileserver-cluster/configuration/',
        { cluster_id: cluster_id },
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_fileserver_shard(
    token: string,
    session_secret_key: string,
    shard_id?: string,
    params?: Record<string, string | number>
) {
    const endpoint =
        '/admin/fileserver-shard/' + (!shard_id ? '' : shard_id + '/');
    const queryParams =
        !params || Object.keys(params).length === 0
            ? ''
            : '?' +
              new URLSearchParams(
                  Object.entries(params).map(([key, value]) => [
                      key,
                      String(value),
                  ])
              ).toString();
    return call(
        'GET',
        endpoint + queryParams,
        null,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_create_fileserver_shard(
    token: string,
    session_secret_key: string,
    title: string,
    description: string,
    active: boolean
) {
    return call(
        'POST',
        '/admin/fileserver-shard/',
        { title: title, description: description, active: active },
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_update_fileserver_shard(
    token: string,
    session_secret_key: string,
    shard_id: string,
    title: string,
    description: string,
    active: boolean
) {
    return call(
        'PUT',
        '/admin/fileserver-shard/',
        {
            shard_id: shard_id,
            title: title,
            description: description,
            active: active,
        },
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_delete_fileserver_shard(
    token: string,
    session_secret_key: string,
    shard_id: string
) {
    return call(
        'DELETE',
        '/admin/fileserver-shard/',
        { shard_id: shard_id },
        {
            'Content-Type': 'application/json',
            Authorization: 'Token ' + token,
        },
        session_secret_key
    );
}

function admin_create_fileserver_cluster_shard_link(
    token: string,
    session_secret_key: string,
    cluster_id: string,
    shard_id: string,
    permissions: {
        read: boolean;
        write: boolean;
        delete_capability: boolean;
        allow_link_shares: boolean;
    }
) {
    return call(
        'POST',
        '/admin/fileserver-cluster-shard-link/',
        { cluster_id: cluster_id, shard_id: shard_id, ...permissions },
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_update_fileserver_cluster_shard_link(
    token: string,
    session_secret_key: string,
    link_id: string,
    permissions: {
        read: boolean;
        write: boolean;
        delete_capability: boolean;
        allow_link_shares: boolean;
    }
) {
    return call(
        'PUT',
        '/admin/fileserver-cluster-shard-link/',
        { link_id: link_id, ...permissions },
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_delete_fileserver_cluster_shard_link(
    token: string,
    session_secret_key: string,
    link_id: string
) {
    return call(
        'DELETE',
        '/admin/fileserver-cluster-shard-link/',
        { link_id: link_id },
        {
            'Content-Type': 'application/json',
            Authorization: 'Token ' + token,
        },
        session_secret_key
    );
}

function admin_fileserver(
    token: string,
    session_secret_key: string,
    fileserver_id?: string,
    params?: Record<string, string | number>
) {
    const endpoint =
        '/admin/fileserver/' + (!fileserver_id ? '' : fileserver_id + '/');
    const queryParams =
        !params || Object.keys(params).length === 0
            ? ''
            : '?' +
              new URLSearchParams(
                  Object.entries(params).map(([key, value]) => [
                      key,
                      String(value),
                  ])
              ).toString();
    return call(
        'GET',
        endpoint + queryParams,
        null,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_gateway_cluster(
    token: string,
    session_secret_key: string,
    cluster_id?: string,
    params?: Record<string, string | number>
) {
    const endpoint =
        '/admin/gateway-cluster/' + (!cluster_id ? '' : cluster_id + '/');
    const queryParams =
        !params || Object.keys(params).length === 0
            ? ''
            : '?' +
              new URLSearchParams(
                  Object.entries(params).map(([key, value]) => [
                      key,
                      String(value),
                  ])
              ).toString();
    return call(
        'GET',
        endpoint + queryParams,
        null,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_create_gateway_cluster(
    token: string,
    session_secret_key: string,
    title: string,
    allow_all: boolean
) {
    return call(
        'POST',
        '/admin/gateway-cluster/',
        { title: title, allow_all: allow_all },
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_update_gateway_cluster(
    token: string,
    session_secret_key: string,
    cluster_id: string,
    title: string,
    allow_all: boolean
) {
    return call(
        'PUT',
        '/admin/gateway-cluster/',
        { cluster_id: cluster_id, title: title, allow_all: allow_all },
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_delete_gateway_cluster(
    token: string,
    session_secret_key: string,
    cluster_id: string
) {
    return call(
        'DELETE',
        '/admin/gateway-cluster/',
        { cluster_id: cluster_id },
        {
            'Content-Type': 'application/json',
            Authorization: 'Token ' + token,
        },
        session_secret_key
    );
}

function admin_generate_gateway_cluster_configuration(
    token: string,
    session_secret_key: string,
    cluster_id: string
) {
    return call(
        'POST',
        '/admin/gateway-cluster/configuration/',
        { cluster_id: cluster_id },
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_gateway_cluster_user_map(
    token: string,
    session_secret_key: string,
    method: string,
    cluster_id: string,
    user_id: string
) {
    return call(
        method,
        '/admin/gateway-cluster/user/map/',
        { cluster_id: cluster_id, user_id: user_id },
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_gateway_cluster_group_map(
    token: string,
    session_secret_key: string,
    method: string,
    cluster_id: string,
    group_id: string
) {
    return call(
        method,
        '/admin/gateway-cluster/group/map/',
        { cluster_id: cluster_id, group_id: group_id },
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

function admin_gateway(
    token: string,
    session_secret_key: string,
    gateway_id?: string,
    params?: Record<string, string | number>
) {
    const endpoint = '/admin/gateway/' + (!gateway_id ? '' : gateway_id + '/');
    const queryParams =
        !params || Object.keys(params).length === 0
            ? ''
            : '?' +
              new URLSearchParams(
                  Object.entries(params).map(([key, value]) => [
                      key,
                      String(value),
                  ])
              ).toString();
    return call(
        'GET',
        endpoint + queryParams,
        null,
        { Authorization: 'Token ' + token },
        session_secret_key
    );
}

/**
 * POST: Creates a managed group (for administrators)
 * (EE Only)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {string} name The name of the group to create
 * @param {boolean} auto_create_folder Automatically create a share with a folder with the same name
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_create_group(
    token: string,
    session_secret_key: string,
    name: string,
    auto_create_folder: boolean
) {
    const endpoint = '/admin/group/';
    const method = 'POST';
    const data = {
        name: name,
        auto_create_folder: auto_create_folder,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * POST: Creates a share right for a managed group (for administrators)
 * (EE Only)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {string} group_id The group id
 * @param {string} name The name of the group to create
 * @param {boolean} read
 * @param {boolean} write
 * @param {boolean} grant
 * @param {string} shareData
 * @param {string} shareDataNonce
 * @param {string} groupShareRightKey
 * @param {string} groupShareRightKeyNonce
 * @param {string} groupShareRightTitle
 * @param {string} groupShareRightTitleNonce
 * @param {string} groupShareRightType
 * @param {string} groupShareRightTypeNonce
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function adminCreateShareRight(
    token: string,
    session_secret_key: string,
    group_id: string,
    read: boolean,
    write: boolean,
    grant: boolean,
    shareData: string,
    shareDataNonce: string,
    groupShareRightKey: string,
    groupShareRightKeyNonce: string,
    groupShareRightTitle: string,
    groupShareRightTitleNonce: string,
    groupShareRightType: string,
    groupShareRightTypeNonce: string
) {
    const endpoint = '/admin/group-share-right/';
    const method = 'POST';
    const data = {
        group_id: group_id,
        read: read,
        write: write,
        grant: grant,
        share_data: shareData,
        share_data_nonce: shareDataNonce,
        group_share_right_key: groupShareRightKey,
        group_share_right_key_nonce: groupShareRightKeyNonce,
        group_share_right_title: groupShareRightTitle,
        group_share_right_title_nonce: groupShareRightTitleNonce,
        group_share_right_type: groupShareRightType,
        group_share_right_type_nonce: groupShareRightTypeNonce,
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
function admin_delete_group(
    token: string,
    session_secret_key: string,
    group_id: string,
    confirm_shared_ownership = false
) {
    const endpoint = '/admin/group/';
    const method = 'DELETE';
    const data = {
        group_id: group_id,
        confirm_shared_ownership: confirm_shared_ownership,
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
    token: string,
    session_secret_key: string,
    membership_id: string,
    group_admin: boolean,
    share_admin: boolean
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
 * Ajax POST request to update a group share right with the token as authentication (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} group_share_right_id The group share right id to update
 * @param {boolean} read Weather the users should have read rights or not
 * @param {boolean} write Weather the users should have write rights or not
 * @param {boolean} grant Weather the users should have write rights or not
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function admin_update_group_share_right(
    token: string,
    session_secret_key: string,
    group_share_right_id: string,
    read: boolean,
    write: boolean,
    grant: boolean
) {
    const endpoint = '/admin/group-share-right/';
    const method = 'PUT';
    const data = {
        group_share_right_id: group_share_right_id,
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
 * DELETE: Deletes a group membership (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} membership_id The id of the membership to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_membership(
    token: string,
    session_secret_key: string,
    membership_id: string
) {
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
 * DELETE: Deletes a group share right (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} group_share_right_id The id of the membership to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_group_share_right(
    token: string,
    session_secret_key: string,
    group_share_right_id: string
) {
    const endpoint = '/admin/group-share-right/';
    const method = 'DELETE';
    const data = {
        group_share_right_id: group_share_right_id,
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
function admin_delete_duo(
    token: string,
    session_secret_key: string,
    duo_id: string
) {
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
 * DELETE: Deletes an iVALT (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} ivaltId The id of the iValt to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function adminDeleteIvalt(
    token: string,
    session_secret_key: string,
    ivaltId: string
) {
    const endpoint = '/admin/ivalt/';
    const method = 'DELETE';
    const data = {
        ivalt_id: ivaltId,
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
function admin_delete_yubikey_otp(
    token: string,
    session_secret_key: string,
    yubikey_otp_id: string
) {
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
function admin_delete_webauthn(
    token: string,
    session_secret_key: string,
    webauthn_id: string
) {
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
 * DELETE: Deletes a TOTP (for administrators)
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} google_authenticator_id The id of the TOTP to delete
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_delete_google_authenticator(
    token: string,
    session_secret_key: string,
    google_authenticator_id: string
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
    token: string,
    session_secret_key: string,
    recovery_code_id: string
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
    token: string,
    session_secret_key: string,
    emergency_code_id: string
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
function admin_delete_link_share(
    token: string,
    session_secret_key: string,
    link_share_id: string
) {
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
 * @param {boolean} [require_password_change] (optional) Require a password change on next login
 * @param {string} [language] (optional) The new language
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function admin_update_user(
    token: string,
    session_secret_key: string,
    user_id: string,
    email: string | undefined,
    is_active: boolean,
    is_email_active?: boolean,
    is_superuser?: boolean,
    require_password_change?: boolean,
    language?: string
) {
    const endpoint = '/admin/user/';
    const method = 'PUT';
    const data = {
        user_id: user_id,
        email: email,
        is_active: is_active,
        is_email_active: is_email_active,
        is_superuser: is_superuser,
        require_password_change: require_password_change,
        language: language,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Gets the hashing settings recorded for the account before password login.
 */
function prelogin(username: string) {
    return call('POST', '/authentication/prelogin/', { username }, null);
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
function login(
    login_info: string,
    login_info_nonce: string,
    public_key: string,
    session_duration: number
) {
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
function samlInitiateLogin(saml_provider_id: string, return_to_url: string) {
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
function samlLogin(
    login_info: string,
    login_info_nonce: string,
    public_key: string,
    session_duration: number
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
function oidcInitiateLogin(oidc_provider_id: string, return_to_url: string) {
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
function oidcLogin(
    login_info: string,
    login_info_nonce: string,
    public_key: string,
    session_duration: number
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
function ga_verify(
    token: string,
    ga_token: string,
    session_secret_key: string
) {
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
function duo_verify(
    token: string,
    duo_token: string,
    session_secret_key: string
) {
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
function yubikey_otp_verify(
    token: string,
    yubikey_otp: string,
    session_secret_key: string
) {
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
function activateToken(
    token: string,
    verification: string,
    verification_nonce: string,
    session_secret_key: string
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
function get_sessions(token: string, session_secret_key: string) {
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
function logout(
    token: string,
    session_secret_key: string,
    session_id?: string
) {
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
 * @param {string} authkey authkey gets generated by generateAuthkey(email, password)
 * @param {string} public_key public_key of the public/private key pair for asymmetric encryption (sharing)
 * @param {string} private_key private_key of the public/private key pair, encrypted with encryptSecret
 * @param {string} private_key_nonce the nonce for decrypting the encrypted private_key
 * @param {string} secret_key secret_key for symmetric encryption, encrypted with encryptSecret
 * @param {string} secret_key_nonce the nonce for decrypting the encrypted secret_key
 * @param {string} user_sauce the random user sauce used
 * @param {string} base_url the base url for the activation link creation
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function register(
    email: string,
    username: string,
    authkey: string,
    public_key: string,
    private_key: string,
    private_key_nonce: string,
    secret_key: string,
    secret_key_nonce: string,
    user_sauce: string,
    base_url: string
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
function verify_email(activation_code: string) {
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
 * @param {string} language The language
 * @param {string} hashingAlgorithm The new credential's hashing algorithm
 * @param {object} hashingParameters The new credential's hashing parameters
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the update status
 */
function updateUser(
    token: string,
    session_secret_key: string | null,
    email: string | null,
    authkey: string,
    authkey_old: string,
    private_key: string,
    private_key_nonce: string,
    secret_key: string,
    secret_key_nonce: string,
    language: string | undefined,
    hashingAlgorithm?: string,
    hashingParameters?: HashingParameters | undefined
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
        language: language,
        hashing_algorithm: hashingAlgorithm,
        hashing_parameters: hashingParameters,
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
    token: string,
    session_secret_key: string,
    recovery_authkey: string,
    recovery_data: string,
    recovery_data_nonce: string,
    recovery_sauce: string
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
function enable_recoverycode(username: string, recovery_authkey: string) {
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
    username: string,
    recovery_authkey: string,
    update_data: string,
    update_data_nonce: string
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
function read_datastore(
    token: string,
    session_secret_key: string,
    datastore_id: string
) {
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
    token: string,
    session_secret_key: string,
    type: string,
    description: string,
    encrypted_data: string | undefined,
    encrypted_data_nonce: string | undefined,
    is_default: string | undefined,
    encrypted_data_secret_key: string,
    encrypted_data_secret_key_nonce: string
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
function delete_datastore(
    token: string,
    session_secret_key: string,
    datastore_id: string,
    authkey: string
) {
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
    token: string,
    session_secret_key: string,
    datastore_id: string,
    encrypted_data: string | undefined,
    encrypted_data_nonce: string | undefined,
    encrypted_data_secret_key: string | undefined,
    encrypted_data_secret_key_nonce: string | undefined,
    description: string,
    is_default: boolean | undefined
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
function read_secret(
    token: string,
    session_secret_key: string,
    secret_id: string,
    synchronous: boolean | undefined
) {
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
    token: string,
    session_secret_key: string,
    encrypted_data: string,
    encrypted_data_nonce: string,
    link_id: string,
    parent_datastore_id: string,
    parent_share_id: string
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
    token: string,
    session_secret_key: string,
    secret_id: string,
    encrypted_data: string | undefined,
    encrypted_data_nonce: string | undefined
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
    token: string,
    session_secret_key: string,
    link_id: string,
    new_parent_share_id: string,
    new_parent_datastore_id: string
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
function delete_secret_link(
    token: string,
    session_secret_key: string,
    link_id: string
) {
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
function read_share(
    token: string,
    session_secret_key: string,
    share_id: string
) {
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
function read_shares(token: string, session_secret_key: string) {
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
    token: string,
    session_secret_key: string,
    encrypted_data: string | undefined,
    encrypted_data_nonce: string | undefined,
    key: string,
    key_nonce: string,
    parent_share_id: string,
    parent_datastore_id: string,
    link_id: string
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
    token: string,
    session_secret_key: string,
    share_id: string,
    encrypted_data: string | undefined,
    encrypted_data_nonce: string | undefined
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
function read_share_rights(
    token: string,
    session_secret_key: string,
    share_id: string
) {
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
function read_share_rights_overview(token: string, session_secret_key: string) {
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
    token: string,
    session_secret_key: string,
    encrypted_title: string,
    encrypted_title_nonce: string,
    encrypted_type: string,
    encrypted_type_nonce: string,
    share_id: string,
    user_id: string,
    group_id: string,
    key: string,
    key_nonce: string,
    read: boolean,
    write: boolean,
    grant: boolean
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
    token: string,
    session_secret_key: string,
    share_id: string,
    user_id: string,
    group_id: string,
    read: boolean,
    write: boolean,
    grant: boolean
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
    token: string,
    session_secret_key: string,
    user_share_right_id: string,
    group_share_right_id: string
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
function read_share_rights_inherit_overview(
    token: string,
    session_secret_key: string
) {
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
    token: string,
    session_secret_key: string,
    share_right_id: string,
    key: string,
    key_nonce: string,
    key_type: string
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
function decline_share_right(
    token: string,
    session_secret_key: string,
    share_right_id: string
) {
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
function search_user(
    token: string,
    session_secret_key: string,
    user_id: string,
    user_username: string | undefined
) {
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
 * Ajax PUT request with the token as authentication to generate a TOTP
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {string} title The title of the new GA
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with the secret
 */
function create_ga(token: string, session_secret_key: string, title: string) {
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
 * Ajax GET request to get a list of all registered TOTPs
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise with a list of all TOTPs
 */
function read_ga(token: string, session_secret_key: string) {
    const endpoint = '/user/ga/';
    const method = 'GET';
    const data = null;

    const headers = {
        Authorization: 'Token ' + token,
    };

    return call(method, endpoint, data, headers, session_secret_key);
}

/**
 * Ajax POST request to activate registered TOTP
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} google_authenticator_id The TOTP id to activate
 * @param {string} google_authenticator_token One TOTP Code
 *
 * @returns {Promise<AxiosResponse<any>>} Returns weather it was successful or not
 */
function activate_ga(
    token: string,
    session_secret_key: string,
    google_authenticator_id: string,
    google_authenticator_token: string
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
 * Ajax DELETE request to delete a given TOTP
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} google_authenticator_id The TOTP id to delete
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise which can succeed or fail
 */
function delete_ga(
    token: string,
    session_secret_key: string,
    google_authenticator_id: string
) {
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
    token: string,
    session_secret_key: string,
    title: string,
    integration_key: string,
    secret_key: string,
    host: string
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
function read_duo(token: string, session_secret_key: string) {
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
function activate_duo(
    token: string,
    session_secret_key: string,
    duo_id: string,
    duo_token: string
) {
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
 * Ajax DELETE request to delete a given TOTP
 *
 * @param {string} token authentication token of the user, returned by authentication_login(email, authkey)
 * @param {string} session_secret_key The session secret key
 * @param {uuid} duo_id The duo id to delete
 *
 * @returns {Promise<AxiosResponse<any>>} Returns a promise which can succeed or fail
 */
function delete_duo(token: string, session_secret_key: string, duo_id: string) {
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
function create_yubikey_otp(
    token: string,
    session_secret_key: string,
    title: string,
    yubikey_otp: string
) {
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
function read_yubikey_otp(token: string, session_secret_key: string) {
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
    token: string,
    session_secret_key: string,
    yubikey_id: string,
    yubikey_otp: string
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
function delete_yubikey_otp(
    token: string,
    session_secret_key: string,
    yubikey_otp_id: string
) {
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
    token: string,
    session_secret_key: string,
    link_id: string,
    share_id: string,
    parent_share_id: string,
    parent_datastore_id: string
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
    token: string,
    session_secret_key: string,
    link_id: string,
    new_parent_share_id: string,
    new_parent_datastore_id: string
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
function delete_share_link(
    token: string,
    session_secret_key: string,
    link_id: string
) {
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
function read_group(
    token: string,
    session_secret_key: string,
    group_id: string
) {
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
    token: string,
    session_secret_key: string,
    name: string,
    secret_key: string,
    secret_key_nonce: string,
    private_key: string,
    private_key_nonce: string,
    public_key: string
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
function update_group(
    token: string,
    session_secret_key: string,
    group_id: string,
    name: string
) {
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
function delete_group(
    token: string,
    session_secret_key: string,
    group_id: string
) {
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
function read_group_rights(
    token: string,
    session_secret_key: string,
    group_id: string
) {
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
    token: string,
    session_secret_key: string,
    group_id: string,
    user_id: string,
    secret_key: string,
    secret_key_nonce: string,
    secret_key_type: string,
    private_key: string,
    private_key_nonce: string,
    private_key_type: string,
    group_admin: boolean
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
    token: string,
    session_secret_key: string,
    membership_id: string,
    group_admin: boolean
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
function delete_membership(
    token: string,
    session_secret_key: string,
    membership_id: string
) {
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
function accept_membership(
    token: string,
    session_secret_key: string,
    membership_id: string
) {
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
function decline_membership(
    token: string,
    session_secret_key: string,
    membership_id: string
) {
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
function delete_account(
    token: string,
    session_secret_key: string,
    authkey: string
) {
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
function webauthnVerifyInit(
    token: string,
    sessionSecretKey: string,
    origin: string
) {
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
function webauthnVerify(
    token: string,
    sessionSecretKey: string,
    credential: string
) {
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

const ivaltVerify = function (
    token: string,
    sessionSecretKey: string,
    requestType: any
) {
    const endpoint = '/authentication/ivalt-verify/';
    const method = 'POST';
    const data = {
        request_type: requestType,
    };
    const headers = {
        Authorization: 'Token ' + token,
    };
    return call(method, endpoint, data, headers, sessionSecretKey);
};

const service = {
    info,
    healthcheck,
    admin_stats_browser,
    admin_stats_device,
    admin_stats_os,
    admin_stats_two_factor,
    admin_info,
    admin_authorization,
    admin_capability,
    admin_tenant,
    admin_create_tenant,
    admin_update_tenant,
    admin_delete_tenant,
    admin_tenant_membership,
    admin_administrative_role,
    admin_create_administrative_role,
    admin_update_administrative_role,
    admin_delete_administrative_role,
    admin_administrative_role_assignment,
    admin_create_administrative_role_assignment,
    admin_update_administrative_role_assignment,
    admin_delete_administrative_role_assignment,
    admin_user,
    admin_session,
    admin_group,
    admin_update_group,
    admin_security_report,
    admin_create_user,
    admin_delete_user,
    admin_wipe_user,
    admin_read_user_password_reset,
    admin_reset_user_password,
    admin_delete_session,
    admin_policy,
    admin_policy_create_group_map,
    admin_policy_delete_group_map,
    admin_policy_create_user_map,
    admin_policy_delete_user_map,
    admin_create_policy,
    admin_update_policy,
    admin_delete_policy,
    admin_fileserver_cluster,
    admin_create_fileserver_cluster,
    admin_update_fileserver_cluster,
    admin_delete_fileserver_cluster,
    admin_generate_fileserver_cluster_configuration,
    admin_fileserver_shard,
    admin_create_fileserver_shard,
    admin_update_fileserver_shard,
    admin_delete_fileserver_shard,
    admin_create_fileserver_cluster_shard_link,
    admin_update_fileserver_cluster_shard_link,
    admin_delete_fileserver_cluster_shard_link,
    admin_fileserver,
    admin_gateway_cluster,
    admin_create_gateway_cluster,
    admin_update_gateway_cluster,
    admin_delete_gateway_cluster,
    admin_generate_gateway_cluster_configuration,
    admin_gateway_cluster_user_map,
    admin_gateway_cluster_group_map,
    admin_gateway,
    admin_create_group,
    adminCreateShareRight,
    admin_delete_group,
    admin_update_membership,
    admin_update_group_share_right,
    admin_delete_membership,
    admin_delete_group_share_right,
    admin_delete_duo,
    adminDeleteIvalt,
    admin_delete_yubikey_otp,
    admin_delete_webauthn,
    admin_delete_google_authenticator,
    admin_delete_recovery_code,
    admin_delete_emergency_code,
    admin_delete_link_share,
    admin_ldap_user,
    admin_ldap_group,
    admin_update_ldap_group_tenants,
    admin_identity_provider_tenant,
    admin_ldap_create_group_map,
    admin_ldap_update_group_map,
    admin_ldap_delete_group_map,
    admin_ldap_group_sync,
    admin_scim_group,
    admin_update_scim_group_tenants,
    admin_delete_scim_group,
    admin_saml_group,
    admin_update_saml_group_tenants,
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
    admin_update_oidc_group_tenants,
    admin_oidc_create_group_map,
    admin_oidc_update_group_map,
    admin_oidc_delete_group_map,
    admin_update_user,
    prelogin,
    login,
    samlInitiateLogin,
    samlLogin,
    oidcInitiateLogin,
    oidcLogin,
    ga_verify,
    duo_verify,
    yubikey_otp_verify,
    activateToken,
    get_sessions,
    logout,
    register,
    verify_email,
    updateUser,
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
    ivaltVerify,
};

export default service;
