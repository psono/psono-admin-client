import cryptoLibrary from './cryptoLibrary';

const nodeCrypto = require('crypto');
const randomBytes = nodeCrypto.randomBytes;
const legacy = { u: 14, r: 8, p: 1, l: 64 };
const stronger = { ...legacy, u: 15 };

describe('parameter-aware password cryptography', () => {
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

    test('matches independent legacy and stronger scrypt vectors without cache collisions', () => {
        const username = 'audit@example.com';
        const password = 'audit-password';
        const low =
            'ef3028d398384da8843375dcc537cd466008c963afd8beb30bae7cc86656bc0e5262e6287a9af7419b296acd91258603d2c9d4be5d2dcbab1a9f790268710a0c';
        const high =
            'e80c5aa6cb488be6fc6988fef0200cc034244212dc8fc3f101151e9f05c76120d2a5d65fe30dd6dd2331708df2af235ebb2aee8ae843c273352cbbb96e3c9803';
        expect(cryptoLibrary.generateAuthkey(username, password)).toBe(low);
        expect(
            cryptoLibrary.generateAuthkey(
                username,
                password,
                'scrypt',
                stronger
            )
        ).toBe(high);
        expect(
            cryptoLibrary.generateAuthkey(username, password, 'scrypt', legacy)
        ).toBe(low);
    });

    test('rewraps the same secret at a new cost and decrypts it after cache expiry', () => {
        const old = cryptoLibrary.encryptSecret(
            'secret',
            'password',
            'sauce',
            'scrypt',
            legacy
        );
        const upgraded = cryptoLibrary.encryptSecret(
            'secret',
            'password',
            'sauce',
            'scrypt',
            stronger
        );
        jest.runOnlyPendingTimers();
        expect(
            cryptoLibrary.decryptSecret(
                upgraded.text,
                upgraded.nonce,
                'password',
                'sauce',
                'scrypt',
                stronger
            )
        ).toBe('secret');
        expect(() =>
            cryptoLibrary.decryptSecret(
                old.text,
                old.nonce,
                'password',
                'sauce',
                'scrypt',
                stronger
            )
        ).toThrow();
        expect(
            cryptoLibrary.decryptSecret(
                old.text,
                old.nonce,
                'password',
                'sauce'
            )
        ).toBe('secret');
    });

    test.each([
        { ...legacy, u: 13 },
        { ...legacy, p: 0 },
        { ...legacy, r: '8' },
        { ...legacy, u: 14.5 },
        {},
        null,
    ])(
        'rejects malformed parameters rather than silently using a different KDF: %p',
        (parameters) => {
            expect(() =>
                cryptoLibrary.generateAuthkey(
                    'audit@example.com',
                    'password',
                    'scrypt',
                    parameters
                )
            ).toThrow('INVALID_HASHING_PARAMETER');
        }
    );

    test('rejects unsupported algorithms for hashing and encryption', () => {
        expect(() =>
            cryptoLibrary.generateAuthkey(
                'audit@example.com',
                'password',
                'argon2',
                legacy
            )
        ).toThrow('UNSUPPORTED_ALGORITHM_UPDATE_CLIENT');
        expect(() =>
            cryptoLibrary.encryptSecret(
                'secret',
                'password',
                'sauce',
                'argon2',
                legacy
            )
        ).toThrow('UNSUPPORTED_ALGORITHM_UPDATE_CLIENT');
    });
});
