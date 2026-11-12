export function canChangeUsernameDirectly(
    user: {
        authentication?: string;
        server_secret_exists?: boolean;
        admin_recovery_exists?: boolean;
    } | null,
    hasCapability: boolean
) {
    return Boolean(
        hasCapability &&
            user &&
            // Older servers ignore username updates, including during resets.
            typeof user.server_secret_exists === 'boolean' &&
            ['SAML', 'OIDC', 'LDAP'].includes(user.authentication || '') &&
            (user.server_secret_exists || user.admin_recovery_exists)
    );
}
