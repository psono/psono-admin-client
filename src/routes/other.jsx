import User from '../views/User/User.jsx';

import { Person } from 'material-ui-icons';

let routes = [
    {
        path: '/user/:user_id',
        sidebarName: 'User',
        navbarName: 'User',
        icon: Person,
        component: User
    }
];

export default routes;
