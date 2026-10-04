jest.mock('./store', () => ({ getState: () => mockState }));
jest.mock('../actions/boundActionCreators', () => ({
    sethashingParameters: jest.fn((hashingAlgorithm, hashingParameters) => {
        Object.assign(mockState.user, { hashingAlgorithm, hashingParameters });
    }),
    setUserUsername: jest.fn(),
    setUserInfo2: jest.fn(
        (privateKey, publicKey, sessionSecretKey, token, userSauce) => {
            Object.assign(mockState.user, {
                user_private_key: privateKey,
                user_public_key: publicKey,
                session_secret_key: sessionSecretKey,
                token,
                user_sauce: userSauce,
            });
        }
    ),
    setUserInfo3: jest.fn(),
    setAuthorization: jest.fn(),
    setRequirePasswordChange: jest.fn(),
}));
jest.mock('./api-server', () => ({
    prelogin: jest.fn(),
    login: jest.fn(),
    samlLogin: jest.fn(),
    oidcLogin: jest.fn(),
    activateToken: jest.fn(),
    admin_authorization: jest.fn(),
    updateUser: jest.fn(),
}));
jest.mock('./host', () => ({}));
jest.mock('./device', () => ({
    getDeviceFingerprint: () => 'device',
    getDeviceDescription: () => 'description',
}));
jest.mock('./notification', () => ({}));
jest.mock('./browser-client', () => ({}));
jest.mock('../i18n', () => ({ options: { supportedLngs: [] } }));

import user from './user';
import cryptoLibrary from './cryptoLibrary';
import api from './api-server';
import action from '../actions/boundActionCreators';

const nodeCrypto = require('crypto');
const randomBytes = nodeCrypto.randomBytes;
const legacy = { u: 14, r: 8, p: 1, l: 64 };
const stronger = { ...legacy, u: 15 };
let mockState;
let serverPair;
let clientPair;
let userPair;
const password = 'AuditPassword123!';
const secretKey = 'cd'.repeat(32);

function loginResponse(
    authentication,
    parameters,
    { metadata = true, wrapped = false, keyPassword = password } = {}
) {
    const privateKey = cryptoLibrary.encryptSecret(
        userPair.private_key,
        keyPassword,
        'user-sauce',
        'scrypt',
        parameters
    );
    const secret = cryptoLibrary.encryptSecret(
        secretKey,
        keyPassword,
        'user-sauce',
        'scrypt',
        parameters
    );
    const validator = cryptoLibrary.encryptDataPublicKey(
        'validator',
        userPair.public_key,
        serverPair.private_key
    );
    const data = {
        password,
        token: 'token',
        session_public_key: serverPair.public_key,
        session_secret_key: 'ab'.repeat(32),
        user_validator: validator.text,
        user_validator_nonce: validator.nonce,
        required_multifactors: [],
        user: {
            username: 'admin@example.com',
            authentication,
            public_key: userPair.public_key,
            private_key: privateKey.text,
            private_key_nonce: privateKey.nonce,
            user_sauce: 'user-sauce',
            ...(metadata && {
                hashing_algorithm: 'scrypt',
                hashing_parameters: parameters,
            }),
        },
    };
    let envelope = data;
    if (wrapped) {
        const inner = cryptoLibrary.encryptDataPublicKey(
            JSON.stringify(data),
            clientPair.public_key,
            serverPair.private_key
        );
        envelope = {
            data: inner.text,
            data_nonce: inner.nonce,
            server_session_public_key: serverPair.public_key,
        };
    }
    const encrypted = cryptoLibrary.encryptDataPublicKey(
        JSON.stringify(envelope),
        clientPair.public_key,
        serverPair.private_key
    );
    api.activateToken.mockResolvedValue({
        data: {
            user: {
                id: 'user-id',
                email: 'admin@example.com',
                authentication,
                secret_key: secret.text,
                secret_key_nonce: secret.nonce,
            },
        },
    });
    return {
        data: { login_info: encrypted.text, login_info_nonce: encrypted.nonce },
    };
}

