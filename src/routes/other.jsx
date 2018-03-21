import UserEdit from '../views/User/Edit';
import GroupEdit from '../views/Group/Edit';
import GroupCreate from '../views/Group/Create';

import { Person, Group } from 'material-ui-icons';

let routes = [
    {
        path: '/user/:user_id',
        sidebarName: 'User',
        navbarName: 'User',
        icon: Person,
        component: UserEdit
    },
    {
        path: '/group/:group_id',
        sidebarName: 'Group',
        navbarName: 'Group',
        icon: Group,
        component: GroupEdit
    },
    {
        path: '/groups/create',
        sidebarName: 'Create Group',
        navbarName: 'Create Group',
        icon: Person,
        component: GroupCreate
    }
];

export default routes;
