import type { AdminRoute } from '../types/authorization';
import { Policy } from '@mui/icons-material';

import Policies from '../views/Policies/Index';

let routes: AdminRoute[] = [
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
