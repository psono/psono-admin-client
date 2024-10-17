import React, { useRef, useState } from 'react';
import { Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';

import { GridItem, CustomMaterialTable } from '../../components';
import psono_server from '../../services/api-server';
import i18n from '../../i18n';
import store from '../../services/store';

import TwoFactorChartCard from '../../containers/ChartCard/two_factor';
import BrowserChartCard from '../../containers/ChartCard/browser';
import OsChartCard from '../../containers/ChartCard/os';
import DeviceChartCard from '../../containers/ChartCard/device';
import DeleteConfirmDialog from '../../components/Dialog/DeleteConfirmDialog';
import CustomTabs from '../../components/CustomTabs/CustomTabs';
import Person from '@material-ui/icons/Person';
import Edit from '@material-ui/icons/Edit';
import CheckBox from '@material-ui/icons/CheckBox';
import NotInterested from '@material-ui/icons/NotInterested';
import Delete from '@material-ui/icons/Delete';
import Add from '@material-ui/icons/Add';
import DevicesOther from '@material-ui/icons/DevicesOther';

const UsersView = (props) => {
    const { t } = useTranslation();
    const userTableRef = useRef(null);
    const sessionTableRef = useRef(null);
    const history = useHistory();
    const [deleteUsers, setDeleteUsers] = useState([]);

    const onDeleteUsers = (selected_users) => {
        selected_users.forEach((user) => {
            psono_server
                .admin_delete_user(
                    store.getState().user.token,
                    store.getState().user.session_secret_key,
                    user.id
                )
                .then(() => {
                    userTableRef.current &&
                        userTableRef.current.onQueryChange();
                });
        });
    };

    const updateUsers = (selected_users, is_active) => {
        selected_users.forEach((user) => {
            psono_server
                .admin_update_user(
                    store.getState().user.token,
                    store.getState().user.session_secret_key,
                    user.id,
                    undefined,
                    is_active,
                    undefined,
                    undefined
                )
                .then(() => {
                    userTableRef.current &&
                        userTableRef.current.onQueryChange();
                });
        });
    };

    const onActivateUsers = (selected_users) => {
        return updateUsers(selected_users, true);
    };

    const onDeactivateUsers = (selected_users) => {
        return updateUsers(selected_users, false);
    };

    const onEditUser = (selected_users) => {
        history.push('/user/' + selected_users[0].id);
    };

    const onDeleteSessions = (selected_sessions) => {
        selected_sessions.forEach((session) => {
            psono_server
                .admin_delete_session(
                    store.getState().user.token,
                    store.getState().user.session_secret_key,
                    session.id
                )
                .then(() => {
                    sessionTableRef.current &&
                        sessionTableRef.current.onQueryChange();
                });
        });
    };

    const onCreateUser = () => {
        history.push('/users/create/');
    };

    const loadUsers = (query) => {
        const params = {
            page_size: query.pageSize,
            search: query.search,
            page: query.page,
        };
        if (query.orderBy) {
            if (query.orderDirection === 'asc') {
                params['ordering'] = query.orderBy.field;
            } else {
                params['ordering'] = '-' + query.orderBy.field;
            }
        }

        return psono_server
            .admin_user(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                undefined,
                params
            )
            .then((response) => {
                const { users } = response.data;

                users.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.last_login = moment(u.last_login).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.is_active = u.is_active ? i18n.t('YES') : i18n.t('NO');
                    u.is_email_active = u.is_email_active
                        ? i18n.t('YES')
                        : i18n.t('NO');

                    u.yubikey_otp_enabled = u.yubikey_otp_enabled
                        ? i18n.t('YES')
                        : i18n.t('NO');
                    u.google_authenticator_enabled =
                        u.google_authenticator_enabled
                            ? i18n.t('YES')
                            : i18n.t('NO');
                    u.duo_enabled = u.duo_enabled
                        ? i18n.t('YES')
                        : i18n.t('NO');
                    u.webauthn_enabled = u.webauthn_enabled
                        ? i18n.t('YES')
                        : i18n.t('NO');
                });
                return {
                    data: users,
                    page: query.page,
                    pageSize: query.pageSize,
                    totalCount: response.data.count,
                };
            });
    };

    const loadSessions = (query) => {
        const params = {
            page_size: query.pageSize,
            search: query.search,
            page: query.page,
        };
        if (query.orderBy) {
            if (query.orderDirection === 'asc') {
                params['ordering'] = query.orderBy.field;
            } else {
                params['ordering'] = '-' + query.orderBy.field;
            }
        }
        return psono_server
            .admin_session(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                params
            )
            .then((response) => {
                const { sessions } = response.data;

                sessions.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.valid_till = moment(u.valid_till).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.active =
                        u.active && moment(u.valid_till) > moment()
                            ? t('YES')
                            : t('NO');
                    u.completely_activated = u.active ? t('YES') : t('NO');
                });
                return {
                    data: sessions,
                    page: query.page,
                    pageSize: query.pageSize,
                    totalCount: response.data.count,
                };
            });
    };

    return (
        <div>
            <Grid container>
                <GridItem xs={12} sm={6} md={6} lg={3}>
                    <OsChartCard />
                </GridItem>
                <GridItem xs={12} sm={6} md={6} lg={3}>
                    <DeviceChartCard />
                </GridItem>
                <GridItem xs={12} sm={6} md={6} lg={3}>
                    <BrowserChartCard />
                </GridItem>
                <GridItem xs={12} sm={6} md={6} lg={3}>
                    <TwoFactorChartCard />
                </GridItem>
            </Grid>
            <Grid container>
                <GridItem xs={12} sm={12} md={12}>
                    {deleteUsers.length > 0 && (
                        <DeleteConfirmDialog
                            title={t('DELETE_USER_S')}
                            onConfirm={() => {
                                onDeleteUsers(deleteUsers);
                                setDeleteUsers([]);
                            }}
                            onAbort={() => {
                                setDeleteUsers([]);
                            }}
                        >
                            {t('DELETE_USER_CONFIRM_DIALOG')}
                        </DeleteConfirmDialog>
                    )}
                    <CustomTabs
                        title={t('USER_MANAGEMENT')}
                        headerColor="primary"
                        tabs={[
                            {
                                tabName: t('USERS'),
                                tabIcon: Person,
                                tabContent: (
                                    <CustomMaterialTable
                                        tableRef={userTableRef}
                                        columns={[
                                            {
                                                field: 'username',
                                                title: t('USERNAME'),
                                            },
                                            {
                                                field: 'create_date',
                                                title: t('CREATED_AT'),
                                            },
                                            {
                                                field: 'last_login',
                                                title: t('LAST_LOGIN'),
                                            },
                                            {
                                                field: 'is_active',
                                                title: t('ACTIVE'),
                                            },
                                            {
                                                field: 'is_email_active',
                                                title: t('EMAIL_ACTIVE'),
                                            },
                                            {
                                                field: 'yubikey_otp_enabled',
                                                title: t('YUBIKEY'),
                                            },
                                            {
                                                field: 'google_authenticator_enabled',
                                                title: t(
                                                    'GOOGLE_AUTHENTICATOR'
                                                ),
                                            },
                                            {
                                                field: 'duo_enabled',
                                                title: t('DUO_AUTHENTICATION'),
                                            },
                                            {
                                                field: 'webauthn_enabled',
                                                title: t('WEBAUTHN'),
                                            },
                                        ]}
                                        data={loadUsers}
                                        title={''}
                                        actions={[
                                            {
                                                tooltip: t('EDIT_USER_S'),
                                                icon: Edit,
                                                onClick: (evt, data) =>
                                                    onEditUser([data]),
                                            },
                                            {
                                                tooltip: t('ACTIVATE_USER_S'),
                                                icon: CheckBox,
                                                onClick: (evt, data) =>
                                                    onActivateUsers([data]),
                                            },
                                            {
                                                tooltip: t('DEACTIVATE_USER_S'),
                                                icon: NotInterested,
                                                onClick: (evt, data) =>
                                                    onDeactivateUsers([data]),
                                            },
                                            {
                                                tooltip: t('DELETE_USER_S'),
                                                icon: Delete,
                                                onClick: (evt, data) => {
                                                    setDeleteUsers([data]);
                                                },
                                            },
                                            {
                                                tooltip: t('CREATE_USER'),
                                                isFreeAction: true,
                                                icon: Add,
                                                onClick: (evt) =>
                                                    onCreateUser(),
                                            },
                                        ]}
                                    />
                                ),
                            },
                            {
                                tabName: t('SESSIONS'),
                                tabIcon: DevicesOther,
                                tabContent: (
                                    <CustomMaterialTable
                                        tableRef={sessionTableRef}
                                        columns={[
                                            {
                                                field: 'username',
                                                title: t('USERNAME'),
                                            },
                                            {
                                                field: 'create_date',
                                                title: t('LOGGED_IN_AT'),
                                            },
                                            {
                                                field: 'valid_till',
                                                title: t('VALID_TILL'),
                                            },
                                            {
                                                field: 'device_description',
                                                title: t('DEVICE_DESCRIPTION'),
                                            },
                                            {
                                                field: 'device_fingerprint',
                                                title: t('DEVICE'),
                                            },
                                            {
                                                field: 'completely_activated',
                                                title: t('ACTIVATED'),
                                            },
                                            {
                                                field: 'active',
                                                title: t('STILL_ACTIVE'),
                                            },
                                        ]}
                                        data={loadSessions}
                                        title={''}
                                        actions={[
                                            {
                                                tooltip: t('DELETE_SESSION_S'),
                                                icon: Delete,
                                                onClick: (evt, data) =>
                                                    onDeleteSessions([data]),
                                            },
                                        ]}
                                    />
                                ),
                            },
                        ]}
                    />
                </GridItem>
            </Grid>
        </div>
    );
};

export default UsersView;
