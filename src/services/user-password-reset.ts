import cryptoLibrary from './cryptoLibrary';
import { getHashingSettings } from './hashing-parameters';
import type { AdminRecovery } from '../types/api';

const KEY_PATTERN = /^[0-9a-fA-F]{64}$/;

export function canResetUserPassword(
    user: { admin_recovery_exists?: boolean; authentication?: string } | null,
    server: {
        type: string;
        admin_recovery_password_reset_enabled?: boolean;
        compliance_server_secrets?: string;
    },
    hasCapability: boolean
) {
    return Boolean(
        hasCapability &&
            server.type === 'EE' &&
            server.admin_recovery_password_reset_enabled &&
            user &&
            user.admin_recovery_exists
    );
}

export function createAdminRecoveryResetPayload(
    recovery: AdminRecovery,
    password: string,
    adminRecoveryPrivateKey: string,
    requirePasswordChange = true
) {
    const recoveryPrivateKey = adminRecoveryPrivateKey.trim();
    if (!KEY_PATTERN.test(recoveryPrivateKey)) {
        throw new Error('ADMIN_RECOVERY_PRIVATE_KEY_INVALID');
    }

    let privateKey;
    let secretKey;
    try {
        privateKey = cryptoLibrary.decryptDataPublicKey(
            recovery.private_key,
            recovery.private_key_nonce,
            recovery.public_key,
            recoveryPrivateKey
        );
        secretKey = cryptoLibrary.decryptDataPublicKey(
            recovery.secret_key,
            recovery.secret_key_nonce,
            recovery.public_key,
            recoveryPrivateKey
        );
    } catch (_error) {
        throw new Error('ADMIN_RECOVERY_PRIVATE_KEY_INVALID');
    }

    if (
        !KEY_PATTERN.test(privateKey) ||
        !KEY_PATTERN.test(secretKey) ||
        cryptoLibrary.getPublicKeyFromPrivateKey(privateKey).toLowerCase() !==
            recovery.public_key.toLowerCase()
    ) {
        throw new Error('ADMIN_RECOVERY_DATA_INVALID');
    }

    // Updated servers advertise reset parameters. Older endpoints use the legacy format.
    if (
        Object.prototype.hasOwnProperty.call(recovery, 'hashing_algorithm') !==
        Object.prototype.hasOwnProperty.call(recovery, 'hashing_parameters')
    ) {
        throw new Error('INVALID_HASHING_PARAMETER');
    }
    const { hashingAlgorithm, hashingParameters } = getHashingSettings(
        recovery.hashing_algorithm,
        recovery.hashing_parameters
    );
    const userSauce = cryptoLibrary.generateUserSauce();
    const encryptedPrivateKey = cryptoLibrary.encryptSecret(
        privateKey,
        password,
        userSauce,
        hashingAlgorithm,
        hashingParameters
    );
    const encryptedSecretKey = cryptoLibrary.encryptSecret(
        secretKey,
        password,
        userSauce,
        hashingAlgorithm,
        hashingParameters
    );

    return {
        authkey: cryptoLibrary.generateAuthkey(
            recovery.username,
            password,
            hashingAlgorithm,
            hashingParameters
        ),
        hashing_algorithm: hashingAlgorithm,
        hashing_parameters: hashingParameters,
        private_key: encryptedPrivateKey.text,
        private_key_nonce: encryptedPrivateKey.nonce,
        secret_key: encryptedSecretKey.text,
        secret_key_nonce: encryptedSecretKey.nonce,
        user_sauce: userSauce,
        require_password_change: requirePasswordChange,
    };
}
