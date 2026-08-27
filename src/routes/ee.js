import { Policy } from '@material-ui/icons';

import Policies from '../views/Policies/Index';

let routes = [
    {
        path: '/policies',
        sidebarName: 'POLICIES',
        navbarName: 'POLICIES',
        icon: Policy,
        component: Policies,
        sidebarGroup: 'SETTINGS',
        sidebarOrder: 10,
    },
];

export default routes;
