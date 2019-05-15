import React from 'react';
import { withStyles, Grid } from 'material-ui';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { UsersCard, ChartCard, ItemGrid } from '../../components';
import { dashboardStyle } from '../../variables/styles';
import psono_server from '../../services/api-server';
import helper from '../../services/helper';

import ChartistGraph from 'react-chartist';

class Users extends React.Component {
    state = {
        redirect_to: '',
        users: [],
        sessions: [],
        groups: [],
        os_data: [],
        os_labels: [],
        device_data: [],
        device_labels: [],
        browser_data: [],
        browser_labels: [],
        twofa_data: [],
        twofa_labels: []
    };

    onDeleteUsers(selected_users) {
        selected_users.forEach(user => {
            psono_server.admin_delete_user(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                user.id
            );
        });

        let { users } = this.state;
        selected_users.forEach(user => {
            helper.remove_from_array(users, user, function(a, b) {
                return a.id === b.id;
            });
        });

        this.setState({ users: users });
    }

    update_users(selected_users, is_active) {
        const { t } = this.props;
        let { users } = this.state;
        selected_users.forEach(user => {
            psono_server.admin_update_user(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                user.id,
                is_active
            );

            users.forEach(u => {
                if (u.id === user.id) {
                    u.is_active = is_active ? t('YES') : t('NO');
                }
            });
        });

        this.setState({ users: users });
    }

    onActivateUsers(selected_users) {
        return this.update_users(selected_users, true);
    }

    onDeactivateUsers(selected_users) {
        return this.update_users(selected_users, false);
    }

    onEditUser(selected_users) {
        this.setState({
            redirect_to: '/user/' + selected_users[0].id
        });
    }

    onEditGroup(selected_groups) {
        this.setState({
            redirect_to: '/group/' + selected_groups[0].id
        });
    }

    onDeleteSessions(selected_sessions) {
        selected_sessions.forEach(session => {
            psono_server.admin_delete_session(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                session.id
            );
        });

        let { sessions } = this.state;
        selected_sessions.forEach(session => {
            helper.remove_from_array(sessions, session, function(a, b) {
                return a.id === b.id;
            });
        });

        this.setState({ sessions: sessions });
    }

    onDeleteGroups(selected_groups) {
        selected_groups.forEach(group => {
            psono_server.admin_delete_group(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                group.id
            );
        });

        let { groups } = this.state;
        selected_groups.forEach(group => {
            helper.remove_from_array(groups, group, function(a, b) {
                return a.id === b.id;
            });
        });

        this.setState({ groups: groups });
    }

    onCreateGroup() {
        this.setState({
            redirect_to: '/groups/create/'
        });
    }

    analyze(data, storage, labels) {
        let found = false;
        labels.some((bl, index) => {
            if (data.includes(bl)) {
                storage[index] = storage[index] + 1;
                found = true;
                return true;
            }
            return false;
        });
        if (!found) {
            storage[0] = storage[0] + 1;
        }
    }

    cleanup(storage, labels) {
        for (let i = storage.length; i--; i > -1) {
            if (storage[i] !== 0) {
                continue;
            }
            labels.splice(i, 1);
            storage.splice(i, 1);
        }
    }
    merge(mergers, new_title, storage, labels) {
        let new_value = 0;
        for (let i = labels.length; i--; i > -1) {
            if (mergers.indexOf(labels[i]) === -1) {
                continue;
            }
            new_value = new_value + storage[i];

            labels.splice(i, 1);
            storage.splice(i, 1);
        }
        storage.push(new_value);
        labels.push(new_title);
    }

