import SAML from '../views/SAML/Index';

import { Business } from 'material-ui-icons';

let routes = [
    {
        path: '/saml',
        sidebarName: 'SAML',
        navbarName: 'SAML',
        icon: Business,
        component: SAML
    }
];

export default routes;
