import React, { useRef, useState } from 'react';
import { Grid } from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import Storage from '@material-ui/icons/Storage';
import Dns from '@material-ui/icons/Dns';
import ViewModule from '@material-ui/icons/ViewModule';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { CustomMaterialTable, GridItem } from '../../components';
import CustomTabs from '../../components/CustomTabs/CustomTabs';
import DeleteConfirmDialog from '../../components/Dialog/DeleteConfirmDialog';
import psono_server from '../../services/api-server';
import store from '../../services/store';
import { hasAnyScopeCapability } from '../../services/authorization';

const queryParams = (query) => {
    const params = {
        page_size: query.pageSize,
        search: query.search,
        page: query.page,
    };
    if (query.orderBy) {
        params.ordering =
            (query.orderDirection === 'desc' ? '-' : '') + query.orderBy.field;
    }
    return params;
};

const Fileservers = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const clusterTableRef = useRef(null);
    const shardTableRef = useRef(null);
    const fileserverTableRef = useRef(null);
    const [pendingDelete, setPendingDelete] = useState(null);
    const canManage = hasAnyScopeCapability(
        store.getState().user.authorization,
        'fileservers.manage'
    );
    const credentials = () => [
        store.getState().user.token,
        store.getState().user.session_secret_key,
    ];

    const loadClusters = (query) =>
        psono_server
            .admin_fileserver_cluster(
                ...credentials(),
                undefined,
                queryParams(query)
            )
            .then((response) => ({
                data: response.data.clusters.map((cluster) => ({
                    id: cluster.id,
                    title: cluster.title,
                    file_size_limit: cluster.file_size_limit,
                    shard_count: cluster.shard_count,
                    member_count: cluster.member_count,
                    live_member_count: cluster.live_member_count,
                    create_date: moment(cluster.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    ),
                })),
                page: query.page,
                pageSize: query.pageSize,
                totalCount: response.data.count,
            }));

    const loadShards = (query) =>
        psono_server
            .admin_fileserver_shard(
                ...credentials(),
                undefined,
                queryParams(query)
            )
            .then((response) => ({
                data: response.data.shards.map((shard) => ({
                    id: shard.id,
                    title: shard.title,
                    description: shard.description,
                    active: shard.active ? t('YES') : t('NO'),
                    cluster_count: shard.cluster_count,
                    member_count: shard.member_count,
                    create_date: moment(shard.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    ),
                })),
                page: query.page,
                pageSize: query.pageSize,
                totalCount: response.data.count,
            }));

    const loadFileservers = (query) =>
        psono_server
            .admin_fileserver(...credentials(), undefined, queryParams(query))
            .then((response) => ({
                data: response.data.fileservers.map((fileserver) => ({
                    id: fileserver.id,
                    hostname: fileserver.hostname,
                    url: fileserver.url,
                    version: fileserver.version,
                    cluster_title: fileserver.cluster_title,
                    valid_till: moment(fileserver.valid_till).format(
                        'YYYY-MM-DD HH:mm:ss'
                    ),
                })),
                page: query.page,
                pageSize: query.pageSize,
                totalCount: response.data.count,
            }));

    const confirmDelete = () => {
        const { type, item } = pendingDelete;
        const request =
            type === 'cluster'
                ? psono_server.admin_delete_fileserver_cluster(
                      ...credentials(),
                      item.id
                  )
                : psono_server.admin_delete_fileserver_shard(
                      ...credentials(),
                      item.id
                  );
        request.then(() => {
            const tableRef =
                type === 'cluster' ? clusterTableRef : shardTableRef;
            tableRef.current && tableRef.current.onQueryChange();
        });
        setPendingDelete(null);
    };

    const clusters = (
        <CustomMaterialTable
            tableRef={clusterTableRef}
            title=""
            columns={[
                { field: 'title', title: t('TITLE') },
                { field: 'file_size_limit', title: t('FILE_SIZE_LIMIT') },
                { field: 'shard_count', title: t('SHARDS') },
                { field: 'live_member_count', title: t('LIVE_FILE_SERVERS') },
                { field: 'member_count', title: t('FILE_SERVERS') },
                { field: 'create_date', title: t('CREATED_AT') },
            ]}
            data={loadClusters}
            actions={[
                !canManage && {
                    tooltip: t('DETAILS'),
                    icon: Edit,
                    onClick: (event, item) =>
                        history.push('/fileserver-cluster/' + item.id),
                },
                canManage && {
                    tooltip: t('EDIT'),
                    icon: Edit,
                    onClick: (event, item) =>
                        history.push('/fileserver-cluster/' + item.id),
                },
                canManage && {
                    tooltip: t('DELETE'),
                    icon: Delete,
                    onClick: (event, item) =>
                        setPendingDelete({ type: 'cluster', item }),
                },
                canManage && {
                    tooltip: t('CREATE_FILESERVER_CLUSTER'),
                    isFreeAction: true,
                    icon: Add,
                    onClick: () => history.push('/fileserver-clusters/create'),
                },
            ].filter(Boolean)}
        />
    );

    const shards = (
        <CustomMaterialTable
            tableRef={shardTableRef}
            title=""
            columns={[
                { field: 'title', title: t('TITLE') },
                { field: 'description', title: t('DESCRIPTION') },
                { field: 'active', title: t('ACTIVE') },
                { field: 'cluster_count', title: t('CLUSTERS') },
                { field: 'member_count', title: t('FILE_SERVERS') },
                { field: 'create_date', title: t('CREATED_AT') },
            ]}
            data={loadShards}
            actions={[
                !canManage && {
                    tooltip: t('DETAILS'),
                    icon: Edit,
                    onClick: (event, item) =>
                        history.push('/fileserver-shard/' + item.id),
                },
                canManage && {
                    tooltip: t('EDIT'),
                    icon: Edit,
                    onClick: (event, item) =>
                        history.push('/fileserver-shard/' + item.id),
                },
                canManage && {
                    tooltip: t('DELETE'),
                    icon: Delete,
                    onClick: (event, item) =>
                        setPendingDelete({ type: 'shard', item }),
                },
                canManage && {
                    tooltip: t('CREATE_FILESERVER_SHARD'),
                    isFreeAction: true,
                    icon: Add,
                    onClick: () => history.push('/fileserver-shards/create'),
                },
            ].filter(Boolean)}
        />
    );

    const members = (
        <CustomMaterialTable
            tableRef={fileserverTableRef}
            title=""
            columns={[
                { field: 'hostname', title: t('HOSTNAME') },
                { field: 'cluster_title', title: t('CLUSTER') },
                { field: 'url', title: t('PUBLIC_URL') },
                { field: 'version', title: t('VERSION') },
                { field: 'valid_till', title: t('VALID_TILL') },
            ]}
            data={loadFileservers}
            actions={[
                {
                    tooltip: t('DETAILS'),
                    icon: Edit,
                    onClick: (event, item) =>
                        history.push('/fileserver/' + item.id),
                },
            ]}
        />
    );

    return (
        <Grid container>
            <GridItem xs={12} sm={12} md={12}>
                {pendingDelete && (
                    <DeleteConfirmDialog
                        title={t('DELETE_FILESERVER_RESOURCE')}
                        onConfirm={confirmDelete}
                        onAbort={() => setPendingDelete(null)}
                    >
                        {t('DELETE_FILESERVER_RESOURCE_CONFIRM')}
                    </DeleteConfirmDialog>
                )}
                <CustomTabs
                    headerColor="info"
                    title={t('FILESERVER_MANAGEMENT')}
                    tabs={[
                        {
                            tabName: t('CLUSTERS'),
                            tabIcon: Storage,
                            tabContent: clusters,
                        },
                        {
                            tabName: t('SHARDS'),
                            tabIcon: ViewModule,
                            tabContent: shards,
                        },
                        {
                            tabName: t('FILE_SERVERS'),
                            tabIcon: Dns,
                            tabContent: members,
                        },
                    ]}
                />
            </GridItem>
        </Grid>
    );
};

export default Fileservers;
