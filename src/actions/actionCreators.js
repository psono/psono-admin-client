//import history from '../utils/history'
import {
    LOGIN,
    LOGOUT
} from './actionTypes'

export function setIsLoggedIn(username) {
    return {
        type: LOGIN,
        username,
    }
}

export function login(username, password) {
    return (dispatch) => {
        dispatch(setIsLoggedIn(username));
        //history.push('/dashboard');
    };
}
export function logout() {
    return {
        type: LOGOUT
    }
}