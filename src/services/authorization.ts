export function hasGlobalCapability(
    authorization: Authorization | null | undefined,
    code: string
) {
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

export function hasAnyScopeCapability(
    authorization: Authorization | null | undefined,
    code: string
) {
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

export function hasCapabilityForTenantIds(
    authorization: Authorization | null | undefined,
    code: string,
    tenantIds?: (string | number)[] | null
) {
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
        (capability.tenant_ids || []).map((tenantId: any) => String(tenantId))
    );
    return tenantIds.some((tenantId) => allowedTenantIds.has(String(tenantId)));
}

export function roleAllowsTenantScope(
    role: AdministrativeRole | null | undefined,
    capabilities?: CapabilityMetadata[] | null
) {
    if (!role || role.is_full_access) {
        return false;
    }
    const metadata = (capabilities || []).reduce<
        Record<string, CapabilityMetadata>
    >((result, capability) => {
        result[capability.code] = capability;
        return result;
    }, {});
    return role.capabilities.every(
        (code: any) => metadata[code] && metadata[code].tenant_scopeable
    );
}

export function isRouteAuthorized(
    route: AdminRoute,
    authorization: Authorization | null | undefined
) {
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

export function authorizedRoutes<T extends AdminRoute>(
    routes: T[],
    authorization: Authorization | null | undefined
): T[] {
    const authorized = routes.filter(
        (route: any) =>
            route.redirect || isRouteAuthorized(route, authorization)
    );
    return authorized
        .filter((route: any) => !route.redirect)
        .concat(authorized.filter((route: any) => route.redirect));
}
import type {
    Authorization,
    AdminRoute,
    AdministrativeRole,
    CapabilityMetadata,
} from '../types/authorization';
