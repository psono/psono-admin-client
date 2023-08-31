import { LOGOUT, SET_CLIENT_URL } from '../actions/actionTypes';

const default_url = '';

function server(
    state = {
        url: default_url,
    },
    action
) {
    switch (action.type) {
        case LOGOUT:
            return Object.assign({}, state, {
                url: default_url.toLowerCase(),
            });
        case SET_CLIENT_URL:
            return Object.assign({}, state, {
                url: action.url.toLowerCase(),
            });
        default:
            return state;
    }
}

export default server;
