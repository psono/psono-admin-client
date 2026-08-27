import Storage from '@material-ui/icons/Storage';

import Fileservers from '../views/Fileservers/Index';

const routes = [
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
