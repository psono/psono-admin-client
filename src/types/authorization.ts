import type { ComponentType } from 'react';

export interface CapabilityScope {
    global?: boolean;
    tenant_ids?: (string | number)[];
}

export interface Authorization {
    is_superuser?: boolean;
    capabilities?: Record<string, CapabilityScope>;
}

export interface CapabilityMetadata {
    code: string;
    tenant_scopeable?: boolean;
}

export interface AdministrativeRole {
    id?: string;
    name?: string;
    description?: string;
    is_active?: boolean;
    is_system?: boolean;
    is_full_access?: boolean;
    capabilities: string[];
}

export interface AdminRoute {
    sidebarName?: string;
    navbarName?: string;
    sidebarGroup?: string;
    sidebarOrder?: number;
    operationLanding?: boolean;
    path?: string;
    redirect?: boolean;
    to?: string;
    superuserOnly?: boolean;
    requiredCapability?: string;
    allowAuthenticated?: boolean;
    component?: ComponentType<any>;
    icon?: ComponentType<any>;
}
