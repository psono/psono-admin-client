jest.mock('./store', () => ({
    getState: () => ({ server: { url: 'https://server.example' } }),
}));
jest.mock('./device', () => ({ getDeviceFingerprint: () => 'device' }));
jest.mock('./user', () => ({ isLoggedIn: () => false }));
jest.mock('../i18n', () => ({ t: (value) => value }));

import psonoServer from './api-server';

describe('external group tenant API', () => {
    beforeEach(() => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            text: () => Promise.resolve('{}'),
        });
    });

    test.each([
        ['ldap', 'admin_update_ldap_group_tenants'],
        ['saml', 'admin_update_saml_group_tenants'],
        ['oidc', 'admin_update_oidc_group_tenants'],
        ['scim', 'admin_update_scim_group_tenants'],
    ])('updates %s group tenants', async (provider, method) => {
        await psonoServer[method]('token', null, 'group-id', ['tenant-id']);

        expect(global.fetch).toHaveBeenCalledWith(
            'https://server.example/admin/identity-provider/group-tenant/',
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify({
                    provider,
                    group_id: 'group-id',
                    tenant_ids: ['tenant-id'],
                }),
            })
        );
    });

    test('lists identity-provider tenant options', async () => {
        await psonoServer.admin_identity_provider_tenant('token', null, {
            page_size: 5,
            page: 0,
            search: 'Tenant A',
        });

        expect(global.fetch).toHaveBeenCalledWith(
            'https://server.example/admin/identity-provider/tenant/?page_size=5&page=0&search=Tenant+A',
            expect.objectContaining({ method: 'GET' })
        );
    });
});
