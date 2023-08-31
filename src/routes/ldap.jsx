import LDAP from '../views/LDAP/Index';

import { Business } from '@material-ui/icons';

let routes = [
    {
        path: '/ldap',
        sidebarName: 'LDAP',
        navbarName: 'LDAP',
        icon: Business,
        component: LDAP,
    },
];

export default routes;
