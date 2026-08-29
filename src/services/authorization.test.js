import {
    authorizedRoutes,
    hasCapabilityForTenantIds,
    hasAnyScopeCapability,
    hasGlobalCapability,
    isRouteAuthorized,
    roleAllowsTenantScope,
} from './authorization';

const authorization = {
    is_superuser: false,
    capabilities: {
        'users.read': { global: false, tenant_ids: ['tenant-1'] },
        'system.read': { global: true, tenant_ids: [] },
        'groups.read': { global: false, tenant_ids: [] },
    },
};

test('checks global and tenant-scoped capabilities', () => {
    expect(hasGlobalCapability(authorization, 'system.read')).toBe(true);
    expect(hasGlobalCapability(authorization, 'users.read')).toBe(false);
    expect(hasAnyScopeCapability(authorization, 'users.read')).toBe(true);
    expect(hasAnyScopeCapability(authorization, 'groups.read')).toBe(false);
    expect(hasAnyScopeCapability(authorization, 'missing')).toBe(false);
    expect(
        hasCapabilityForTenantIds(authorization, 'users.read', ['tenant-1'])
    ).toBe(true);
    expect(
        hasCapabilityForTenantIds(authorization, 'users.read', ['tenant-2'])
    ).toBe(false);
    expect(hasCapabilityForTenantIds(authorization, 'system.read', [])).toBe(
        true
    );
});

test('superusers bypass capability and route checks', () => {
    const superuser = { is_superuser: true, capabilities: {} };
    expect(hasGlobalCapability(superuser, 'missing')).toBe(true);
    expect(hasAnyScopeCapability(superuser, 'missing')).toBe(true);
    expect(isRouteAuthorized({ superuserOnly: true }, superuser)).toBe(true);
});

test('filters capability and superuser routes but retains redirects', () => {
    const routes = [
        { path: '/users', requiredCapability: 'users.read' },
        { path: '/groups', requiredCapability: 'groups.read' },
        { path: '/tenants', superuserOnly: true },
        { path: '/settings', allowAuthenticated: true },
        { path: '/legacy-admin' },
        { path: '/', redirect: true },
        { path: '/enterprise', allowAuthenticated: true },
    ];
    expect(
        authorizedRoutes(routes, authorization).map((route) => route.path)
    ).toEqual(['/users', '/settings', '/enterprise', '/']);
});

test('unannotated routes fail closed except for superusers', () => {
    const route = { path: '/legacy-admin' };
    expect(isRouteAuthorized(route, authorization)).toBe(false);
    expect(
        isRouteAuthorized(route, { is_superuser: true, capabilities: {} })
    ).toBe(true);
    expect(isRouteAuthorized({ allowAuthenticated: true }, authorization)).toBe(
        true
    );
});

test('only roles containing tenant-scopeable capabilities allow tenant scope', () => {
    const capabilities = [
        { code: 'users.read', tenant_scopeable: true },
        { code: 'system.read', tenant_scopeable: false },
    ];
    expect(
        roleAllowsTenantScope(
            { is_full_access: false, capabilities: ['users.read'] },
            capabilities
        )
    ).toBe(true);
    expect(
        roleAllowsTenantScope(
            { is_full_access: false, capabilities: ['system.read'] },
            capabilities
        )
    ).toBe(false);
    expect(
        roleAllowsTenantScope(
            { is_full_access: true, capabilities: [] },
            capabilities
        )
    ).toBe(false);
});
