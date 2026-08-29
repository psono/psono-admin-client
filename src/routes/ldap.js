import LDAP from '../views/LDAP/Index';

import { Business } from '@material-ui/icons';

let routes = [
    {
        path: '/ldap',
        sidebarName: 'LDAP',
        navbarName: 'LDAP',
        icon: Business,
        component: LDAP,
        requiredCapability: 'identity_providers.read',
        sidebarGroup: 'SETTINGS',
        sidebarOrder: 40,
    },
];

export default routes;
