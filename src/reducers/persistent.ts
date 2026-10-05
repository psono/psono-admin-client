import type { AnyAction } from 'redux';
import { SET_KNOWN_HOSTS } from '../actions/actionTypes';

const default_known_hosts = [
    {
        url: 'https://www.psono.pw/server',
        verify_key:
            'a16301bd25e3a445a83b279e7091ea91d085901933f310fdb1b137db9676de59',
    },
];

function persistent(
    state = {
        known_hosts: default_known_hosts,
    },
    action: AnyAction
) {
    switch (action.type) {
        case SET_KNOWN_HOSTS:
            return Object.assign({}, state, {
                known_hosts: action.known_hosts,
            });
        default:
            return state;
    }
}

export default persistent;
