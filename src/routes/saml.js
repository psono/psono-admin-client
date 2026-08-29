import SAML from '../views/SAML/Index';
import SCIM from '../views/SCIM/Index';

import { Business } from '@material-ui/icons';

let routes = [
    {
        path: '/saml',
        sidebarName: 'SAML',
        navbarName: 'SAML',
        icon: Business,
        component: SAML,
        requiredCapability: 'identity_providers.read',
        sidebarGroup: 'SETTINGS',
        sidebarOrder: 50,
    },
    {
        path: '/scim',
        sidebarName: 'SCIM',
        navbarName: 'SCIM',
        icon: Business,
        component: SCIM,
        requiredCapability: 'identity_providers.read',
        sidebarGroup: 'SETTINGS',
        sidebarOrder: 70,
    },
];

export default routes;
