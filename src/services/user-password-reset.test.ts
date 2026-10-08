import type { HashingParameters } from '../types/api';
import cryptoLibrary from './cryptoLibrary';
import {
    canResetUserPassword,
    createAdminRecoveryResetPayload,
} from './user-password-reset';

const nodeCrypto = require('crypto');
const randomBytes = nodeCrypto.randomBytes;

describe('user password reset', () => {
    beforeAll(() => {
        jest.spyOn(nodeCrypto, 'randomBytes').mockImplementation(
            (size) => new Uint8Array(randomBytes(size))
        );
    });

    afterAll(() => {
        jest.mocked(nodeCrypto.randomBytes).mockRestore();
    });

    test.each([
        ['EE', true, 'auto', true, 'AUTHKEY', true, true],
        ['EE', true, 'auto', true, 'LDAP', true, true],
        ['EE', true, 'auto', true, 'OIDC', true, true],
        ['EE', true, 'auto', true, 'AUTHKEY', false, false],
        ['EE', false, 'auto', true, 'AUTHKEY', true, false],
        ['EE', true, 'noone', true, 'AUTHKEY', true, true],
        ['CE', true, 'auto', true, 'AUTHKEY', true, false],
        ['EE', true, 'auto', false, 'AUTHKEY', true, false],
    ])(
        'checks server settings, capability and admin recovery',
        (
            serverType,
            resetEnabled,
            complianceServerSecrets,
            allowed,
            authentication,
            adminRecovery,
            expected
        ) => {
            expect(
                canResetUserPassword(
                    {
                        authentication,
                        admin_recovery_exists: adminRecovery,
                    },
                    {
                        type: serverType,
                        admin_recovery_password_reset_enabled: resetEnabled,
                        compliance_server_secrets: complianceServerSecrets,
                    },
                    allowed
                )
            ).toBe(expected);
        }
    );

    const assertResetPayload = (
        hashingParameters: HashingParameters | undefined
    ) => {
        const userKeyPair = cryptoLibrary.generatePublicPrivateKeypair();
        const recoveryKeyPair = cryptoLibrary.generatePublicPrivateKeypair();
        const privateKey = userKeyPair.private_key;
        const secretKey = 'cd'.repeat(32);
        const encryptedPrivateKey = cryptoLibrary.encryptDataPublicKey(
            privateKey,
            recoveryKeyPair.public_key,
            userKeyPair.private_key
        );
        const encryptedSecretKey = cryptoLibrary.encryptDataPublicKey(
            secretKey,
            recoveryKeyPair.public_key,
            userKeyPair.private_key
        );

        const payload = createAdminRecoveryResetPayload(
            {
                username: 'target@example.com',
                public_key: userKeyPair.public_key,
                private_key: encryptedPrivateKey.text,
                private_key_nonce: encryptedPrivateKey.nonce,
                secret_key: encryptedSecretKey.text,
                secret_key_nonce: encryptedSecretKey.nonce,
                ...(hashingParameters && {
                    hashing_algorithm: 'scrypt',
                    hashing_parameters: hashingParameters,
                }),
            },
            'new-password',
            recoveryKeyPair.private_key,
            false
        );

        expect(payload).not.toHaveProperty('source');
        expect(payload.authkey).toMatch(/^[0-9a-f]{128}$/);
        expect(payload.private_key).toMatch(/^[0-9a-f]{160}$/);
        expect(payload.private_key_nonce).toMatch(/^[0-9a-f]{48}$/);
        expect(payload.secret_key).toMatch(/^[0-9a-f]{160}$/);
        expect(payload.secret_key_nonce).toMatch(/^[0-9a-f]{48}$/);
        expect(payload.require_password_change).toBe(false);
        expect(payload.hashing_algorithm).toBe('scrypt');
        expect(payload.hashing_parameters).toEqual(
            hashingParameters || { u: 14, r: 8, p: 1, l: 64 }
        );
        expect(payload.authkey).toBe(
            cryptoLibrary.generateAuthkey(
                'target@example.com',
                'new-password',
                'scrypt',
                payload.hashing_parameters
            )
        );
        expect(payload).not.toHaveProperty('admin_recovery_private_key');
        expect(
            cryptoLibrary.decryptSecret(
                payload.private_key,
                payload.private_key_nonce,
                'new-password',
                payload.user_sauce,
                payload.hashing_algorithm,
                payload.hashing_parameters
            )
        ).toBe(privateKey);
        expect(
            cryptoLibrary.decryptSecret(
                payload.secret_key,
                payload.secret_key_nonce,
                'new-password',
                payload.user_sauce,
                payload.hashing_algorithm,
                payload.hashing_parameters
            )
        ).toBe(secretKey);
    };

    test.each([undefined, { u: 15, r: 8, p: 1, l: 64 }])(
        'decrypts admin recovery and rewraps using advertised parameters: %p',
        assertResetPayload
    );

    test('rejects the wrong admin recovery private key', () => {
        const userKeyPair = cryptoLibrary.generatePublicPrivateKeypair();
        const recoveryKeyPair = cryptoLibrary.generatePublicPrivateKeypair();
        const wrongRecoveryKeyPair =
            cryptoLibrary.generatePublicPrivateKeypair();
        const encryptedPrivateKey = cryptoLibrary.encryptDataPublicKey(
            userKeyPair.private_key,
            recoveryKeyPair.public_key,
            userKeyPair.private_key
        );
        const encryptedSecretKey = cryptoLibrary.encryptDataPublicKey(
            'cd'.repeat(32),
            recoveryKeyPair.public_key,
            userKeyPair.private_key
        );

        expect(() =>
            createAdminRecoveryResetPayload(
                {
                    username: 'target@example.com',
                    public_key: userKeyPair.public_key,
                    private_key: encryptedPrivateKey.text,
                    private_key_nonce: encryptedPrivateKey.nonce,
                    secret_key: encryptedSecretKey.text,
                    secret_key_nonce: encryptedSecretKey.nonce,
                },
                'new-password',
                wrongRecoveryKeyPair.private_key
            )
        ).toThrow('ADMIN_RECOVERY_PRIVATE_KEY_INVALID');
    });

    test('rejects a recovered private key that does not match the user', () => {
        const userKeyPair = cryptoLibrary.generatePublicPrivateKeypair();
        const unrelatedKeyPair = cryptoLibrary.generatePublicPrivateKeypair();
        const recoveryKeyPair = cryptoLibrary.generatePublicPrivateKeypair();
        const encryptedPrivateKey = cryptoLibrary.encryptDataPublicKey(
            unrelatedKeyPair.private_key,
            recoveryKeyPair.public_key,
            userKeyPair.private_key
        );
        const encryptedSecretKey = cryptoLibrary.encryptDataPublicKey(
            'cd'.repeat(32),
            recoveryKeyPair.public_key,
            userKeyPair.private_key
        );

        expect(() =>
            createAdminRecoveryResetPayload(
                {
                    username: 'target@example.com',
                    public_key: userKeyPair.public_key,
                    private_key: encryptedPrivateKey.text,
                    private_key_nonce: encryptedPrivateKey.nonce,
                    secret_key: encryptedSecretKey.text,
                    secret_key_nonce: encryptedSecretKey.nonce,
                },
                'new-password',
                recoveryKeyPair.private_key
            )
        ).toThrow('ADMIN_RECOVERY_DATA_INVALID');
    });
});
