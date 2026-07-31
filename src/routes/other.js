import SecurityReportEdit from '../views/SecurityReport/Edit';
import UserEdit from '../views/User/Edit';
import GroupEdit from '../views/Group/Edit';
import GroupCreate from '../views/Group/Create';
import GroupShareRightCreate from '../views/Group/ShareRightCreate';
import PolicyCreate from '../views/Policies/Create';
import PolicyEdit from '../views/Policies/Edit';
import UserCreate from '../views/User/Create';
import ChangePassword from '../views/Account/ChangePassword';
import FileserverCluster from '../views/FileserverCluster/Edit';
import FileserverShard from '../views/FileserverShard/Edit';
import Fileserver from '../views/Fileserver/Edit';

import { Person, Group, Policy, Timeline, Storage } from '@material-ui/icons';

let routes = [
    {
        path: '/fileserver-clusters/create',
        sidebarName: 'CREATE_FILESERVER_CLUSTER',
        navbarName: 'CREATE_FILESERVER_CLUSTER',
        icon: Storage,
        component: FileserverCluster,
    },
    {
        path: '/fileserver-cluster/:cluster_id',
        sidebarName: 'FILESERVER_CLUSTER',
        navbarName: 'FILESERVER_CLUSTER',
        icon: Storage,
        component: FileserverCluster,
    },
    {
        path: '/fileserver-shards/create',
        sidebarName: 'CREATE_FILESERVER_SHARD',
        navbarName: 'CREATE_FILESERVER_SHARD',
        icon: Storage,
        component: FileserverShard,
    },
    {
        path: '/fileserver-shard/:shard_id',
        sidebarName: 'FILESERVER_SHARD',
        navbarName: 'FILESERVER_SHARD',
        icon: Storage,
        component: FileserverShard,
    },
    {
        path: '/fileserver/:fileserver_id',
        sidebarName: 'FILESERVER',
        navbarName: 'FILESERVER',
        icon: Storage,
        component: Fileserver,
    },
    {
        path: '/account/change-password',
        sidebarName: 'SETTINGS',
        navbarName: 'SETTINGS',
        icon: Person,
        component: ChangePassword,
    },
    {
        path: '/user/:user_id',
        sidebarName: 'USER',
        navbarName: 'USER',
        icon: Person,
        component: UserEdit,
    },
    {
        path: '/security-report/:security_report_id',
        sidebarName: 'SECURITY_REPORT',
        navbarName: 'SECURITY_REPORT',
        icon: Timeline,
        component: SecurityReportEdit,
    },
    {
        path: '/policy/:policy_id',
        sidebarName: 'POLICY',
        navbarName: 'POLICY',
        icon: Policy,
        component: PolicyEdit,
    },
    {
        path: '/group/:group_id/create-share-right',
        sidebarName: 'CREATE_SHARE_RIGHT',
        navbarName: 'CREATE_SHARE_RIGHT',
        icon: Group,
        component: GroupShareRightCreate,
    },
    {
        path: '/group/:group_id',
        sidebarName: 'GROUP',
        navbarName: 'GROUP',
        icon: Group,
        component: GroupEdit,
    },
    {
        path: '/policies/create',
        sidebarName: 'CREATE_POLICY',
        navbarName: 'CREATE_POLICY',
        icon: Policy,
        component: PolicyCreate,
    },
    {
        path: '/groups/create',
        sidebarName: 'CREATE_GROUP',
        navbarName: 'CREATE_GROUP',
        icon: Group,
        component: GroupCreate,
    },
    {
        path: '/users/create',
        sidebarName: 'CREATE_USER',
        navbarName: 'CREATE_USER',
        icon: Person,
        component: UserCreate,
    },
];

export default routes;
