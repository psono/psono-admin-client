import React from 'react';
import { withStyles, Grid } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { UsersCard, GridItem } from '../../components';
import dashboardStyle from '../../assets/jss/material-dashboard-react/dashboardStyle';
import psono_server from '../../services/api-server';
import i18n from '../../i18n';
import store from '../../services/store';

import TwoFactorChartCard from '../../containers/ChartCard/two_factor';
import BrowserChartCard from '../../containers/ChartCard/browser';
import OsChartCard from '../../containers/ChartCard/os';
import DeviceChartCard from '../../containers/ChartCard/device';

class Users extends React.Component {
    userTableRef = React.createRef();
    groupTableRef = React.createRef();
    sessionTableRef = React.createRef();
    state = {
        redirect_to: '',
    };

    onDeleteUsers(selected_users) {
        selected_users.forEach((user) => {
            psono_server
                .admin_delete_user(
                    store.getState().user.token,
                    store.getState().user.session_secret_key,
                    user.id
                )
                .then(() => {
                    this.userTableRef.current &&
                        this.userTableRef.current.onQueryChange();
                });
        });
    }

    update_users(selected_users, is_active) {
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
                    this.userTableRef.current &&
                        this.userTableRef.current.onQueryChange();
                });
        });
    }

    onActivateUsers(selected_users) {
        return this.update_users(selected_users, true);
    }

    onDeactivateUsers(selected_users) {
        return this.update_users(selected_users, false);
    }

    onEditUser(selected_users) {
        this.setState({
            redirect_to: '/user/' + selected_users[0].id,
        });
    }

    onEditGroup(selected_groups) {
        this.setState({
            redirect_to: '/group/' + selected_groups[0].id,
        });
    }

    onDeleteSessions(selected_sessions) {
        selected_sessions.forEach((session) => {
            psono_server
                .admin_delete_session(
                    store.getState().user.token,
                    store.getState().user.session_secret_key,
                    session.id
                )
                .then(() => {
                    this.sessionTableRef.current &&
                        this.sessionTableRef.current.onQueryChange();
                });
        });
    }

    onDeleteGroups(selected_groups) {
        selected_groups.forEach((group) => {
            psono_server
                .admin_delete_group(
                    store.getState().user.token,
                    store.getState().user.session_secret_key,
                    group.id
                )
                .then(() => {
                    this.groupTableRef.current &&
                        this.groupTableRef.current.onQueryChange();
                });
        });
    }

    onCreateGroup() {
        this.setState({
            redirect_to: '/groups/create/',
        });
    }

    onCreateUser() {
        this.setState({
            redirect_to: '/users/create/',
        });
    }

    loadUsers(query) {
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
                });
                return {
                    data: users,
                    page: query.page,
                    pageSize: query.pageSize,
                    totalCount: response.data.count,
                };
            });
    }

    loadSessions(query) {
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

        const { t } = this.props;

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
    }

    loadGroups(query) {
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
        const { t } = this.props;

        return psono_server
            .admin_group(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                undefined,
                params
            )
            .then((response) => {
                const { groups } = response.data;
                groups.forEach((g) => {
                    g.create_date = moment(g.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    g.is_managed = g.is_managed ? t('YES') : t('NO');
                });
                return {
                    data: groups,
                    page: query.page,
                    pageSize: query.pageSize,
                    totalCount: response.data.count,
                };
            });
    }

    render() {
        if (this.state.redirect_to) {
            return <Redirect to={this.state.redirect_to} />;
        }
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
                        <UsersCard
                            loadUsers={(query) => this.loadUsers(query)}
                            loadSessions={(query) => this.loadSessions(query)}
                            loadGroups={(query) => this.loadGroups(query)}
                            userTableRef={this.userTableRef}
                            groupTableRef={this.groupTableRef}
                            sessionTableRef={this.sessionTableRef}
                            onDeleteUsers={(user_ids) =>
                                this.onDeleteUsers(user_ids)
                            }
                            onActivate={(user_ids) =>
                                this.onActivateUsers(user_ids)
                            }
                            onDeactivate={(user_ids) =>
                                this.onDeactivateUsers(user_ids)
                            }
                            onEditUser={(user_ids) => this.onEditUser(user_ids)}
                            onEditGroup={(group_ids) =>
                                this.onEditGroup(group_ids)
                            }
                            onDeleteSessions={(selected_sessions) =>
                                this.onDeleteSessions(selected_sessions)
                            }
                            onDeleteGroups={(selected_groups) =>
                                this.onDeleteGroups(selected_groups)
                            }
                            onCreateGroup={() => this.onCreateGroup()}
                            onCreateUser={() => this.onCreateUser()}
                            show_create_group_button={
                                store.getState().server.type === 'EE'
                            }
                        />
                    </GridItem>
                </Grid>
            </div>
        );
    }
}

Users.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default compose(withTranslation(), withStyles(dashboardStyle))(Users);
