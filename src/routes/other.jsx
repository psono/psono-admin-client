import SecurityReportEdit from '../views/SecurityReport/Edit';
import UserEdit from '../views/User/Edit';
import GroupEdit from '../views/Group/Edit';
import GroupCreate from '../views/Group/Create';

import { Person, Group, Timeline } from '@material-ui/icons';

let routes = [
    {
        path: '/user/:user_id',
        sidebarName: 'USER',
        navbarName: 'USER',
        icon: Person,
        component: UserEdit
    },
    {
        path: '/security-report/:security_report_id',
        sidebarName: 'SECURITY_REPORT',
        navbarName: 'SECURITY_REPORT',
        icon: Timeline,
        component: SecurityReportEdit
    },
    {
        path: '/group/:group_id',
        sidebarName: 'GROUP',
        navbarName: 'GROUP',
        icon: Group,
        component: GroupEdit
    },
    {
        path: '/groups/create',
        sidebarName: 'CREATE_GROUP',
        navbarName: 'CREATE_GROUP',
        icon: Person,
        component: GroupCreate
    }
];

export default routes;
