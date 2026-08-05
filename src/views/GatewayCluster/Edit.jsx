import React, { useEffect, useRef, useState } from 'react';
import { Checkbox, Grid } from '@material-ui/core';
import Group from '@material-ui/icons/Group';
import Person from '@material-ui/icons/Person';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';

import {
    Button,
    CustomInput,
    CustomMaterialTable,
    GridItem,
    RegularCard,
    SnackbarContent,
} from '../../components';
import CustomTabs from '../../components/CustomTabs/CustomTabs';
import psono_server from '../../services/api-server';
import store from '../../services/store';

const GatewayCluster = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const { cluster_id } = useParams();
    const userTableRef = useRef(null);
    const groupTableRef = useRef(null);
    const [cluster, setCluster] = useState(null);
    const [title, setTitle] = useState('');
    const [allowAll, setAllowAll] = useState(true);
    const [mappedUsers, setMappedUsers] = useState({});
    const [mappedGroups, setMappedGroups] = useState({});
    const [errors, setErrors] = useState({});
    const [saved, setSaved] = useState(false);
    const [configuration, setConfiguration] = useState('');
    const credentials = () => [
        store.getState().user.token,
        store.getState().user.session_secret_key,
    ];

    const loadCluster = (preserveForm = false) => {
        if (!cluster_id) return Promise.resolve();
        return psono_server
            .admin_gateway_cluster(...credentials(), cluster_id)
            .then((response) => {
                const value = response.data;
                setCluster(value);
                if (!preserveForm) {
                    setTitle(value.title);
                    setAllowAll(value.allow_all);
                }
                setMappedUsers(
                    Object.fromEntries(
                        value.gateway_cluster_user_mappings.map((mapping) => [
                            mapping.id,
                            true,
                        ])
                    )
                );
                setMappedGroups(
                    Object.fromEntries(
                        value.gateway_cluster_group_mappings.map((mapping) => [
                            mapping.id,
                            true,
                        ])
                    )
                );
                userTableRef.current && userTableRef.current.onQueryChange();
                groupTableRef.current && groupTableRef.current.onQueryChange();
            });
    };

    useEffect(() => {
        loadCluster();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cluster_id]);

    useEffect(() => {
        userTableRef.current && userTableRef.current.onQueryChange();
        groupTableRef.current && groupTableRef.current.onQueryChange();
    }, [allowAll]);

    const save = () => {
        setErrors({});
        setSaved(false);
        const request = cluster_id
            ? psono_server.admin_update_gateway_cluster(
                  ...credentials(),
                  cluster_id,
                  title,
                  allowAll
              )
            : psono_server.admin_create_gateway_cluster(
                  ...credentials(),
                  title,
                  allowAll
              );
        request.then(
            (response) => {
                if (!cluster_id) {
                    history.replace('/gateway-cluster/' + response.data.id);
                    return;
                }
                setSaved(true);
                loadCluster();
            },
            (response) => setErrors(response.data)
        );
    };

    const toggleUser = (user) => {
        const method = mappedUsers[user.id] ? 'DELETE' : 'POST';
        psono_server
            .admin_gateway_cluster_user_map(
                ...credentials(),
                method,
                cluster_id,
                user.id
            )
            .then(() => loadCluster(true));
    };

    const toggleGroup = (group) => {
        const method = mappedGroups[group.id] ? 'DELETE' : 'POST';
        psono_server
            .admin_gateway_cluster_group_map(
                ...credentials(),
                method,
                cluster_id,
                group.id
            )
            .then(() => loadCluster(true));
    };

    const tableParams = (query) => {
        const params = {
            page_size: query.pageSize,
            search: query.search,
            page: query.page,
        };
        if (query.orderBy) {
            params.ordering =
                (query.orderDirection === 'desc' ? '-' : '') +
                query.orderBy.field;
        }
        return params;
    };

    const loadUsers = (query) =>
        psono_server
            .admin_user(...credentials(), undefined, tableParams(query))
            .then((response) => ({
                data: response.data.users.map((user) => ({
                    ...user,
                    mapped_raw: Boolean(mappedUsers[user.id]),
                    mapped: (
                        <Checkbox
                            checked={Boolean(mappedUsers[user.id])}
                            disabled={allowAll}
                            onChange={() => toggleUser(user)}
                        />
                    ),
                })),
                page: query.page,
                pageSize: query.pageSize,
                totalCount: response.data.count,
            }));

    const loadGroups = (query) =>
        psono_server
            .admin_group(...credentials(), undefined, tableParams(query))
            .then((response) => ({
                data: response.data.groups.map((group) => ({
                    ...group,
                    mapped_raw: Boolean(mappedGroups[group.id]),
                    mapped: (
                        <Checkbox
                            checked={Boolean(mappedGroups[group.id])}
                            disabled={allowAll}
                            onChange={() => toggleGroup(group)}
                        />
                    ),
                    is_managed: group.is_managed ? t('YES') : t('NO'),
                })),
                page: query.page,
                pageSize: query.pageSize,
                totalCount: response.data.count,
            }));

    const generateConfiguration = () => {
        setErrors({});
        psono_server
            .admin_generate_gateway_cluster_configuration(
                ...credentials(),
                cluster_id
            )
            .then(
                (response) => setConfiguration(response.data.configuration),
                (response) => setErrors(response.data)
            );
    };

    return (
        <Grid container>
            <GridItem xs={12} sm={12} md={12}>
                <RegularCard
                    cardTitle={t(
                        cluster_id
                            ? 'EDIT_GATEWAY_CLUSTER'
                            : 'CREATE_GATEWAY_CLUSTER'
                    )}
                    cardSubtitle={t('GATEWAY_CLUSTER_DETAILS_INFO')}
                    content={
                        <Grid container>
                            {cluster_id && cluster && (
                                <>
                                    <GridItem xs={12} sm={6} md={6}>
                                        <CustomInput
                                            labelText={t('ID')}
                                            id="cluster-id"
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: cluster.id,
                                                disabled: true,
                                            }}
                                        />
                                    </GridItem>
                                    <GridItem xs={12} sm={6} md={6}>
                                        <CustomInput
                                            labelText={t('CREATED_AT')}
                                            id="create-date"
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: moment(
                                                    cluster.create_date
                                                ).format('YYYY-MM-DD HH:mm:ss'),
                                                disabled: true,
                                            }}
                                        />
                                    </GridItem>
                                </>
                            )}
                            <GridItem xs={12} sm={6} md={6}>
                                <CustomInput
                                    labelText={t('TITLE')}
                                    id="title"
                                    formControlProps={{ fullWidth: true }}
                                    inputProps={{
                                        value: title,
                                        onChange: (event) =>
                                            setTitle(event.target.value),
                                    }}
                                    helperText={
                                        errors.title ? t(errors.title) : ''
                                    }
                                    error={Boolean(errors.title)}
                                />
                            </GridItem>
                            <GridItem xs={12} sm={6} md={6}>
                                <Checkbox
                                    checked={allowAll}
                                    onChange={() => setAllowAll(!allowAll)}
                                />
                                {t('ALLOW_ALL_USERS')}
                                <div>{t('ALLOW_ALL_USERS_INFO')}</div>
                            </GridItem>
                        </Grid>
                    }
                    footer={
                        <div>
                            <Button
                                color="primary"
                                disabled={!title}
                                onClick={save}
                            >
                                {t(cluster_id ? 'SAVE' : 'CREATE')}
                            </Button>
                            {saved && (
                                <SnackbarContent
                                    message={t('SAVE_SUCCESS')}
                                    color="success"
                                />
                            )}
                            {errors.non_field_errors && (
                                <SnackbarContent
                                    message={t(errors.non_field_errors)}
                                    color="danger"
                                />
                            )}
                        </div>
                    }
                />
            </GridItem>
            {cluster_id && (
                <GridItem xs={12} sm={12} md={12}>
                    <CustomTabs
                        headerColor="info"
                        title={t('GATEWAY_CLUSTER_ACCESS')}
                        tabs={[
                            {
                                tabName: t('USERS'),
                                tabIcon: Person,
                                tabContent: (
                                    <CustomMaterialTable
                                        tableRef={userTableRef}
                                        title=""
                                        columns={[
                                            {
                                                field: 'mapped',
                                                title: t('MAPPED'),
                                                sorting: false,
                                            },
                                            {
                                                field: 'username',
                                                title: t('USERNAME'),
                                            },
                                        ]}
                                        data={loadUsers}
                                    />
                                ),
                            },
                            {
                                tabName: t('GROUPS'),
                                tabIcon: Group,
                                tabContent: (
                                    <CustomMaterialTable
                                        tableRef={groupTableRef}
                                        title=""
                                        columns={[
                                            {
                                                field: 'mapped',
                                                title: t('MAPPED'),
                                                sorting: false,
                                            },
                                            {
                                                field: 'name',
                                                title: t('NAME'),
                                            },
                                            {
                                                field: 'member_count',
                                                title: t('MEMBERS'),
                                            },
                                            {
                                                field: 'is_managed',
                                                title: t('MANAGED'),
                                                sorting: false,
                                            },
                                        ]}
                                        data={loadGroups}
                                    />
                                ),
                            },
                        ]}
                    />
                </GridItem>
            )}
            {cluster_id && (
                <GridItem xs={12} sm={12} md={12}>
                    <RegularCard
                        cardTitle={t('GATEWAY_CONFIGURATION')}
                        cardSubtitle={t('GATEWAY_CONFIGURATION_INFO')}
                        content={
                            configuration ? (
                                <CustomInput
                                    labelText={t('CONFIGURATION')}
                                    id="gateway-configuration"
                                    formControlProps={{ fullWidth: true }}
                                    inputProps={{
                                        value: configuration,
                                        multiline: true,
                                        rows: 8,
                                        readOnly: true,
                                    }}
                                />
                            ) : null
                        }
                        footer={
                            <Button
                                color="primary"
                                onClick={generateConfiguration}
                            >
                                {t('GENERATE_GATEWAY_CONFIGURATION')}
                            </Button>
                        }
                    />
                </GridItem>
            )}
        </Grid>
    );
};

export default GatewayCluster;
