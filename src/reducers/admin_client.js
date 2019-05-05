import { LOGOUT, SET_ADMIN_CLIENT_CONFIG } from '../actions/actionTypes';

const default_config = {};

function server(
    state = {
        config: default_config
    },
    action
) {
    switch (action.type) {
        case LOGOUT:
            return Object.assign({}, state, {
                config: default_config
            });
        case SET_ADMIN_CLIENT_CONFIG:
            return Object.assign({}, state, {
                config: action.config
            });
        default:
            return state;
    }
}

export default server;
