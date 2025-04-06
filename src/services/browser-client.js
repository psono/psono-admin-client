/**
 * Browser client service for the psono web client
 */

import action from '../actions/boundActionCreators';
import helper from './helper';
import notification from './notification';

let _admin_client_config = {};

function loadConfig() {
    return fetch(process.env.PUBLIC_URL + '/config.json').then(
        async (response) => {
            let configJson;

            try {
                configJson = await response.json();
            } catch (e) {
                notification.errorSend('CONFIG_JSON_MALFORMED');
                return {};
            }

            return configJson;
        }
    );
}

/**
 * helper function to return either the config itself or if key has been specified only the config part for the key
 *
 * @param config
 * @param key
 * @returns {*}
 * @private
 */
function _get_config(config, key) {
    if (typeof key === 'undefined') {
        return config;
    }
    if (config.hasOwnProperty(key)) {
        return config[key];
    }

    return null;
}

/**
 * Loads the config (or only the part specified by the "key") fresh or from "cache"
 *
 * @param key
 * @returns {*}
 */
function get_config(key) {
    return new Promise((resolve, reject) => {
        if (Object.keys(_admin_client_config).length === 0) {
            loadConfig().then((admin_client_config) => {
                const parsed_url = helper.parse_url(window.location.href);
                if (!admin_client_config.hasOwnProperty('base_url')) {
                    admin_client_config['base_url'] =
                        parsed_url['base_url'] + '/';
                }
                if (admin_client_config.hasOwnProperty('backend_servers')) {
                    for (
                        let i = 0;
                        i < admin_client_config['backend_servers'].length;
                        i++
                    ) {
                        if (
                            !admin_client_config['backend_servers'][
                                i
                            ].hasOwnProperty('url')
                        ) {
                            admin_client_config['backend_servers'][i]['url'] =
                                parsed_url['base_url'] + '/server';
                        }
                        if (
                            !admin_client_config['backend_servers'][
                                i
                            ].hasOwnProperty('domain')
                        ) {
                            admin_client_config['backend_servers'][i][
                                'domain'
                            ] = helper.get_domain(
                                admin_client_config['backend_servers'][i]['url']
                            );
                        }
                    }
                }

                if (
                    !admin_client_config.hasOwnProperty(
                        'authentication_methods'
                    )
                ) {
                    admin_client_config['authentication_methods'] = [
                        'AUTHKEY',
                        'LDAP',
                        'SAML',
                        'OIDC',
                    ];
                }

                if (!admin_client_config.hasOwnProperty('saml_provider')) {
                    admin_client_config['saml_provider'] = [];
                }
                if (!admin_client_config.hasOwnProperty('oidc_provider')) {
                    admin_client_config['oidc_provider'] = [];
                }
                _admin_client_config = admin_client_config;
                action.setAdminClientConfig(admin_client_config);
                resolve(_get_config(admin_client_config, key));
            });
        } else {
            resolve(_get_config(_admin_client_config, key));
        }
    });
}

function get_saml_return_to_url() {
    return (
        window.location.href.split('/portal').slice(0, 1).join('/') +
        '/portal/saml/token/'
    );
}

function get_oidc_return_to_url() {
    return (
        window.location.href.split('/portal').slice(0, 1).join('/') +
        '/portal/oidc/token/'
    );
}

const service = {
    get_saml_return_to_url,
    get_oidc_return_to_url,
    get_config,
};

export default service;
