jest.mock('./store', () => ({
    getState: () => ({ server: { url: 'https://server.example' } }),
}));
jest.mock('./device', () => ({ getDeviceFingerprint: () => 'device' }));
jest.mock('./user', () => ({ isLoggedIn: () => false }));
jest.mock('../i18n', () => ({ t: (value) => value }));

import psonoServer from './api-server';

describe('user password reset API', () => {
    beforeEach(() => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            text: () => Promise.resolve('{}'),
        });
    });

    test('reads admin recovery material', async () => {
        await psonoServer.admin_read_user_password_reset(
            'token',
            null,
            'user-id'
        );

        expect(global.fetch).toHaveBeenCalledWith(
            'https://server.example/admin/user-password-reset/user-id/',
            expect.objectContaining({ method: 'GET' })
        );
    });

    test('submits only the prepared reset payload', async () => {
        const payload = {
            authkey: 'a'.repeat(128),
            private_key: 'b'.repeat(160),
            private_key_nonce: 'c'.repeat(48),
            secret_key: 'd'.repeat(160),
            secret_key_nonce: 'e'.repeat(48),
            user_sauce: 'f'.repeat(64),
            require_password_change: false,
            hashing_algorithm: 'scrypt',
            hashing_parameters: { u: 15, r: 8, p: 1, l: 64 },
        };

        await psonoServer.admin_reset_user_password(
            'token',
            null,
            'user-id',
            payload
        );

        expect(global.fetch).toHaveBeenCalledWith(
            'https://server.example/admin/user-password-reset/user-id/',
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify(payload),
            })
        );
    });

    test('gets account parameters before login', async () => {
        await psonoServer.prelogin('admin@example.com');
        expect(global.fetch).toHaveBeenCalledWith(
            'https://server.example/authentication/prelogin/',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ username: 'admin@example.com' }),
            })
        );
    });

    test('submits credential parameters with password changes', async () => {
        const parameters = { u: 15, r: 8, p: 1, l: 64 };
        await psonoServer.updateUser(
            'token',
            null,
            null,
            'new-authkey',
            'old-authkey',
            'private-key',
            'private-nonce',
            'secret-key',
            'secret-nonce',
            undefined,
            'scrypt',
            parameters
        );
        const body = JSON.parse(global.fetch.mock.calls[0][1].body);
        expect(body.hashing_algorithm).toBe('scrypt');
        expect(body.hashing_parameters).toEqual(parameters);
    });
});
