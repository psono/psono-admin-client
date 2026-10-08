// These are the legacy credential format, not the preferred cost for new accounts.
export const LEGACY_HASHING_PARAMETERS = Object.freeze({
    u: 14,
    r: 8,
    p: 1,
    l: 64,
});

export function getHashingSettings(
    hashingAlgorithm = 'scrypt',
    hashingParameters: HashingParameters = LEGACY_HASHING_PARAMETERS
) {
    if (hashingAlgorithm !== 'scrypt') {
        throw new Error('UNSUPPORTED_ALGORITHM_UPDATE_CLIENT');
    }
    const parameters = {} as HashingParameters;
    for (const name of Object.keys(
        LEGACY_HASHING_PARAMETERS
    ) as (keyof HashingParameters)[]) {
        const minimum = LEGACY_HASHING_PARAMETERS[name];
        const value = hashingParameters && hashingParameters[name];
        if (!Number.isSafeInteger(value) || value < minimum) {
            throw new Error('INVALID_HASHING_PARAMETER');
        }
        parameters[name] = value;
    }
    return { hashingAlgorithm, hashingParameters: parameters };
}
import type { HashingParameters } from '../types/api';

export function getHashingUpgrade(
    algorithm: string,
    current: HashingParameters,
    defaultAlgorithm: string,
    defaults: HashingParameters
): HashingParameters | null {
    if (
        algorithm !== 'scrypt' ||
        defaultAlgorithm !== algorithm ||
        current.l !== 64 ||
        defaults.l !== 64
    ) {
        return null;
    }
    const target: HashingParameters = { ...LEGACY_HASHING_PARAMETERS };
    let stronger = false;
    for (const name of ['u', 'r', 'p'] as const) {
        const old = current[name];
        const next = defaults[name];
        if (
            !Number.isSafeInteger(old) ||
            !Number.isSafeInteger(next) ||
            Math.min(old, next) < LEGACY_HASHING_PARAMETERS[name]
        ) {
            return null;
        }
        target[name] = Math.max(old, next);
        stronger ||= target[name] > old;
    }
    return stronger ? target : null;
}
