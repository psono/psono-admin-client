import type { AdminRoute } from '../types/authorization';
import Storage from '@mui/icons-material/Storage';

import Fileservers from '../views/Fileservers/Index';

const routes: AdminRoute[] = [
    {
        path: '/fileservers',
        sidebarName: 'FILESERVER',
        navbarName: 'FILESERVER',
        icon: Storage,
        component: Fileservers,
        requiredCapability: 'fileservers.read',
        sidebarGroup: 'SETTINGS',
        sidebarOrder: 90,
    },
];

export default routes;
