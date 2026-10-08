import type { Dispatch } from 'redux';
import type { Authorization } from '../types/authorization';
import type { ServerState } from '../types/state';
import type { KnownHost } from '../types/state';
import type { NotificationMessage } from '../types/state';
import type { ApiRecord } from '../types/api';
import type { HashingParameters } from '../types/api';
import { LEGACY_HASHING_PARAMETERS } from '../services/hashing-parameters';
import {
    SET_KNOWN_HOSTS,
    SET_USER_USERNAME,
    SET_USER_INFO_1,
    SET_USER_INFO_2,
    SET_USER_INFO_3,
    SET_REQUIRE_PASSWORD_CHANGE,
    SET_HASHING_PARAMETERS,
    SET_SERVER_SECRET_EXISTS,
    LOGOUT,
    SET_SERVER_URL,
    SET_SERVER_INFO,
    SET_CLIENT_URL,
    SET_ADMIN_CLIENT_CONFIG,
    NOTIFICATION_SEND,
    NOTIFICATION_SET,
    SET_AUTHORIZATION,
} from './actionTypes';

function setUserUsername(username: string) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: SET_USER_USERNAME,
            username,
        });
    };
}

function setUserInfo1(
    remember_me: boolean,
    trust_device: boolean,
    authentication?: string
) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: SET_USER_INFO_1,
            remember_me,
            trust_device,
            authentication,
        });
    };
}
function setUserInfo2(
    user_private_key: string,
    user_public_key: string,
    session_secret_key: string,
    token: string,
    user_sauce: string,
    authentication: string
) {
    return (dispatch: Dispatch) => {
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
    user_id: string,
    user_email: string,
    user_secret_key: string,
    serverSecretExists: boolean,
    requirePasswordChange = false,
    defaultHashingAlgorithm = 'scrypt',
    defaultHashingParameters: HashingParameters = LEGACY_HASHING_PARAMETERS
) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: SET_USER_INFO_3,
            user_id,
            user_email,
            user_secret_key,
            serverSecretExists,
            requirePasswordChange,
            defaultHashingAlgorithm,
            defaultHashingParameters,
        });
    };
}

function setRequirePasswordChange(requirePasswordChange: boolean) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: SET_REQUIRE_PASSWORD_CHANGE,
            requirePasswordChange,
        });
    };
}

function sethashingParameters(
    hashingAlgorithm: string,
    hashingParameters: HashingParameters | undefined
) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: SET_HASHING_PARAMETERS,
            hashingAlgorithm,
            hashingParameters,
        });
    };
}
function setServerSecretExists(serverSecretExists: boolean) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: SET_SERVER_SECRET_EXISTS,
            serverSecretExists: serverSecretExists,
        });
    };
}

function logout(remember_me: boolean) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: LOGOUT,
            remember_me,
        });
    };
}

function setAuthorization(authorization: Authorization | null) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: SET_AUTHORIZATION,
            authorization,
        });
    };
}

function setServerInfo(info: ServerState) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: SET_SERVER_INFO,
            info,
        });
    };
}

function setServerUrl(url: string) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: SET_SERVER_URL,
            url: url,
        });
    };
}

function setClientUrl(url: string) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: SET_CLIENT_URL,
            url: url,
        });
    };
}

function setAdminClientConfig(config: ApiRecord) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: SET_ADMIN_CLIENT_CONFIG,
            config: config,
        });
    };
}

function setKnownHosts(known_hosts: KnownHost[]) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: SET_KNOWN_HOSTS,
            known_hosts: known_hosts,
        });
    };
}

function sendNotification(message: string, message_type: string) {
    return (dispatch: Dispatch) => {
        dispatch({
            type: NOTIFICATION_SEND,
            message: message,
            message_type: message_type,
        });
    };
}

function setNotifications(messages: NotificationMessage[]) {
    return (dispatch: Dispatch) => {
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
    setRequirePasswordChange,
    sethashingParameters,
    setServerSecretExists,
    logout,
    setServerInfo,
    setServerUrl,
    setClientUrl,
    setAdminClientConfig,
    setKnownHosts,
    sendNotification,
    setNotifications,
    setAuthorization,
};

export default actionCreators;