    componentDidMount() {
        const { t } = this.props;
        psono_server
            .admin_user(
                this.props.state.user.token,
                this.props.state.user.session_secret_key
            )
            .then(response => {
                const { users } = response.data;

                let twofa_data = [0, 0, 0, 0];
                let twofa_labels = [
                    'None',
                    'Yubikey',
                    'Google Authenticator',
                    'Duo'
                ];

                users.forEach(u => {
                    u.is_active = u.is_active ? t('YES') : t('NO');
                    u.is_email_active = u.is_email_active ? t('YES') : t('NO');

                    if (!u.yubikey_2fa && !u.ga_2fa && !u.duo_2fa) {
                        twofa_data[0] = twofa_data[0] + 1;
                    }
                    if (u.yubikey_2fa) {
                        twofa_data[1] = twofa_data[1] + 1;
                    }
                    if (u.ga_2fa) {
                        twofa_data[2] = twofa_data[2] + 1;
                    }
                    if (u.duo_2fa) {
                        twofa_data[3] = twofa_data[3] + 1;
                    }

                    u.yubikey_2fa = u.yubikey_2fa ? t('YES') : t('NO');
                    u.ga_2fa = u.ga_2fa ? t('YES') : t('NO');
                    u.duo_2fa = u.duo_2fa ? t('YES') : t('NO');
                });
                this.cleanup(twofa_data, twofa_labels);

                this.setState({
                    users,
                    twofa_data,
                    twofa_labels
                });
            });
        psono_server
            .admin_session(
                this.props.state.user.token,
                this.props.state.user.session_secret_key
            )
            .then(response => {
                const { sessions } = response.data;

                let os_data = [0, 0, 0, 0, 0, 0];
                let os_labels = [
                    'Other',
                    'Linux',
                    'Windows',
                    'Mac OS',
                    'Android',
                    'iOS'
                ];
                let browser_data = [0, 0, 0, 0, 0];
                let browser_labels = [
                    'Other',
                    'Firefox',
                    'Chrome',
                    'Safari',
                    'Vivaldi'
                ];
                let device_data = [0, 0, 0, 0, 0, 0];
                let device_labels = [
                    'Other',
                    'Android',
                    'iPhone',
                    'Linux',
                    'Mac',
                    'Windows'
                ];

                sessions.forEach(u => {
                    u.active = u.active ? t('YES') : t('NO');

                    this.analyze(u.device_description, os_data, os_labels);
                    this.analyze(
                        u.device_description,
                        browser_data,
                        browser_labels
                    );
                    this.analyze(
                        u.device_description,
                        device_data,
                        device_labels
                    );
                });

                this.cleanup(os_data, os_labels);
                this.cleanup(browser_data, browser_labels);
                //merge device data
                this.merge(
                    ['Android', 'iPhone'],
                    'Mobile',
                    device_data,
                    device_labels
                );
                this.merge(
                    ['Linux', 'Windows'],
                    'PC',
                    device_data,
                    device_labels
                );
                this.cleanup(device_data, device_labels);

                this.setState({
                    sessions,
                    browser_data,
                    browser_labels,
                    os_data,
                    os_labels,
                    device_data,
                    device_labels
                });
            });
        psono_server
            .admin_group(
                this.props.state.user.token,
                this.props.state.user.session_secret_key
            )
            .then(response => {
                const { groups } = response.data;
                this.setState({
                    groups
                });
            });
    }

