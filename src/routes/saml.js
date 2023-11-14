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
    },
    {
        path: '/scim',
        sidebarName: 'SCIM',
        navbarName: 'SCIM',
        icon: Business,
        component: SCIM,
    },
];

export default routes;
