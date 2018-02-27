import {
    LOGOUT,
    SET_SERVER_INFO,
    SET_SERVER_URL
} from '../actions/actionTypes';
import store from '../services/store';

const default_url = 'https://www.psono.pw/server';
const default_api = '';
const default_authentication_methods = [];
const default_public_key = '';
const default_version = '';
const default_build = '';
const default_license_max_users = undefined;
const default_license_valid_from = undefined;
const default_license_valid_till = undefined;

function server(
    state = {
        url: default_url,
        api: default_api,
        authentication_methods: default_authentication_methods,
        public_key: default_public_key,
        version: default_version,
        build: default_build,
        license_max_users: default_license_max_users,
        license_valid_from: default_license_valid_from,
        license_valid_till: default_license_valid_till
    },
    action
) {
    switch (action.type) {
        case LOGOUT:
            return Object.assign({}, state, {
                url: store.getState().user.remember_me
                    ? state.url
                    : default_url.toLowerCase(),
                api: default_api,
                authentication_methods: default_authentication_methods,
                public_key: default_public_key,
                version: default_version,
                build: default_build,
                license_max_users: default_license_max_users,
                license_valid_from: default_license_valid_from,
                license_valid_till: default_license_valid_till
            });
        case SET_SERVER_INFO:
            return Object.assign({}, state, {
                api: action.api,
                authentication_methods: action.authentication_methods,
                log_audit: action.log_audit,
                public_key: action.public_key,
                version: action.version,
                build: action.build,
                license_max_users: action.license_max_users,
                license_valid_from: action.license_valid_from,
                license_valid_till: action.license_valid_till
            });
        case SET_SERVER_URL:
            return Object.assign({}, state, {
                url: action.url.toLowerCase()
            });
        default:
            return state;
    }
}

export default server;