    render() {
        const { t } = this.props;
        if (this.state.redirect_to) {
            return <Redirect to={this.state.redirect_to} />;
        }
        return (
            <div>
                <Grid container>
                    <ItemGrid xs={12} sm={6} md={6} lg={3}>
                        <ChartCard
                            chart={
                                <ChartistGraph
                                    className="ct-chart"
                                    data={{
                                        labels: this.state.os_labels,
                                        series: this.state.os_data
                                    }}
                                    type="Pie"
                                    options={{
                                        labelInterpolationFnc: function(value) {
                                            return value[0];
                                        }
                                    }}
                                    responsiveOptions={[
                                        [
                                            'screen and (min-width: 640px)',
                                            {
                                                chartPadding: 20,
                                                labelOffset: 40,
                                                labelDirection: 'explode',
                                                labelInterpolationFnc: function(
                                                    value
                                                ) {
                                                    return value;
                                                }
                                            }
                                        ],
                                        [
                                            'screen and (min-width: 1024px)',
                                            {
                                                labelOffset: 40,
                                                chartPadding: 20
                                            }
                                        ]
                                    ]}
                                />
                            }
                            chartColor="green"
                            title={t('OPERATION_SYSTEMS')}
                            fontAwesomeStatsIcon="linux"
                            statText={t('DISTRIBUTION_BY_OPERATION_SYSTEM')}
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={6} md={6} lg={3}>
                        <ChartCard
                            chart={
                                <ChartistGraph
                                    className="ct-chart"
                                    data={{
                                        labels: this.state.device_labels,
                                        series: this.state.device_data
                                    }}
                                    type="Pie"
                                    options={{
                                        labelInterpolationFnc: function(value) {
                                            return value[0];
                                        }
                                    }}
                                    responsiveOptions={[
                                        [
                                            'screen and (min-width: 640px)',
                                            {
                                                chartPadding: 20,
                                                labelOffset: 40,
                                                labelDirection: 'explode',
                                                labelInterpolationFnc: function(
                                                    value
                                                ) {
                                                    return value;
                                                }
                                            }
                                        ],
                                        [
                                            'screen and (min-width: 1024px)',
                                            {
                                                labelOffset: 40,
                                                chartPadding: 20
                                            }
                                        ]
                                    ]}
                                />
                            }
                            chartColor="blue"
                            title={t('DEVICES')}
                            fontAwesomeStatsIcon="tablet"
                            statText={t('DISTRIBUTION_BY_DEVICE')}
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={6} md={6} lg={3}>
                        <ChartCard
                            chart={
                                <ChartistGraph
                                    className="ct-chart"
                                    data={{
                                        labels: this.state.browser_labels,
                                        series: this.state.browser_data
                                    }}
                                    type="Pie"
                                    options={{
                                        labelInterpolationFnc: function(value) {
                                            return value[0];
                                        }
                                    }}
                                    responsiveOptions={[
                                        [
                                            'screen and (min-width: 640px)',
                                            {
                                                chartPadding: 20,
                                                labelOffset: 40,
                                                labelDirection: 'explode',
                                                labelInterpolationFnc: function(
                                                    value
                                                ) {
                                                    return value;
                                                }
                                            }
                                        ],
                                        [
                                            'screen and (min-width: 1024px)',
                                            {
                                                labelOffset: 40,
                                                chartPadding: 20
                                            }
                                        ]
                                    ]}
                                />
                            }
                            chartColor="purple"
                            title={t('BROWSER')}
                            fontAwesomeStatsIcon="chrome"
                            statText={t('DISTRIBUTION_BY_BROWSER')}
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={6} md={6} lg={3}>
                        <ChartCard
                            chart={
                                <ChartistGraph
                                    className="ct-chart"
                                    data={{
                                        labels: this.state.twofa_labels,
                                        series: this.state.twofa_data
                                    }}
                                    type="Pie"
                                    options={{
                                        labelInterpolationFnc: function(value) {
                                            return value[0];
                                        }
                                    }}
                                    responsiveOptions={[
                                        [
                                            'screen and (min-width: 640px)',
                                            {
                                                chartPadding: 20,
                                                labelOffset: 40,
                                                labelDirection: 'explode',
                                                labelInterpolationFnc: function(
                                                    value
                                                ) {
                                                    return value;
                                                }
                                            }
                                        ],
                                        [
                                            'screen and (min-width: 1024px)',
                                            {
                                                labelOffset: 40,
                                                chartPadding: 20
                                            }
                                        ]
                                    ]}
                                />
                            }
                            chartColor="blue"
                            title={t('TWO_FACTOR')}
                            fontAwesomeStatsIcon="angellist"
                            statText={t('DISTRIBUTION_BY_TWO_FACTOR')}
                        />
                    </ItemGrid>
                </Grid>
                <Grid container>
                    <ItemGrid xs={12} sm={12} md={12}>
                        <UsersCard
                            users={this.state.users}
                            sessions={this.state.sessions}
                            groups={this.state.groups}
                            onDeleteUsers={user_ids =>
                                this.onDeleteUsers(user_ids)
                            }
                            onActivate={user_ids =>
                                this.onActivateUsers(user_ids)
                            }
                            onDeactivate={user_ids =>
                                this.onDeactivateUsers(user_ids)
                            }
                            onEditUser={user_ids => this.onEditUser(user_ids)}
                            onEditGroup={group_ids =>
                                this.onEditGroup(group_ids)
                            }
                            onDeleteSessions={selected_sessions =>
                                this.onDeleteSessions(selected_sessions)
                            }
                            onDeleteGroups={selected_groups =>
                                this.onDeleteGroups(selected_groups)
                            }
                            onCreateGroup={() => this.onCreateGroup()}
                            show_create_group_button={
                                this.props.state.server.type === 'EE'
                            }
                        />
                    </ItemGrid>
                </Grid>
            </div>
        );
    }
}

Users.propTypes = {
    classes: PropTypes.object.isRequired
};

export default compose(withTranslation(), withStyles(dashboardStyle))(Users);
