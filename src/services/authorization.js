export function hasGlobalCapability(authorization, code) {
    if (!authorization) {
        return false;
    }
    if (authorization.is_superuser) {
        return true;
    }
    const capability = authorization.capabilities
        ? authorization.capabilities[code]
        : null;
    return Boolean(capability && capability.global);
}

export function hasAnyScopeCapability(authorization, code) {
    if (!authorization) {
        return false;
    }
    if (authorization.is_superuser) {
        return true;
    }
    const capability = authorization.capabilities
        ? authorization.capabilities[code]
        : null;
    return Boolean(
        capability &&
            (capability.global ||
                (Array.isArray(capability.tenant_ids) &&
                    capability.tenant_ids.length > 0))
    );
}

export function hasCapabilityForTenantIds(authorization, code, tenantIds) {
    if (!authorization) {
        return false;
    }
    if (authorization.is_superuser) {
        return true;
    }
    const capability = authorization.capabilities
        ? authorization.capabilities[code]
        : null;
    if (!capability) {
        return false;
    }
    if (capability.global) {
        return true;
    }
    if (!Array.isArray(tenantIds)) {
        return hasAnyScopeCapability(authorization, code);
    }
    const allowedTenantIds = new Set(
        (capability.tenant_ids || []).map((tenantId) => String(tenantId))
    );
    return tenantIds.some((tenantId) => allowedTenantIds.has(String(tenantId)));
}

export function roleAllowsTenantScope(role, capabilities) {
    if (!role || role.is_full_access) {
        return false;
    }
    const metadata = (capabilities || []).reduce((result, capability) => {
        result[capability.code] = capability;
        return result;
    }, {});
    return role.capabilities.every(
        (code) => metadata[code] && metadata[code].tenant_scopeable
    );
}

export function isRouteAuthorized(route, authorization) {
    if (!authorization) {
        return false;
    }
    if (authorization.is_superuser) {
        return true;
    }
    if (route.superuserOnly) {
        return false;
    }
    if (route.requiredCapability) {
        return hasAnyScopeCapability(authorization, route.requiredCapability);
    }
    return Boolean(route.allowAuthenticated);
}

export function authorizedRoutes(routes, authorization) {
    const authorized = routes.filter(
        (route) => route.redirect || isRouteAuthorized(route, authorization)
    );
    return authorized
        .filter((route) => !route.redirect)
        .concat(authorized.filter((route) => route.redirect));
}
