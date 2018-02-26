import {
    SET_KNOWN_HOSTS,
    SET_USER_INFO_1,
    SET_USER_INFO_2,
    SET_USER_INFO_3,
    LOGOUT,
    SET_SERVER_URL,
    SET_SERVER_INFO,
} from './actionTypes'


function set_user_info_1(username, remember_me, trust_device) {
    return (dispatch) => {
        dispatch({
            type: SET_USER_INFO_1,
            username,
            remember_me,
            trust_device,
        });

    };
}
function set_user_info_2(user_private_key, user_public_key, session_secret_key, token, user_sauce) {
    return (dispatch) => {
        dispatch({
            type: SET_USER_INFO_2,
            user_private_key,
            user_public_key,
            session_secret_key,
            token,
            user_sauce,
        });

    };
}
function set_user_info_3(user_id, user_email, user_secret_key) {
    return (dispatch) => {
        dispatch({
            type: SET_USER_INFO_3,
            user_id,
            user_email,
            user_secret_key
        });

    };
}

function logout() {
    return (dispatch) => {

        dispatch({
            type: LOGOUT
        });
    };
}

function set_server_info(info) {
    return (dispatch) => {
        info.type = SET_SERVER_INFO;
        dispatch(info);
    };
}

function set_server_url(url) {
    return (dispatch) => {
        dispatch({
            type: SET_SERVER_URL,
            url: url
        });
    };
}

function set_known_hosts(known_hosts) {
    return (dispatch) => {
        dispatch({
            type: SET_KNOWN_HOSTS,
            known_hosts: known_hosts
        });
    };
}

const actionCreators = {
    set_user_info_1,
    set_user_info_2,
    set_user_info_3,
    logout,
    set_server_info,
    set_server_url,
    set_known_hosts,
};

export default actionCreators

