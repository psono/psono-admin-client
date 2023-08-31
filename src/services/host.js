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
function get_known_hosts() {
    return store.getState().persistent.known_hosts;
}
/**
 * Returns the current host
 *
 * @returns {*} The current host
 */
function get_current_host() {
    return store.getState().server;
}
/**
 * Returns the url of the current host
 *
 * @returns {*} The current host url
 */
function get_current_host_url() {
    return store.getState().server.url;
}

/**
 * Updates the known servers with the given new list of servers
 *
 * @param {array} new_known_hosts List of the new servers
 */
function update_known_hosts(new_known_hosts) {
    action.set_known_hosts(new_known_hosts);
}

/**
 * Tries to find the server_url and fingerprint in the known hosts storage and compares the fingerprint
 *
 * @param {string} server_url The url of the server
 * @param {string} verify_key The fingerprint of the server
 *
 * @returns {*} The result of the search / comparison
 */
function check_known_hosts(server_url, verify_key) {
    const known_hosts = get_known_hosts();
    server_url = server_url.toLowerCase();

    for (let i = 0; i < known_hosts.length; i++) {
        if (known_hosts[i]['url'] !== server_url) {
            continue;
        }
        if (known_hosts[i]['verify_key'] !== verify_key) {
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
 * Validates the signature of the server and compares it to known hosts.
 *
 * @param {object} server The server object
 *
 * @returns {Promise<AxiosResponse<any>>}
 */
function check_host(server) {
    const onSuccess = function (response) {
        let check_result;
        const data = response.data;
        const server_url = server.toLowerCase();
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
                server_url: server_url,
                status: 'invalid_signature',
                verify_key: undefined,
                info: info,
            };
        }

        check_result = check_known_hosts(server_url, data['verify_key']);

        if (check_result['status'] === 'matched') {
            return {
                server_url: server_url,
                status: 'matched',
                verify_key: data['verify_key'],
                info: info,
            };
        } else if (check_result['status'] === 'signature_changed') {
            return {
                server_url: server_url,
                status: 'signature_changed',
                verify_key: data['verify_key'],
                verify_key_old: check_result['verify_key_old'],
                info: info,
            };
        } else {
            return {
                server_url: server_url,
                status: 'new_server',
                verify_key: data['verify_key'],
                info: info,
            };
        }
    };

    return psono_server.info().then(onSuccess);
}

/**
 * Puts the server with the specified url and verify key on the approved servers list
 *
 * @param {string} server_url The url of the server
 * @param {string} verify_key The verification key
 */
function approve_host(server_url, verify_key) {
    server_url = server_url.toLowerCase();

    let known_hosts = get_known_hosts();

    for (let i = 0; i < known_hosts.length; i++) {
        if (known_hosts[i]['url'] !== server_url) {
            continue;
        }
        known_hosts[i]['verify_key'] = verify_key;

        update_known_hosts(known_hosts);
        return;
    }

    known_hosts.push({
        url: server_url,
        verify_key: verify_key,
    });

    update_known_hosts(known_hosts);
}

/**
 * Deletes a known host identified by its fingerprint from the storage
 *
 * @param {string} fingerprint The fingerprint of the host
 */
function delete_known_host(fingerprint) {
    let known_hosts = get_known_hosts();

    helper.remove_from_array(
        known_hosts,
        fingerprint,
        function (known_host, fingerprint) {
            return known_host['verify_key'] === fingerprint;
        }
    );

    update_known_hosts(known_hosts);
}

const service = {
    get_known_hosts,
    get_current_host,
    get_current_host_url,
    check_known_hosts,
    check_host,
    approve_host,
    delete_known_host,
    update_known_hosts,
};

export default service;
