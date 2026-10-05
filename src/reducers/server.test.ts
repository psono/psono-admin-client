import server from './server';
import { LOGOUT, SET_SERVER_INFO } from '../actions/actionTypes';

test('stores password reset policy and clears it on logout', () => {
    const configuredState = server(undefined, {
        type: SET_SERVER_INFO,
        info: {
            admin_recovery_password_reset_enabled: true,
            compliance_server_secrets: 'auto',
        },
    });

    expect(configuredState.admin_recovery_password_reset_enabled).toBe(true);
    expect(configuredState.compliance_server_secrets).toBe('auto');

    const loggedOutState = server(configuredState, { type: LOGOUT });
    expect(loggedOutState.admin_recovery_password_reset_enabled).toBe(false);
    expect(loggedOutState.compliance_server_secrets).toBe('noone');
});

test('defaults missing password reset policy to disabled', () => {
    const configuredState = server(undefined, {
        type: SET_SERVER_INFO,
        info: {},
    });

    expect(configuredState.admin_recovery_password_reset_enabled).toBe(false);
    expect(configuredState.compliance_server_secrets).toBe('noone');
});
