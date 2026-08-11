import React, { useRef, useState } from 'react';
import { Grid } from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
import DesktopWindows from '@material-ui/icons/DesktopWindows';
import Edit from '@material-ui/icons/Edit';
import Storage from '@material-ui/icons/Storage';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { CustomMaterialTable, GridItem } from '../../components';
import CustomTabs from '../../components/CustomTabs/CustomTabs';
import DeleteConfirmDialog from '../../components/Dialog/DeleteConfirmDialog';
import psono_server from '../../services/api-server';
import store from '../../services/store';

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

const Gateways = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const clusterTableRef = useRef(null);
    const gatewayTableRef = useRef(null);
    const [pendingDelete, setPendingDelete] = useState(null);
    const credentials = () => [
        store.getState().user.token,
        store.getState().user.session_secret_key,
    ];

    const loadClusters = (query) =>
        psono_server
            .admin_gateway_cluster(
                ...credentials(),
                undefined,
                queryParams(query)
            )
            .then((response) => ({
                data: response.data.clusters.map((cluster) => ({
                    ...cluster,
                    allow_all: cluster.allow_all ? t('YES') : t('NO'),
                    create_date: moment(cluster.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    ),
                })),
                page: query.page,
                pageSize: query.pageSize,
                totalCount: response.data.count,
            }));

    const loadGateways = (query) =>
        psono_server
            .admin_gateway(...credentials(), undefined, queryParams(query))
            .then((response) => ({
                data: response.data.gateways.map((gateway) => ({
                    ...gateway,
                    valid_till: moment(gateway.valid_till).format(
                        'YYYY-MM-DD HH:mm:ss'
                    ),
                })),
                page: query.page,
                pageSize: query.pageSize,
                totalCount: response.data.count,
            }));

    const confirmDelete = () => {
        psono_server
            .admin_delete_gateway_cluster(...credentials(), pendingDelete.id)
            .then(() => {
                clusterTableRef.current &&
                    clusterTableRef.current.onQueryChange();
            });
        setPendingDelete(null);
    };

    return (
        <Grid container>
            <GridItem xs={12} sm={12} md={12}>
                {pendingDelete && (
                    <DeleteConfirmDialog
                        title={t('DELETE_GATEWAY_CLUSTER')}
                        onConfirm={confirmDelete}
                        onAbort={() => setPendingDelete(null)}
                    >
                        {t('DELETE_GATEWAY_CLUSTER_CONFIRM')}
                    </DeleteConfirmDialog>
                )}
                <CustomTabs
                    headerColor="info"
                    title={t('GATEWAY_MANAGEMENT')}
                    tabs={[
                        {
                            tabName: t('CLUSTERS'),
                            tabIcon: Storage,
                            tabContent: (
                                <CustomMaterialTable
                                    tableRef={clusterTableRef}
                                    title=""
                                    columns={[
                                        { field: 'title', title: t('TITLE') },
                                        {
                                            field: 'allow_all',
                                            title: t('ALLOW_ALL_USERS'),
                                        },
                                        {
                                            field: 'member_count',
                                            title: t('GATEWAYS'),
                                        },
                                        {
                                            field: 'user_mapping_count',
                                            title: t('USERS'),
                                        },
                                        {
                                            field: 'group_mapping_count',
                                            title: t('GROUPS'),
                                        },
                                        {
                                            field: 'create_date',
                                            title: t('CREATED_AT'),
                                        },
                                    ]}
                                    data={loadClusters}
                                    actions={[
                                        {
                                            tooltip: t('EDIT'),
                                            icon: Edit,
                                            onClick: (event, item) =>
                                                history.push(
                                                    '/gateway-cluster/' +
                                                        item.id
                                                ),
                                        },
                                        {
                                            tooltip: t('DELETE'),
                                            icon: Delete,
                                            onClick: (event, item) =>
                                                setPendingDelete(item),
                                        },
                                        {
                                            tooltip: t(
                                                'CREATE_GATEWAY_CLUSTER'
                                            ),
                                            isFreeAction: true,
                                            icon: Add,
                                            onClick: () =>
                                                history.push(
                                                    '/gateway-clusters/create'
                                                ),
                                        },
                                    ]}
                                />
                            ),
                        },
                        {
                            tabName: t('GATEWAYS'),
                            tabIcon: DesktopWindows,
                            tabContent: (
                                <CustomMaterialTable
                                    tableRef={gatewayTableRef}
                                    title=""
                                    columns={[
                                        {
                                            field: 'hostname',
                                            title: t('HOSTNAME'),
                                        },
                                        {
                                            field: 'cluster_title',
                                            title: t('CLUSTER'),
                                        },
                                        {
                                            field: 'url',
                                            title: t('PUBLIC_URL'),
                                        },
                                        {
                                            field: 'version',
                                            title: t('VERSION'),
                                        },
                                        {
                                            field: 'valid_till',
                                            title: t('VALID_TILL'),
                                        },
                                    ]}
                                    data={loadGateways}
                                    actions={[
                                        {
                                            tooltip: t('DETAILS'),
                                            icon: Edit,
                                            onClick: (event, item) =>
                                                history.push(
                                                    '/gateway/' + item.id
                                                ),
                                        },
                                    ]}
                                />
                            ),
                        },
                    ]}
                />
            </GridItem>
        </Grid>
    );
};

export default Gateways;
