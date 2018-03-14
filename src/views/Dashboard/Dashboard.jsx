import React from 'react';
import { withStyles, Grid } from 'material-ui';
import { ArrowUpward, ArrowDownward, AccessTime } from 'material-ui-icons';
import PropTypes from 'prop-types';
import axios from 'axios';
// react plugin for creating charts
import ChartistGraph from 'react-chartist';

import {
    Sessions,
    VersionCard,
    LicenseCard,
    HealthcheckCard,
    ChartCard,
    ReleaseCard,
    RegularCard,
    ItemGrid,
    CustomTable
} from '../../components';

import { dailySalesChart } from '../../variables/charts';

import { dashboardStyle } from '../../variables/styles';
import api_static from '../../services/api-static';
import psono_server from '../../services/api-server';
import psono_client from '../../services/api-client';

const Chartist = require('chartist');

class Dashboard extends React.Component {
    state = {
        value: 0,
        admin_client_tags: [],
        admin_client_latest_version: '',
        admin_client_used_version: '',
        client_tags: [],
        client_latest_version: '',
        client_used_version: '',
        server_tags: [],
        server_latest_version: '',
        server_used_version: '',
        server_user_count_active: '',
        server_user_count_total: '',
        server_token_count_device: '',
        server_token_count_user: '',
        server_token_count_total: '',
        server_license_max_users: '',
        server_license_valid_from: '',
        server_license_valid_till: '',
        server_license_stat_link: '',
        server_license_stat_text: '',
        count_registrations_first_week: 0,
        count_registrations_second_week: 0,
        healthcheck: {
            db_read: {},
            db_sync: {},
            time_sync: {}
        },
        tr: true
    };

    handleChange = (event, value) => {
        this.setState({ value });
    };

    handleChangeIndex = index => {
        this.setState({ value: index });
    };

    convert_tags_to_releases(tags) {
        tags.forEach(r => {
            Object.keys(r.commit).forEach(function(key) {
                r[key] = r.commit[key];
            });

            Object.keys(r.release).forEach(function(key) {
                r[key] = r.release[key];
            });
            r.created_at = r.created_at.replace('.000Z', '').replace('T', ' ');
            r.description = r.description.split('\n').map((item, key) => {
                if (item.startsWith('# ') || item.trim() === '') {
                    return null;
                } else {
                    return (
                        <span key={key}>
                            {item}
                            <br />
                        </span>
                    );
                }
            });
            delete r.commit;
            delete r.release;
        });
    }

    componentDidMount() {
        if (this.props.state.server.type === 'CE') {
            api_static
                .get('/gitlab.com/psono/psono-server/changelog.json')
                .then(response => {
                    this.convert_tags_to_releases(response.data);
                    this.setState({
                        server_tags: response.data,
                        server_latest_version: response.data[0].name
                    });
                });
        } else {
            api_static
                .get('/gitlab.com/psono-enterprise/psono-server/changelog.json')
                .then(response => {
                    this.convert_tags_to_releases(response.data);
                    this.setState({
                        server_tags: response.data,
                        server_latest_version: response.data[0].name
                    });
                });
        }
        api_static
            .get('/gitlab.com/psono/psono-client/changelog.json')
            .then(response => {
                this.convert_tags_to_releases(response.data);
                this.setState({
                    client_tags: response.data,
                    client_latest_version: response.data[0].name
                });
            });
        api_static
            .get('/gitlab.com/psono/psono-admin-client/changelog.json')
            .then(response => {
                this.convert_tags_to_releases(response.data);
                this.setState({
                    admin_client_tags: response.data,
                    admin_client_latest_version: response.data[0].name
                });
            });

        psono_server.healthcheck().then(response => {
            this.setState({
                healthcheck: response.data
            });
        });
        psono_server
            .admin_info(
                this.props.state.user.token,
                this.props.state.user.session_secret_key
            )
            .then(response => {
                response.data.info = JSON.parse(response.data.info);

                let label_day = [];
                let data_day_total = [];
                let data_day_new = [];

                let count = response.data.registrations_over_day.length;

                let count_registrations_first_week = 0;
                let count_registrations_second_week = 0;
                response.data.registrations_over_day.forEach(function(r) {
                    count = count - 1;
                    if (count > 13) {
                        return;
                    }
                    if (count > 6) {
                        count_registrations_first_week =
                            count_registrations_first_week + r.count_new;
                    } else {
                        count_registrations_second_week =
                            count_registrations_second_week + r.count_new;
                    }
                    label_day.push(r.weekday);
                    data_day_new.push(r.count_new);
                    data_day_total.push(r.count_total);
                });

                let label_month = [];
                let data_month_new = [];
                let data_month_total = [];
                response.data.registrations_over_month.forEach(function(r) {
                    label_month.push(r.month);
                    data_month_new.push(r.count_new);
                    data_month_total.push(r.count_total);
                });

                let registrations = [];
                response.data.registrations.forEach(function(r) {
                    registrations.push({
                        date: r.date,
                        username: r.username,
                        active: r.active ? 'yes' : 'no'
                    });
                });

                this.setState({
                    server_license_max_users:
                        response.data.info.license_max_users,
                    server_user_count_active: response.data.user_count_active,
                    server_user_count_total: response.data.user_count_total,
                    server_token_count_device: response.data.token_count_device,
                    server_token_count_user: response.data.token_count_user,
                    server_token_count_total: response.data.token_count_total,
                    server_license_valid_from:
                        response.data.info.license_valid_from,
                    server_license_valid_till:
                        response.data.info.license_valid_till,
                    server_used_version:
                        'v' + response.data.info.version.split(' ')[0],
                    count_registrations_first_week,
                    count_registrations_second_week,
                    label_day,
                    data_day_total,
                    data_day_new,
                    label_month,
                    data_month_new,
                    data_month_total,
                    registrations
                });
                psono_client.set_url(response.data.info.web_client);
                return psono_client.get_version().then(response => {
                    this.setState({
                        client_used_version: 'v' + response.data.split(' ')[0]
                    });
                });
            });

        axios.get('/portal/VERSION.txt').then(response => {
            this.setState({
                admin_client_used_version: 'v' + response.data.split(' ')[0]
            });
        });
    }

