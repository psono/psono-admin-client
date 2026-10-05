import type { AdminRoute } from '../types/authorization';
import OIDC from '../views/OIDC/Index';

import { Business } from '@mui/icons-material';

let routes: AdminRoute[] = [
    {
        path: '/oidc',
        sidebarName: 'OIDC',
        navbarName: 'OIDC',
        icon: Business,
        component: OIDC,
        requiredCapability: 'identity_providers.read',
        sidebarGroup: 'SETTINGS',
        sidebarOrder: 60,
    },
];

export default routes;
