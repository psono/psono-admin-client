import {
    SET_KNOWN_HOSTS,
    SET_USER_USERNAME,
    SET_USER_INFO_1,
    SET_USER_INFO_2,
    SET_USER_INFO_3,
    LOGOUT,
    SET_SERVER_URL,
    SET_SERVER_INFO,
    SET_CLIENT_URL,
    SET_ADMIN_CLIENT_CONFIG,
    NOTIFICATION_SEND,
    NOTIFICATION_SET
} from './actionTypes';

function set_user_username(username) {
    return dispatch => {
        dispatch({
            type: SET_USER_USERNAME,
            username
        });
    };
}

function set_user_info_1(remember_me, trust_device) {
    return dispatch => {
        dispatch({
            type: SET_USER_INFO_1,
            remember_me,
            trust_device
        });
    };
}
function set_user_info_2(
    user_private_key,
    user_public_key,
    session_secret_key,
    token,
    user_sauce
) {
    return dispatch => {
        dispatch({
            type: SET_USER_INFO_2,
            user_private_key,
            user_public_key,
            session_secret_key,
            token,
            user_sauce
        });
    };
}
function set_user_info_3(user_id, user_email, user_secret_key) {
    return dispatch => {
        dispatch({
            type: SET_USER_INFO_3,
            user_id,
            user_email,
            user_secret_key
        });
    };
}

function logout(remember_me) {
    return dispatch => {
        dispatch({
            type: LOGOUT,
            remember_me
        });
    };
}

function set_server_info(info) {
    return dispatch => {
        dispatch({
            type: SET_SERVER_INFO,
            info
        });
    };
}

function set_server_url(url) {
    return dispatch => {
        dispatch({
            type: SET_SERVER_URL,
            url: url
        });
    };
}

function set_client_url(url) {
    return dispatch => {
        dispatch({
            type: SET_CLIENT_URL,
            url: url
        });
    };
}

function set_admin_client_config(config) {
    return dispatch => {
        dispatch({
            type: SET_ADMIN_CLIENT_CONFIG,
            config: config
        });
    };
}

function set_known_hosts(known_hosts) {
    return dispatch => {
        dispatch({
            type: SET_KNOWN_HOSTS,
            known_hosts: known_hosts
        });
    };
}

function send_notification(message, message_type) {
    return dispatch => {
        dispatch({
            type: NOTIFICATION_SEND,
            message: message,
            message_type: message_type
        });
    };
}

function set_notifications(messages) {
    return dispatch => {
        dispatch({
            type: NOTIFICATION_SET,
            messages: messages
        });
    };
}

const actionCreators = {
    set_user_username,
    set_user_info_1,
    set_user_info_2,
    set_user_info_3,
    logout,
    set_server_info,
    set_server_url,
    set_client_url,
    set_admin_client_config,
    set_known_hosts,
    send_notification,
    set_notifications
};

export default actionCreators;
