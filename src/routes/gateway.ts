import type { AdminRoute } from '../types/authorization';
import DesktopWindows from '@mui/icons-material/DesktopWindows';

import Gateways from '../views/Gateways/Index';

const routes: AdminRoute[] = [
    {
        path: '/gateways',
        sidebarName: 'GATEWAY',
        navbarName: 'GATEWAY',
        icon: DesktopWindows,
        component: Gateways,
        sidebarGroup: 'SETTINGS',
        sidebarOrder: 80,
    },
];

export default routes;