    render() {
        let registration_text;
        if (this.state.count_registrations_second_week) {
            let percentage = Math.round(
                this.state.count_registrations_second_week /
                    this.state.count_registrations_first_week *
                    100 -
                    100
            );
            if (percentage >= 0) {
                registration_text = (
                    <span>
                        <span className={this.props.classes.successText}>
                            <ArrowUpward
                                className={
                                    this.props.classes.upArrowCardCategory
                                }
                            />{' '}
                            {percentage}%
                        </span>{' '}
                        increase in this weeks registrations.
                    </span>
                );
            } else {
                registration_text = (
                    <span>
                        <span className={this.props.classes.dangerText}>
                            <ArrowDownward
                                className={
                                    this.props.classes.upArrowCardCategory
                                }
                            />{' '}
                            {-percentage}%
                        </span>{' '}
                        decrease in this weeks registrations.
                    </span>
                );
            }
        } else {
            registration_text = (
                <span>
                    <span className={this.props.classes.successText}>
                        <ArrowUpward
                            className={this.props.classes.upArrowCardCategory}
                        />{' '}
                        55%
                    </span>{' '}
                    increase in this weeks registrations.
                </span>
            );
        }

        return (
            <div>
                <Grid container>
                    <ItemGrid xs={12} sm={4} md={4}>
                        <HealthcheckCard
                            title={'DB Accessibility'}
                            sub_title_success={'Is the database reachable?'}
                            sub_title_error={'Database connection broken.'}
                            healthcheck={this.state.healthcheck.db_read.healthy}
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={4} md={4}>
                        <HealthcheckCard
                            title={'DB Synchronized'}
                            sub_title_success={
                                'Are there any pending database migrations?'
                            }
                            sub_title_error={
                                'Pending database migrations detected.'
                            }
                            healthcheck={this.state.healthcheck.db_sync.healthy}
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={4} md={4}>
                        <HealthcheckCard
                            title={'Time Sync'}
                            sub_title_success={'Is the server time correct?'}
                            sub_title_error={'Server time out of sync.'}
                            healthcheck={
                                this.state.healthcheck.time_sync.healthy
                            }
                        />
                    </ItemGrid>
                </Grid>
                <Grid container>
                    <ItemGrid xs={12} sm={12} md={6}>
                        {this.state.data_day_total !== undefined ? (
                            <ChartCard
                                chart={
                                    <ChartistGraph
                                        className="ct-chart"
                                        data={{
                                            labels: this.state.label_day,
                                            series: [
                                                this.state.data_day_total,
                                                this.state.data_day_new
                                            ]
                                        }}
                                        type="Line"
                                        options={{
                                            lineSmooth: Chartist.Interpolation.cardinal(
                                                {
                                                    tension: 0
                                                }
                                            ),
                                            low: 0,
                                            high:
                                                Math.max(
                                                    ...this.state
                                                        .data_day_total,
                                                    ...this.state.data_day_new
                                                ) * 1.05,
                                            chartPadding: {
                                                top: 0,
                                                right: 0,
                                                bottom: 10,
                                                left: 10
                                            },
                                            plugins: [
                                                Chartist.plugins.ctAxisTitle({
                                                    axisX: {
                                                        axisTitle:
                                                            'Weekday (red: new users, white: total users)',
                                                        axisClass: 'ct-label',
                                                        offset: {
                                                            x: 0,
                                                            y: 35
                                                        },
                                                        textAnchor: 'middle'
                                                    },
                                                    axisY: {
                                                        axisTitle: 'Users',
                                                        axisClass: 'ct-label',
                                                        offset: {
                                                            x: 10,
                                                            y: -10
                                                        },
                                                        flipTitle: false
                                                    }
                                                })
                                            ]
                                        }}
                                        listener={dailySalesChart.animation}
                                    />
                                }
                                chartColor="blue"
                                title="Registrations per day"
                                text={registration_text}
                                statIcon={AccessTime}
                                statText={
                                    'This week ' +
                                    this.state.count_registrations_second_week +
                                    ' users registered (last week: ' +
                                    this.state.count_registrations_first_week +
                                    ' users)'
                                }
                            />
                        ) : null}
                    </ItemGrid>
                    <ItemGrid xs={12} sm={12} md={6}>
                        {this.state.data_month_total !== undefined ? (
                            <ChartCard
                                chart={
                                    <ChartistGraph
                                        className="ct-chart"
                                        data={{
                                            labels: this.state.label_month,
                                            series: [
                                                this.state.data_month_total,
                                                this.state.data_month_new
                                            ]
                                        }}
                                        type="Line"
                                        options={{
                                            lineSmooth: Chartist.Interpolation.cardinal(
                                                {
                                                    tension: 0
                                                }
                                            ),
                                            low: 0,
                                            high:
                                                Math.max(
                                                    ...this.state
                                                        .data_month_total,
                                                    ...this.state.data_month_new
                                                ) * 1.05,
                                            chartPadding: {
                                                top: 0,
                                                right: 0,
                                                bottom: 10,
                                                left: 10
                                            },
                                            plugins: [
                                                Chartist.plugins.ctAxisTitle({
                                                    axisX: {
                                                        axisTitle:
                                                            'Month (red: new users, white: total users)',
                                                        axisClass: 'ct-label',
                                                        offset: {
                                                            x: 0,
                                                            y: 35
                                                        },
                                                        textAnchor: 'middle'
                                                    },
                                                    axisY: {
                                                        axisTitle: 'Users',
                                                        axisClass: 'ct-label',
                                                        offset: {
                                                            x: 10,
                                                            y: -10
                                                        },
                                                        flipTitle: false
                                                    }
                                                })
                                            ]
                                        }}
                                        listener={dailySalesChart.animation}
                                    />
                                }
                                chartColor="green"
                                title="Users per month"
                                text="Registered users over time"
                                statIcon={AccessTime}
                                statText="Last registration: "
                            />
                        ) : null}
                    </ItemGrid>
                </Grid>
                <Grid container>
                    <ItemGrid xs={12} sm={6} md={6} lg={3}>
                        <LicenseCard
                            active={this.state.server_user_count_active}
                            total={this.state.server_user_count_total}
                            licensed={this.state.server_license_max_users}
                            valid_from={this.state.server_license_valid_from}
                            valid_till={this.state.server_license_valid_till}
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={6} md={6} lg={3}>
                        <Sessions
                            users={this.state.server_token_count_user}
                            devices={this.state.server_token_count_device}
                            total={this.state.server_token_count_total}
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={6} md={4} lg={2}>
                        <VersionCard
                            used_version={this.state.client_used_version}
                            latest_version={this.state.client_latest_version}
                            title="Client Version"
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={6} md={4} lg={2}>
                        <VersionCard
                            used_version={this.state.server_used_version}
                            latest_version={this.state.server_latest_version}
                            title="Server Version"
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={6} md={4} lg={2}>
                        <VersionCard
                            used_version={this.state.admin_client_used_version}
                            latest_version={
                                this.state.admin_client_latest_version
                            }
                            title="Portal Version"
                        />
                    </ItemGrid>
                </Grid>
                <Grid container>
                    <ItemGrid xs={12} sm={12} md={6}>
                        <ReleaseCard
                            server_releases={this.state.server_tags}
                            client_releases={this.state.client_tags}
                            admin_client_releases={this.state.admin_client_tags}
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={12} md={6}>
                        {this.state.registrations !== undefined ? (
                            <RegularCard
                                headerColor="orange"
                                cardTitle="Registrations"
                                cardSubtitle="Last 10 new users joining."
                                content={
                                    <CustomTable
                                        head={[
                                            { id: 'date', label: 'Date' },
                                            {
                                                id: 'username',
                                                label: 'Username'
                                            },
                                            { id: 'active', label: 'Active' }
                                        ]}
                                        data={this.state.registrations}
                                    />
                                }
                            />
                        ) : null}
                    </ItemGrid>
                </Grid>
            </div>
        );
    }
}

Dashboard.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(dashboardStyle)(Dashboard);
