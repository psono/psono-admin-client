import { combineReducers } from 'redux'
import {
    LOGIN,
    LOGOUT,
} from '../actions/actionTypes'


function user(
    state = {
        isLoggedIn: false,
        username: ''
    },
    action
) {
    switch (action.type) {
        case LOGIN:
            return Object.assign({}, state, {
                isLoggedIn: true,
                username: action.username
            });
        case LOGOUT:
            return Object.assign({}, state, {
                isLoggedIn: false
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