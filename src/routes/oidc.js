import OIDC from '../views/OIDC/Index';

import { Business } from '@material-ui/icons';

let routes = [
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
