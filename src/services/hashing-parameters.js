// These are the legacy credential format, not the preferred cost for new accounts.
export const LEGACY_HASHING_PARAMETERS = Object.freeze({
    u: 14,
    r: 8,
    p: 1,
    l: 64,
});

export function getHashingSettings(
    hashingAlgorithm = 'scrypt',
    hashingParameters = LEGACY_HASHING_PARAMETERS
) {
    if (hashingAlgorithm !== 'scrypt') {
        throw new Error('UNSUPPORTED_ALGORITHM_UPDATE_CLIENT');
    }
    const parameters = {};
    for (const [name, minimum] of Object.entries(LEGACY_HASHING_PARAMETERS)) {
        const value = hashingParameters && hashingParameters[name];
        if (!Number.isSafeInteger(value) || value < minimum) {
            throw new Error('INVALID_HASHING_PARAMETER');
        }
        parameters[name] = value;
    }
    return { hashingAlgorithm, hashingParameters: parameters };
}
