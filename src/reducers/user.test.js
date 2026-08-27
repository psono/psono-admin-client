import user from './user';
import { LOGOUT, SET_AUTHORIZATION } from '../actions/actionTypes';

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
