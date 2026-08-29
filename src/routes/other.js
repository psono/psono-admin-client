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
import GatewayCluster from '../views/GatewayCluster/Edit';
import Gateway from '../views/Gateway/Edit';
import TenantEdit from '../views/Tenant/Edit';
import AdministrativeRoleEdit from '../views/AdministrativeRole/Edit';

import {
    Person,
    Group,
    Policy,
    Timeline,
    Storage,
    DesktopWindows,
} from '@material-ui/icons';

let routes = [
    {
        path: '/gateway-clusters/create',
        sidebarName: 'CREATE_GATEWAY_CLUSTER',
        navbarName: 'CREATE_GATEWAY_CLUSTER',
        icon: DesktopWindows,
        component: GatewayCluster,
    },
    {
        path: '/gateway-cluster/:cluster_id',
        sidebarName: 'GATEWAY_CLUSTER',
        navbarName: 'GATEWAY_CLUSTER',
        icon: DesktopWindows,
        component: GatewayCluster,
    },
    {
        path: '/gateway/:gateway_id',
        sidebarName: 'GATEWAY',
        navbarName: 'GATEWAY',
        icon: DesktopWindows,
        component: Gateway,
    },
    {
        path: '/fileserver-clusters/create',
        sidebarName: 'CREATE_FILESERVER_CLUSTER',
        navbarName: 'CREATE_FILESERVER_CLUSTER',
        icon: Storage,
        component: FileserverCluster,
        requiredCapability: 'fileservers.manage',
        operationLanding: true,
    },
    {
        path: '/fileserver-cluster/:cluster_id',
        sidebarName: 'FILESERVER_CLUSTER',
        navbarName: 'FILESERVER_CLUSTER',
        icon: Storage,
        component: FileserverCluster,
        requiredCapability: 'fileservers.read',
    },
    {
        path: '/fileserver-shards/create',
        sidebarName: 'CREATE_FILESERVER_SHARD',
        navbarName: 'CREATE_FILESERVER_SHARD',
        icon: Storage,
        component: FileserverShard,
        requiredCapability: 'fileservers.manage',
        operationLanding: true,
    },
    {
        path: '/fileserver-shard/:shard_id',
        sidebarName: 'FILESERVER_SHARD',
        navbarName: 'FILESERVER_SHARD',
        icon: Storage,
        component: FileserverShard,
        requiredCapability: 'fileservers.read',
    },
    {
        path: '/fileserver/:fileserver_id',
        sidebarName: 'FILESERVER',
        navbarName: 'FILESERVER',
        icon: Storage,
        component: Fileserver,
        requiredCapability: 'fileservers.read',
    },
    {
        path: '/account/change-password',
        sidebarName: 'ACCOUNT',
        navbarName: 'ACCOUNT',
        icon: Person,
        component: ChangePassword,
        allowAuthenticated: true,
    },
    {
        path: '/user/:user_id',
        sidebarName: 'USER',
        navbarName: 'USER',
        icon: Person,
        component: UserEdit,
        requiredCapability: 'users.read',
    },
    {
        path: '/security-report/:security_report_id',
        sidebarName: 'SECURITY_REPORT',
        navbarName: 'SECURITY_REPORT',
        icon: Timeline,
        component: SecurityReportEdit,
        requiredCapability: 'security_reports.read',
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
        requiredCapability: 'groups.shares.manage',
    },
    {
        path: '/group/:group_id',
        sidebarName: 'GROUP',
        navbarName: 'GROUP',
        icon: Group,
        component: GroupEdit,
        requiredCapability: 'groups.read',
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
        requiredCapability: 'users.create',
        operationLanding: true,
    },
    {
        path: '/tenants/create',
        sidebarName: 'CREATE_TENANT',
        navbarName: 'CREATE_TENANT',
        icon: Group,
        component: TenantEdit,
        superuserOnly: true,
    },
    {
        path: '/tenant/:tenant_id',
        sidebarName: 'TENANT',
        navbarName: 'TENANT',
        icon: Group,
        component: TenantEdit,
        superuserOnly: true,
    },
    {
        path: '/administrative-roles/create',
        sidebarName: 'CREATE_ADMINISTRATIVE_ROLE',
        navbarName: 'CREATE_ADMINISTRATIVE_ROLE',
        icon: Policy,
        component: AdministrativeRoleEdit,
        superuserOnly: true,
    },
    {
        path: '/administrative-role/:role_id',
        sidebarName: 'ADMINISTRATIVE_ROLE',
        navbarName: 'ADMINISTRATIVE_ROLE',
        icon: Policy,
        component: AdministrativeRoleEdit,
        superuserOnly: true,
    },
];

export default routes;
