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

test.each([
    ['', false],
    ['   ', false],
    [null, false],
    ['ab'.repeat(32), true],
])(
    'records whether the advertised recovery public key is configured: %p',
    (key, expected) => {
        const state = server(undefined, {
            type: SET_SERVER_INFO,
            info: { type: 'EE', admin_recovery_public_key: key },
        });
        expect(state.admin_recovery_public_key_configured).toBe(expected);
        expect(
            server(state, { type: LOGOUT }).admin_recovery_public_key_configured
        ).toBeUndefined();
    }
);

test('treats missing recovery configuration as unknown on CE and older servers', () => {
    const configured = server(undefined, {
        type: SET_SERVER_INFO,
        info: { type: 'EE', admin_recovery_public_key: 'ab'.repeat(32) },
    });
    for (const type of ['CE', 'EE']) {
        const state = server(configured, {
            type: SET_SERVER_INFO,
            info: { type },
        });
        expect(state.admin_recovery_public_key_configured).toBeUndefined();
    }
});
