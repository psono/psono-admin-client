import { combineReducers } from 'redux'
import {
    LOGIN,
    LOGOUT,
} from '../actions/actionTypes'


const default_username = '';
const default_server = 'https://psono.pw/server';
const default_remember_me = false;
const default_trust_device = false;

function user(
    state = {
        isLoggedIn: false,
        username: default_username,
        server: default_server,
        remember_me: default_remember_me,
        trust_device: default_trust_device,
    },
    action
) {
    switch (action.type) {
        case LOGIN:
            console.log(action);
            return Object.assign({}, state, {
                isLoggedIn: true,
                username: action.username,
                server: action.server,
                remember_me: action.remember_me,
                trust_device: action.trust_device,
            });
        case LOGOUT:
            return Object.assign({}, state, {
                isLoggedIn: false,
                username: state.remember_me ? state.username : default_username,
                server: state.remember_me ? state.server : default_server,
                remember_me: state.remember_me ? state.remember_me : default_remember_me,
                trust_device: state.remember_me ? state.trust_device : default_trust_device,
            });
        default:
            return state
    }
}

const rootReducer = combineReducers({
    user,
    //otherReducer
});

export default rootReducer