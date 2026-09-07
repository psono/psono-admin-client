import cryptoLibrary from './cryptoLibrary';

const KEY_PATTERN = /^[0-9a-fA-F]{64}$/;

export function canResetUserPassword(user, server, hasCapability) {
    return Boolean(
        hasCapability &&
            server.type === 'EE' &&
            server.admin_recovery_password_reset_enabled &&
            user &&
            user.admin_recovery_exists
    );
}

export function createAdminRecoveryResetPayload(
    recovery,
    password,
    adminRecoveryPrivateKey,
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

    const userSauce = cryptoLibrary.generateUserSauce();
    const encryptedPrivateKey = cryptoLibrary.encrypt_secret(
        privateKey,
        password,
        userSauce
    );
    const encryptedSecretKey = cryptoLibrary.encrypt_secret(
        secretKey,
        password,
        userSauce
    );

    return {
        authkey: cryptoLibrary.generateAuthkey(recovery.username, password),
        private_key: encryptedPrivateKey.text,
        private_key_nonce: encryptedPrivateKey.nonce,
        secret_key: encryptedSecretKey.text,
        secret_key_nonce: encryptedSecretKey.nonce,
        user_sauce: userSauce,
        require_password_change: requirePasswordChange,
    };
}
