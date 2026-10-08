/** JSON payloads from older admin endpoints may include provider-specific fields. */
export type ApiRecord = Record<string, any>;

export interface ApiResponse<T = ApiRecord> {
    data: T;
}

export interface HashingParameters {
    u: number;
    r: number;
    p: number;
    l: number;
}

export interface EncryptedValue {
    text: string;
    nonce: string;
}

export interface KeyPair {
    public_key: string;
    private_key: string;
}

export interface AdminRecovery {
    username: string;
    public_key: string;
    private_key: string;
    private_key_nonce: string;
    secret_key: string;
    secret_key_nonce: string;
    hashing_algorithm?: string;
    hashing_parameters?: HashingParameters;
}

export interface Tenant {
    id: string;
    name: string;
    is_active: boolean;
}
