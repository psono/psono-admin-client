import DashboardPage from '../views/Dashboard/Dashboard.jsx';
// import UserProfile from "../views/UserProfile/UserProfile.jsx";
import Users from '../views/Users/Users.jsx';
// import TableList from "../views/TableList/TableList.jsx";
// import Typography from "../views/Typography/Typography.jsx";
// import Icons from "../views/Icons/Icons.jsx";
// import Maps from "../views/Maps/Maps.jsx";
// import NotificationsPage from "../views/Notifications/Notifications.jsx";

import {
    Dashboard,
    Person //, ContentPaste, LibraryBooks, BubbleChart, LocationOn, Notifications
} from 'material-ui-icons';

let appRoutes = [
    {
        path: '/dashboard',
        sidebarName: 'Dashboard',
        navbarName: 'Dashboard',
        icon: Dashboard,
        component: DashboardPage
    },
    {
        path: '/users',
        sidebarName: 'Users',
        navbarName: 'Users',
        icon: Person,
        component: Users
    }
];

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    //dev
    // preserve
    // appRoutes = appRoutes.concat([
    //     { path: "/profile", sidebarName: "Orig. User Profile", navbarName: "Original: Profile", icon: Person, component: UserProfile },
    //     { path: "/table", sidebarName: "Orig. Table List", navbarName: "Original: Table List", icon: ContentPaste, component: TableList },
    //     { path: "/typography", sidebarName: "Orig. Typography", navbarName: "Original: Typography", icon: LibraryBooks, component: Typography },
    //     { path: "/icons", sidebarName: "Orig.I cons", navbarName: "Original: Icons", icon: BubbleChart, component: Icons },
    //     { path: "/maps", sidebarName: "Orig. Maps", navbarName: "Original: Map", icon: LocationOn, component: Maps },
    //     { path: "/notifications", sidebarName: "Orig. Notifications", navbarName: "Original: Notifications", icon: Notifications, component: NotificationsPage },
    // ])
} else {
    // prod
}

appRoutes = appRoutes.concat([
    { redirect: true, path: '/', to: '/dashboard', navbarName: 'Redirect' }
]);

export default appRoutes;
