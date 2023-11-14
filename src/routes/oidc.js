import OIDC from '../views/OIDC/Index';

import { Business } from '@material-ui/icons';

let routes = [
    {
        path: '/oidc',
        sidebarName: 'OIDC',
        navbarName: 'OIDC',
        icon: Business,
        component: OIDC,
    },
];

export default routes;
