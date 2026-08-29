import DesktopWindows from '@material-ui/icons/DesktopWindows';

import Gateways from '../views/Gateways/Index';

const routes = [
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
