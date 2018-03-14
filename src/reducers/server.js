import {
    LOGOUT,
    SET_SERVER_INFO,
    SET_SERVER_URL
} from '../actions/actionTypes';
import store from '../services/store';

const default_url = 'https://www.psono.pw/server';
const default_api = '';
const default_authentication_methods = [];
const default_build = '';
const default_license_id = '';
const default_license_mode = '';
const default_license_type = '';
const default_type = '';
const default_license_max_users = undefined;
const default_license_valid_from = undefined;
const default_license_valid_till = undefined;
const default_log_audit = false;
const default_management = false;
const default_public_key = '';
const default_version = '';
const default_web_client = '';

function server(
    state = {
        url: default_url,
        api: default_api,
        authentication_methods: default_authentication_methods,
        build: default_build,
        license_id: default_license_id,
        license_max_users: default_license_max_users,
        license_mode: default_license_mode,
        license_type: default_license_type,
        type: default_type,
        license_valid_from: default_license_valid_from,
        license_valid_till: default_license_valid_till,
        log_audit: default_log_audit,
        management: default_management,
        public_key: default_public_key,
        version: default_version,
        web_client: default_web_client
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
                build: default_build,
                license_id: default_license_id,
                license_max_users: default_license_max_users,
                license_mode: default_license_mode,
                license_type: default_license_type,
                type: default_type,
                license_valid_from: default_license_valid_from,
                license_valid_till: default_license_valid_till,
                log_audit: default_log_audit,
                management: default_management,
                public_key: default_public_key,
                version: default_version,
                web_client: default_web_client
            });
        case SET_SERVER_INFO:
            return Object.assign({}, state, {
                api: action.info.api,
                authentication_methods: action.info.authentication_methods,
                build: action.info.build,
                license_id: action.info.license_id,
                license_max_users: action.info.license_max_users,
                license_mode: action.info.license_mode,
                license_type: action.info.license_type,
                type: action.info.type,
                license_valid_from: action.info.license_valid_from,
                license_valid_till: action.info.license_valid_till,
                log_audit: action.info.log_audit,
                management: action.info.management,
                public_key: action.info.public_key,
                version: action.info.version,
                web_client: action.info.web_client
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
