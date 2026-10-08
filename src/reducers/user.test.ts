import user from './user';
import {
    LOGOUT,
    SET_AUTHORIZATION,
    SET_HASHING_PARAMETERS,
} from '../actions/actionTypes';

test('stores authorization and clears it on logout', () => {
    const authorization = {
        is_superuser: false,
        roles: [],
        capabilities: {},
    };
    const authorizedState = user(undefined, {
        type: SET_AUTHORIZATION,
        authorization,
    });
    expect(authorizedState.authorization).toBe(authorization);

    const loggedOutState = user(authorizedState, { type: LOGOUT });
    expect(loggedOutState.authorization).toBeNull();
});

test('retains account hashing settings and resets them on logout', () => {
    const hashingParameters = { u: 15, r: 8, p: 1, l: 64 };
    const state = user(undefined, {
        type: SET_HASHING_PARAMETERS,
        hashingAlgorithm: 'scrypt',
        hashingParameters,
    });
    expect(state.hashingParameters).toEqual(hashingParameters);
    const loggedOut = user(state, { type: LOGOUT });
    expect(loggedOut.hashingAlgorithm).toBe('scrypt');
    expect(loggedOut.hashingParameters).toEqual({ u: 14, r: 8, p: 1, l: 64 });
});
