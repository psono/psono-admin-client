import type { HashingParameters, ApiRecord } from './api';
import type { Authorization } from './authorization';

export interface UserState {
    isLoggedIn: boolean;
    username: string;
    remember_me: boolean;
    trust_device: boolean;
    authentication: string;
    hashingAlgorithm: string;
    hashingParameters: HashingParameters;
    user_secret_key: string;
    serverSecretExists: boolean;
    user_private_key: string;
    user_public_key: string;
    session_secret_key: string;
    token: string;
    user_sauce: string;
    user_email: string;
    user_id: string;
    requirePasswordChange: boolean;
    authorization: Authorization | null;
}

export interface ServerState {
    url: string;
    api: string;
    authentication_methods: string[];
    build: string;
    license_id: string;
    license_max_users?: number;
    license_mode: string;
    license_type: string;
    type: string;
    files: boolean;
    gateway: boolean;
    license_valid_from?: string;
    license_valid_till?: string;
    log_audit: boolean;
    management: boolean;
    public_key: string;
    version: string;
    web_client: string;
    admin_recovery_password_reset_enabled: boolean;
    compliance_server_secrets: string;
}

export interface KnownHost {
    url: string;
    verify_key: string;
}

export interface NotificationMessage {
    text: string;
    type: string;
}

export interface AdminClientState {
    config: ApiRecord;
}