describe('parameter-aware admin authentication', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.spyOn(nodeCrypto, 'randomBytes').mockImplementation(
            (size) => new Uint8Array(randomBytes(size))
        );
    });
    afterAll(() => {
        nodeCrypto.randomBytes.mockRestore();
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });
    beforeEach(() => {
        jest.clearAllMocks();
        jest.runOnlyPendingTimers();
        mockState = {
            user: { username: 'admin@example.com', trust_device: false },
            server: {},
        };
        serverPair = cryptoLibrary.generatePublicPrivateKeypair();
        userPair = cryptoLibrary.generatePublicPrivateKeypair();
        clientPair = cryptoLibrary.generatePublicPrivateKeypair();
        mockState.server.public_key = serverPair.public_key;
        jest.spyOn(
            cryptoLibrary,
            'generatePublicPrivateKeypair'
        ).mockReturnValue(clientPair);
        api.admin_authorization.mockResolvedValue({ data: {} });
    });
    afterEach(() => {
        cryptoLibrary.generatePublicPrivateKeypair.mockRestore();
    });

    test.each([legacy, stronger])(
        'AUTHKEY login derives the prelogin cost and activates keys: %p',
        async (parameters) => {
            api.prelogin.mockResolvedValue({
                data: {
                    hashing_algorithm: 'scrypt',
                    hashing_parameters: parameters,
                },
            });
            api.login.mockResolvedValue(
                loginResponse('AUTHKEY', parameters, { wrapped: true })
            );
            await user.login(password, {
                info: { public_key: serverPair.public_key },
            });
            expect(api.prelogin).toHaveBeenCalledWith('admin@example.com');
            const [text, nonce, publicKey] = api.login.mock.calls[0];
            const request = JSON.parse(
                cryptoLibrary.decryptDataPublicKey(
                    text,
                    nonce,
                    publicKey,
                    serverPair.private_key
                )
            );
            const salt = nodeCrypto
                .createHash('sha512')
                .update('admin@example.com')
                .digest('hex');
            const expected = nodeCrypto
                .scryptSync(password, salt, 64, {
                    N: 2 ** parameters.u,
                    r: 8,
                    p: 1,
                    maxmem: 128 * 1024 * 1024,
                })
                .toString('hex');
            expect(request.authkey).toBe(expected);
            expect(request).not.toHaveProperty('password');
            await user.activateToken();
            expect(action.setUserInfo3.mock.calls[0][2]).toBe(secretKey);
            expect(mockState.user.hashingParameters).toEqual(parameters);
        }
    );

    test('LDAP uses the login response cost when it differs from prelogin', async () => {
        api.prelogin.mockResolvedValue({
            data: { hashing_algorithm: 'scrypt', hashing_parameters: legacy },
        });
        api.login.mockResolvedValue(loginResponse('LDAP', stronger));
        await user.login(
            password,
            { info: { public_key: serverPair.public_key } },
            true
        );
        const [text, nonce, publicKey] = api.login.mock.calls[0];
        const request = JSON.parse(
            cryptoLibrary.decryptDataPublicKey(
                text,
                nonce,
                publicKey,
                serverPair.private_key
            )
        );
        expect(request.password).toBe(password);
        expect(mockState.user.hashingParameters).toEqual(stronger);
        await user.activateToken();
        expect(action.setUserInfo3.mock.calls[0][2]).toBe(secretKey);
    });

    test('login responses without metadata retain the prelogin parameters', async () => {
        api.prelogin.mockResolvedValue({
            data: { hashing_algorithm: 'scrypt', hashing_parameters: stronger },
        });
        api.login.mockResolvedValue(
            loginResponse('AUTHKEY', stronger, { metadata: false })
        );
        const response = await user.login(password, {
            info: { public_key: serverPair.public_key },
        });
        expect(response.user.hashing_algorithm).toBe('scrypt');
        expect(response.user.hashing_parameters).toEqual(stronger);
        expect(response.user.require_password_change).toBe(false);
        await user.activateToken();
        expect(action.setUserInfo3.mock.calls[0][2]).toBe(secretKey);
    });

    test.each(['prelogin', 'login'])(
        'propagates server errors from %s in the webclient format',
        async (method) => {
            api.prelogin.mockResolvedValue({
                data: {
                    hashing_algorithm: 'scrypt',
                    hashing_parameters: legacy,
                },
            });
            api[method].mockRejectedValueOnce({
                data: { non_field_errors: ['LOGIN_FAILED'] },
            });
            await expect(
                user.login(password, {
                    info: { public_key: serverPair.public_key },
                })
            ).rejects.toEqual(['LOGIN_FAILED']);
            expect(action.setUserInfo2).not.toHaveBeenCalled();
            if (method === 'prelogin') {
                expect(api.login).not.toHaveBeenCalled();
            }
        }
    );

    test.each(['SAML', 'OIDC'])(
        '%s decrypts both user keys with SSO response parameters',
        async (authentication) => {
            const method =
                authentication === 'SAML' ? 'samlLogin' : 'oidcLogin';
            api[method].mockResolvedValue(
                loginResponse(authentication, stronger, { wrapped: true })
            );
            await user[method]('sso-token');
            expect(api.prelogin).not.toHaveBeenCalled();
            expect(mockState.user.hashingParameters).toEqual(stronger);
            await user.activateToken();
            expect(action.setUserInfo3.mock.calls[0][2]).toBe(secretKey);
        }
    );

    test('SSO without metadata uses legacy settings rather than stale account state', async () => {
        mockState.user.hashingAlgorithm = 'scrypt';
        mockState.user.hashingParameters = stronger;
        api.samlLogin.mockResolvedValue(
            loginResponse('SAML', legacy, { metadata: false })
        );
        await user.samlLogin('sso-token');
        expect(mockState.user.hashingParameters).toEqual(legacy);
        await user.activateToken();
        expect(action.setUserInfo3.mock.calls[0][2]).toBe(secretKey);
    });

    test('SSO separate-password retry preserves the higher-cost metadata', async () => {
        api.oidcLogin.mockResolvedValue(
            loginResponse('OIDC', stronger, {
                keyPassword: 'SeparatePassword123!',
            })
        );
        const result = await user.oidcLogin('sso-token');
        expect(result.require_password).toEqual(expect.any(Function));
        result.require_password('SeparatePassword123!');
        await user.activateToken();
        expect(action.setUserInfo3.mock.calls[0][2]).toBe(secretKey);
    });

    test.each([
        {},
        { hashing_algorithm: 'argon2', hashing_parameters: stronger },
        { hashing_algorithm: 'scrypt', hashing_parameters: {} },
    ])(
        'does not submit credentials for unsupported prelogin metadata: %p',
        async (data) => {
            api.prelogin.mockResolvedValue({ data });
            await expect(
                user.login(password, {
                    info: { public_key: serverPair.public_key },
                })
            ).rejects.toEqual(expect.any(String));
            expect(api.login).not.toHaveBeenCalled();
        }
    );

    test('password changes keep the account cost and send matching metadata', async () => {
        Object.assign(mockState.user, {
            hashingAlgorithm: 'scrypt',
            hashingParameters: stronger,
            user_private_key: userPair.private_key,
            user_secret_key: secretKey,
            user_sauce: 'user-sauce',
            token: 'token',
            session_secret_key: 'ab'.repeat(32),
        });
        api.updateUser.mockResolvedValue({});
        await user.saveNewPassword(
            'NewPassword123!',
            'NewPassword123!',
            password
        );
        const args = api.updateUser.mock.calls[0];
        expect(args.slice(10)).toEqual(['scrypt', stronger]);
        expect(args[4]).toBe(
            cryptoLibrary.generateAuthkey(
                'admin@example.com',
                password,
                'scrypt',
                stronger
            )
        );
        expect(
            cryptoLibrary.decryptSecret(
                args[5],
                args[6],
                'NewPassword123!',
                'user-sauce',
                'scrypt',
                stronger
            )
        ).toBe(userPair.private_key);
        expect(
            cryptoLibrary.decryptSecret(
                args[7],
                args[8],
                'NewPassword123!',
                'user-sauce',
                'scrypt',
                stronger
            )
        ).toBe(secretKey);
    });

    test('language changes use updateUser without sending credential metadata', async () => {
        Object.assign(mockState.user, {
            token: 'token',
            session_secret_key: 'ab'.repeat(32),
            hashingAlgorithm: 'scrypt',
            hashingParameters: stronger,
        });
        api.updateUser.mockResolvedValue({});
        await user.saveNewLanguage('de');
        const args = api.updateUser.mock.calls[0];
        expect(args.slice(0, 2)).toEqual(['token', 'ab'.repeat(32)]);
        expect(args.slice(2, 9)).toEqual(Array(7).fill(undefined));
        expect(args[9]).toBe('de');
        expect(args.slice(10)).toEqual([undefined, undefined]);
    });
});
