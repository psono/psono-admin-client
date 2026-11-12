import { canChangeUsernameDirectly } from './user-username';

describe('direct username changes', () => {
    test.each(['SAML', 'OIDC', 'LDAP'])(
        '%s requires an update capability and either kind of stored keys',
        (authentication) => {
            for (const serverKeys of [false, true]) {
                for (const recoveryKeys of [false, true]) {
                    const user = {
                        authentication,
                        server_secret_exists: serverKeys,
                        admin_recovery_exists: recoveryKeys,
                    };
                    expect(canChangeUsernameDirectly(user, true)).toBe(
                        serverKeys || recoveryKeys
                    );
                    expect(canChangeUsernameDirectly(user, false)).toBe(false);
                }
            }
        }
    );

    test('password users must use the combined rename and recovery reset', () => {
        expect(
            canChangeUsernameDirectly(
                {
                    authentication: 'AUTHKEY',
                    server_secret_exists: true,
                    admin_recovery_exists: true,
                },
                true
            )
        ).toBe(false);
    });

    test('fails closed while loading and with older servers', () => {
        expect(canChangeUsernameDirectly(null, true)).toBe(false);
        expect(
            canChangeUsernameDirectly(
                { authentication: 'SAML', admin_recovery_exists: true },
                true
            )
        ).toBe(false);
    });
});
