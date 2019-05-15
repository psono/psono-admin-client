import {
    SET_USER_USERNAME,
    SET_USER_INFO_1,
    SET_USER_INFO_2,
    SET_USER_INFO_3,
    LOGOUT
} from '../actions/actionTypes';

const default_username = '';
const default_remember_me = false;
const default_trust_device = false;

function user(
    state = {
        isLoggedIn: false,
        username: default_username,
        remember_me: default_remember_me,
        trust_device: default_trust_device,
        user_secret_key: '',
        user_private_key: '',
        user_public_key: '',
        session_secret_key: '',
        token: '',
        user_sauce: '',
        user_email: '',
        user_id: ''
    },
    action
) {
    switch (action.type) {
        case SET_USER_USERNAME:
            return Object.assign({}, state, {
                username: action.username
            });
        case SET_USER_INFO_1:
            return Object.assign({}, state, {
                remember_me: action.remember_me,
                trust_device: action.trust_device
            });
        case SET_USER_INFO_2:
            return Object.assign({}, state, {
                user_private_key: action.user_private_key,
                user_public_key: action.user_public_key,
                session_secret_key: action.session_secret_key,
                token: action.token,
                user_sauce: action.user_sauce
            });
        case SET_USER_INFO_3:
            return Object.assign({}, state, {
                isLoggedIn: true,
                user_id: action.user_id,
                user_email: action.user_email,
                user_secret_key: action.user_secret_key
            });
        case LOGOUT:
            return Object.assign({}, state, {
                isLoggedIn: false,
                username: state.remember_me ? state.username : default_username,
                remember_me: state.remember_me
                    ? state.remember_me
                    : default_remember_me,
                trust_device: state.remember_me
                    ? state.trust_device
                    : default_trust_device,
                user_secret_key: '',
                user_private_key: '',
                user_email: '',
                user_id: '',
                user_public_key: '',
                session_secret_key: '',
                token: '',
                user_sauce: ''
            });
        default:
            return state;
    }
}

export default user;
