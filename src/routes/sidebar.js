import DashboardPage from '../views/Dashboard/Index';
import Users from '../views/Users/Index';
import Groups from '../views/Groups/Index';
import SecurityReports from '../views/SecurityReports/Index';

import { Dashboard, Person, Timeline, Group } from '@material-ui/icons';

let routes = [
    {
        path: '/dashboard',
        sidebarName: 'DASHBOARD',
        navbarName: 'DASHBOARD',
        icon: Dashboard,
        component: DashboardPage,
    },
    {
        path: '/users',
        sidebarName: 'USERS',
        navbarName: 'USERS',
        icon: Person,
        component: Users,
    },
    {
        path: '/groups',
        sidebarName: 'GROUPS',
        navbarName: 'GROUPS',
        icon: Group,
        component: Groups,
    },
    {
        path: '/security-reports',
        sidebarName: 'SECURITY_REPORTS',
        navbarName: 'SECURITY_REPORTS',
        icon: Timeline,
        component: SecurityReports,
    },
];

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    //dev
    // preserve
    // routes = routes.concat([
    //     {
    //         path: '/profile',
    //         sidebarName: 'Orig. User Profile',
    //         navbarName: 'Original: Profile',
    //         icon: Person,
    //         component: UserProfile
    //     },
    //     {
    //         path: '/table',
    //         sidebarName: 'Orig. Table List',
    //         navbarName: 'Original: Table List',
    //         icon: ContentPaste,
    //         component: TableList
    //     },
    //     {
    //         path: '/typography',
    //         sidebarName: 'Orig. Typography',
    //         navbarName: 'Original: Typography',
    //         icon: LibraryBooks,
    //         component: Typography
    //     },
    //     {
    //         path: '/icons',
    //         sidebarName: 'Orig.I cons',
    //         navbarName: 'Original: Icons',
    //         icon: BubbleChart,
    //         component: Icons
    //     },
    //     {
    //         path: '/maps',
    //         sidebarName: 'Orig. Maps',
    //         navbarName: 'Original: Map',
    //         icon: LocationOn,
    //         component: Maps
    //     },
    //     {
    //         path: '/notifications',
    //         sidebarName: 'Orig. Notifications',
    //         navbarName: 'Original: Notifications',
    //         icon: Notifications,
    //         component: NotificationsPage
    //     }
    // ]);
} else {
    // prod
}

routes = routes.concat([
    { redirect: true, path: '/', to: '/dashboard', navbarName: 'Redirect' },
]);

export default routes;
