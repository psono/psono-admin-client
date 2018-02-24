import {
    LOGIN,
    LOGOUT
} from './actionTypes'

export function setIsLoggedIn(username, server, remember_me, trust_device) {
    return {
        type: LOGIN,
        username,
        server,
        remember_me,
        trust_device,
    }
}
export function setIsLoggedOut() {
    return {
        type: LOGOUT
    }
}

export function login(username, password, server, remember_me, trust_device) {
    return (dispatch) => {
        dispatch(setIsLoggedIn(username, server, remember_me, trust_device));
    };
}
export function logout() {
    return (dispatch) => {

        dispatch(setIsLoggedOut());
    };
}