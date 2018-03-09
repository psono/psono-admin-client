import React from 'react';
import { withStyles, Grid } from 'material-ui';
import PropTypes from 'prop-types';

import { UsersCard, ChartCard, ItemGrid } from '../../components';
import { dashboardStyle } from '../../variables/styles';
import psono_server from '../../services/api-server';
import helper from '../../services/helper';

import ChartistGraph from 'react-chartist';

class Users extends React.Component {
    state = {
        users: [],
        sessions: [],
        os_data: [],
        os_labels: [],
        device_data: [],
        device_labels: [],
        browser_data: [],
        browser_labels: [],
        twofa_data: [],
        twofa_labels: []
    };

    onDeleteUsers(user_ids) {
        user_ids.forEach(user_id => {
            psono_server.admin_delete_user(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                user_id
            );
        });

        let { users } = this.state;
        user_ids.forEach(user_id => {
            helper.remove_from_array(users, user_id, function(a, b) {
                return a.id === b;
            });
        });

        this.setState({ users: users });
    }

    update_users(user_ids, is_active) {
        let { users } = this.state;
        user_ids.forEach(user_id => {
            psono_server.admin_update_user(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                user_id,
                is_active
            );

            users.forEach(user => {
                if (user.id === user_id) {
                    user.is_active = is_active ? 'yes' : 'no';
                }
            });
        });

        this.setState({ users: users });
    }

    onActivateUsers(user_ids) {
        return this.update_users(user_ids, true);
    }

    onDeactivateUsers(user_ids) {
        return this.update_users(user_ids, false);
    }

    onDeleteSessions(session_ids) {
        session_ids.forEach(session_id => {
            psono_server.admin_delete_session(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                session_id
            );
        });

        let { sessions } = this.state;
        session_ids.forEach(session_id => {
            helper.remove_from_array(sessions, session_id, function(a, b) {
                return a.id === b;
            });
        });

        this.setState({ sessions: sessions });
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
                    u.is_active = u.is_active ? 'yes' : 'no';
                    u.is_email_active = u.is_email_active ? 'yes' : 'no';

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

                    u.yubikey_2fa = u.yubikey_2fa ? 'yes' : 'no';
                    u.ga_2fa = u.ga_2fa ? 'yes' : 'no';
                    u.duo_2fa = u.duo_2fa ? 'yes' : 'no';
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
                    u.active = u.active ? 'yes' : 'no';

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
                            title="Operation Systems"
                            fontAwesomeStatsIcon="linux"
                            statText={'Distribution by Operation System)'}
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
                            title="Devices"
                            fontAwesomeStatsIcon="tablet"
                            statText={'Distribution by Device'}
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
                            title="Browsers"
                            fontAwesomeStatsIcon="chrome"
                            statText={'Distribution by Browser'}
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
                            title="Two Factor Authentications"
                            fontAwesomeStatsIcon="angellist"
                            statText={
                                'Distribution by Two Factor Authentication'
                            }
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
                            onDeleteSessions={session_ids =>
                                this.onDeleteSessions(session_ids)
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

export default withStyles(dashboardStyle)(Users);
