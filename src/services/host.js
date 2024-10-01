import helper from './helper';
import store from './store';
import psono_server from './api-server';
import cryptoLibrary from './cryptoLibrary';
import action from '../actions/boundActionCreators';

/**
 * Returns all known hosts
 *
 * @returns {*} The known hosts
 */
function getKnownHosts() {
    return store.getState().persistent.known_hosts;
}
/**
 * Returns the current host
 *
 * @returns {*} The current host
 */
function getCurrentHost() {
    return store.getState().server;
}
/**
 * Returns the url of the current host
 *
 * @returns {*} The current host url
 */
function getCurrentHostUrl() {
    return store.getState().server.url;
}

/**
 * Updates the known servers with the given new list of servers
 *
 * @param {array} newKnownHosts List of the new servers
 */
function updateKnownHosts(newKnownHosts) {
    action.setKnownHosts(newKnownHosts);
}

/**
 * Tries to find the serverUrl and fingerprint in the known hosts storage and compares the fingerprint
 *
 * @param {string} serverUrl The url of the server
 * @param {string} verifyKey The fingerprint of the server
 *
 * @returns {*} The result of the search / comparison
 */
function checkKnownHosts(serverUrl, verifyKey) {
    const known_hosts = getKnownHosts();
    serverUrl = serverUrl.toLowerCase();

    for (let i = 0; i < known_hosts.length; i++) {
        if (known_hosts[i]['url'] !== serverUrl) {
            continue;
        }
        if (known_hosts[i]['verify_key'] !== verifyKey) {
            return {
                status: 'signature_changed',
                verify_key_old: known_hosts[i]['verify_key'],
            };
        }
        return {
            status: 'matched',
        };
    }

    return {
        status: 'not_found',
    };
}

/**
 * Returns the server info
 *
 * @returns {Promise} Server info
 */
function info() {
    const onSuccess = function (response) {
        response.data['decoded_info'] = JSON.parse(response.data['info']);

        return response;
    };
    return psono_server.info().then(onSuccess);
}

/**
 * Simple semver comparison of two semantic versioned strings like "1.0" and "2.5-alpha" or "3.2+whatever"
 *
 * Returns a number encoding the relation
 * "-1": "a < b",
 *  "0": "=",
 *  "1":  ">"
 *
 * @param a
 * @param b
 * @returns {number}
 */
function semverCompare(a, b) {
    // remove everything after whitespace
    a = a.replace(/\s.*/, '');
    b = b.replace(/\s.*/, '');
    // remove everything after + sign
    a = a.replace(/\+.*/, '');
    b = b.replace(/\+.*/, '');

    // handles cases like "1.2.3", ">", "1.2.3-asdf"
    if (a.startsWith(b + '-')) return -1;
    if (b.startsWith(a + '-')) return 1;

    return a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: 'case',
        caseFirst: 'upper',
    });
}

/**
 * Validates the signature of the server and compares it to known hosts.
 *
 * @param {object} server The server object
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function checkHost(server) {
    const onSuccess = function (response) {
        let check_result;
        const data = response.data;
        const serverUrl = server.toLowerCase();
        const info = JSON.parse(data['info']);
        const split_version = info.version.split(' ');
        info.version = 'v' + split_version[0];
        info.build = split_version[2].replace(')', '');

        if (
            !cryptoLibrary.validate_signature(
                data['info'],
                data['signature'],
                data['verify_key']
            )
        ) {
            return {
                server_url: serverUrl,
                status: 'invalid_signature',
                verify_key: undefined,
                info: info,
            };
        }

        const minVersion = {
            CE: '4.0.0',
            EE: '4.0.0',
        };

        if (
            semverCompare(
                minVersion[data['decoded_info']['type']],
                data['decoded_info']['version']
            ) > 0
        ) {
            return {
                server_url: serverUrl,
                status: 'unsupported_server_version',
                verify_key: data['verify_key'],
                info: info,
            };
        }

        check_result = checkKnownHosts(serverUrl, data['verify_key']);

        if (check_result['status'] === 'matched') {
            return {
                server_url: serverUrl,
                status: 'matched',
                verify_key: data['verify_key'],
                info: info,
            };
        } else if (check_result['status'] === 'signature_changed') {
            return {
                server_url: serverUrl,
                status: 'signature_changed',
                verify_key: data['verify_key'],
                verify_key_old: check_result['verify_key_old'],
                info: info,
            };
        } else {
            return {
                server_url: serverUrl,
                status: 'new_server',
                verify_key: data['verify_key'],
                info: info,
            };
        }
    };

    return info().then(onSuccess);
}

/**
 * Puts the server with the specified url and verify key on the approved servers list
 *
 * @param {string} serverUrl The url of the server
 * @param {string} verifyKey The verification key
 */
function approveHost(serverUrl, verifyKey) {
    serverUrl = serverUrl.toLowerCase();

    let known_hosts = getKnownHosts();

    for (let i = 0; i < known_hosts.length; i++) {
        if (known_hosts[i]['url'] !== serverUrl) {
            continue;
        }
        known_hosts[i]['verify_key'] = verifyKey;

        updateKnownHosts(known_hosts);
        return;
    }

    known_hosts.push({
        url: serverUrl,
        verify_key: verifyKey,
    });

    updateKnownHosts(known_hosts);
}

/**
 * Deletes a known host identified by its fingerprint from the storage
 *
 * @param {string} fingerprint The fingerprint of the host
 */
function deleteKnownHost(fingerprint) {
    let known_hosts = getKnownHosts();

    helper.removeFromArray(
        known_hosts,
        fingerprint,
        function (known_host, fingerprint) {
            return known_host['verify_key'] === fingerprint;
        }
    );

    updateKnownHosts(known_hosts);
}

const service = {
    getKnownHosts,
    getCurrentHost,
    getCurrentHostUrl,
    checkKnownHosts,
    checkHost,
    approveHost,
    deleteKnownHost,
    updateKnownHosts,
};

export default service;
