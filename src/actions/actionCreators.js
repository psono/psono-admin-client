import {
    SET_KNOWN_HOSTS,
    SET_USER_USERNAME,
    SET_USER_INFO_1,
    SET_USER_INFO_2,
    SET_USER_INFO_3,
    SET_SERVER_SECRET_EXISTS,
    LOGOUT,
    SET_SERVER_URL,
    SET_SERVER_INFO,
    SET_CLIENT_URL,
    SET_ADMIN_CLIENT_CONFIG,
    NOTIFICATION_SEND,
    NOTIFICATION_SET,
} from './actionTypes';

function setUserUsername(username) {
    return (dispatch) => {
        dispatch({
            type: SET_USER_USERNAME,
            username,
        });
    };
}

function setUserInfo1(remember_me, trust_device, authentication) {
    return (dispatch) => {
        dispatch({
            type: SET_USER_INFO_1,
            remember_me,
            trust_device,
            authentication,
        });
    };
}
function setUserInfo2(
    user_private_key,
    user_public_key,
    session_secret_key,
    token,
    user_sauce,
    authentication
) {
    return (dispatch) => {
        dispatch({
            type: SET_USER_INFO_2,
            user_private_key,
            user_public_key,
            session_secret_key,
            token,
            user_sauce,
            authentication,
        });
    };
}
function setUserInfo3(
    user_id,
    user_email,
    user_secret_key,
    serverSecretExists
) {
    return (dispatch) => {
        dispatch({
            type: SET_USER_INFO_3,
            user_id,
            user_email,
            user_secret_key,
            serverSecretExists,
        });
    };
}
function setServerSecretExists(serverSecretExists) {
    return (dispatch) => {
        dispatch({
            type: SET_SERVER_SECRET_EXISTS,
            serverSecretExists: serverSecretExists,
        });
    };
}

function logout(remember_me) {
    return (dispatch) => {
        dispatch({
            type: LOGOUT,
            remember_me,
        });
    };
}

function setServerInfo(info) {
    return (dispatch) => {
        dispatch({
            type: SET_SERVER_INFO,
            info,
        });
    };
}

function setServerUrl(url) {
    return (dispatch) => {
        dispatch({
            type: SET_SERVER_URL,
            url: url,
        });
    };
}

function setClientUrl(url) {
    return (dispatch) => {
        dispatch({
            type: SET_CLIENT_URL,
            url: url,
        });
    };
}

function setAdminClientConfig(config) {
    return (dispatch) => {
        dispatch({
            type: SET_ADMIN_CLIENT_CONFIG,
            config: config,
        });
    };
}

function setKnownHosts(known_hosts) {
    return (dispatch) => {
        dispatch({
            type: SET_KNOWN_HOSTS,
            known_hosts: known_hosts,
        });
    };
}

function sendNotification(message, message_type) {
    return (dispatch) => {
        dispatch({
            type: NOTIFICATION_SEND,
            message: message,
            message_type: message_type,
        });
    };
}

function setNotifications(messages) {
    return (dispatch) => {
        dispatch({
            type: NOTIFICATION_SET,
            messages: messages,
        });
    };
}

const actionCreators = {
    setUserUsername,
    setUserInfo1,
    setUserInfo2,
    setUserInfo3,
    setServerSecretExists,
    logout,
    setServerInfo,
    setServerUrl,
    setClientUrl,
    setAdminClientConfig,
    setKnownHosts,
    sendNotification,
    setNotifications,
};

export default actionCreators;
