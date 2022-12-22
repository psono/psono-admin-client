import React from 'react';
import { withStyles, Grid } from '@material-ui/core';
import { withTranslation, Trans } from 'react-i18next';
import { compose } from 'redux';
import moment from 'moment';
import { ArrowUpward, ArrowDownward, AccessTime } from '@material-ui/icons';
import PropTypes from 'prop-types';
import axios from 'axios';
// react plugin for creating charts
import ChartistGraph from 'react-chartist';

import { Sessions } from '../../components';
import { VersionCard } from '../../components';
import { LicenseCard } from '../../components';
import { HealthcheckCard } from '../../components';
import { ChartCard } from '../../components';
import { ReleaseCard } from '../../components';
import { FileserverCard } from '../../components';
import { GridItem } from '../../components';
import { CustomMaterialTable } from '../../components';
import Card from '../../components/Card/Card.js';
import CardHeader from '../../components/Card/CardHeader.js';
import CardBody from '../../components/Card/CardBody.js';

import { dailySalesChart } from '../../variables/charts';

import dashboardStyle from '../../assets/jss/material-dashboard-react/dashboardStyle';
import api_static from '../../services/api-static';
import psono_server from '../../services/api-server';
import psono_client from '../../services/api-client';

const Chartist = require('chartist');

class Dashboard extends React.Component {
    state = {
        admin_client_tags: [],
        admin_client_latest_version: '',
        admin_client_used_version: '',
        client_tags: [],
        client_latest_version: '',
        client_used_version: '',
        fileserver: [],
        fileserver_latest_version: '',
        fileserver_tags: [],
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
            time_sync: {},
        },
        tr: true,
    };

    convert_tags_to_releases(tags) {
        tags.forEach((r) => {
            Object.keys(r.commit).forEach(function (key) {
                r[key] = r.commit[key];
            });

            Object.keys(r.release).forEach(function (key) {
                r[key] = r.release[key];
            });
            r.created_at = moment(r.created_at).format('YYYY-MM-DD HH:mm:ss');
            // r.description = r.description.split('\n').map((item, key) => {
            //     if (item.startsWith('# ') || item.trim() === '') {
            //         return null;
            //     } else {
            //         return (
            //             <span key={key}>
            //                 {item}
            //                 <br />
            //             </span>
            //         );
            //     }
            // });
            delete r.commit;
            delete r.release;
        });
    }

    componentDidMount() {
        const { t } = this.props;
        if (this.props.state.server.type === 'CE') {
            api_static
                .get('/gitlab.com/psono/psono-server/changelog.json')
                .then((response) => {
                    this.convert_tags_to_releases(response.data);
                    this.setState({
                        server_tags: response.data,
                        server_latest_version: response.data[0].name,
                    });
                });
        } else {
            api_static
                .get('/gitlab.com/psono-enterprise/psono-server/changelog.json')
                .then((response) => {
                    this.convert_tags_to_releases(response.data);
                    this.setState({
                        server_tags: response.data,
                        server_latest_version: response.data[0].name,
                    });
                });
        }
        api_static
            .get('/gitlab.com/psono/psono-client/changelog.json')
            .then((response) => {
                this.convert_tags_to_releases(response.data);
                this.setState({
                    client_tags: response.data,
                    client_latest_version: response.data[0].name,
                });
            });
        api_static
            .get('/gitlab.com/psono/psono-admin-client/changelog.json')
            .then((response) => {
                this.convert_tags_to_releases(response.data);
                this.setState({
                    admin_client_tags: response.data,
                    admin_client_latest_version: response.data[0].name,
                });
            });
        api_static
            .get('/gitlab.com/psono/psono-fileserver/changelog.json')
            .then((response) => {
                this.convert_tags_to_releases(response.data);
                this.setState({
                    fileserver_tags: response.data,
                    fileserver_latest_version: response.data[0].name,
                });
            });

        psono_server.healthcheck().then(
            (response) => {
                //healthy is reported as 200
                this.setState({
                    healthcheck: response.data,
                });
            },
            (response) => {
                //error occured, could mean unhealthy...
                if (response.status === 400) {
                    //unhealthy is reported as 400
                    this.setState({
                        healthcheck: response.data,
                    });
                }
            }
        );
        psono_server
            .admin_info(
                this.props.state.user.token,
                this.props.state.user.session_secret_key
            )
            .then((response) => {
                response.data.info = JSON.parse(response.data.info);

                let label_day = [];
                let data_day_total = [];
                let data_day_new = [];

                let count = response.data.registrations_over_day.length;

                let count_registrations_first_week = 0;
                let count_registrations_second_week = 0;
                response.data.registrations_over_day.forEach(function (r) {
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
                response.data.registrations_over_month.forEach(function (r) {
                    label_month.push(r.month);
                    data_month_new.push(r.count_new);
                    data_month_total.push(r.count_total);
                });

                let registrations = [];
                response.data.registrations.forEach(function (r) {
                    registrations.push({
                        date: moment(r.date).format('YYYY-MM-DD HH:mm:ss'),
                        username: r.username,
                        active: r.active ? t('YES') : t('NO'),
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
                    fileserver: response.data.fileserver,
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
                    registrations,
                });
                psono_client.set_url(response.data.info.web_client);
                return psono_client.get_version().then((response) => {
                    this.setState({
                        client_used_version: 'v' + response.data.split(' ')[0],
                    });
                });
            });

        axios
            .get('/portal/VERSION.txt?t=' + new Date().getTime())
            .then((response) => {
                this.setState({
                    admin_client_used_version:
                        'v' + response.data.split(' ')[0],
                });
            });
    }

    render() {
        const { t } = this.props;
        const {
            count_registrations_second_week,
            count_registrations_first_week,
        } = this.state;
        const { files } = this.props.state.server;
        let registration_text;
        if (this.state.count_registrations_second_week) {
            let percentage = Math.round(
                (this.state.count_registrations_second_week /
                    this.state.count_registrations_first_week) *
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
                        {t('INCREASE_IN_THIS_WEEKS_REGISTRAITIONS')}
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
                        {t('DECREASE_IN_THIS_WEEKS_REGISTRAITIONS')}
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
                    {t('INCREASE_IN_THIS_WEEKS_REGISTRAITIONS')}
                </span>
            );
        }

        return (
            <div>
                <Grid container>
                    <GridItem xs={12} sm={4} md={4}>
                        <HealthcheckCard
                            title={t('DB_ACCESSIBILITY')}
                            sub_title_success={t('IS_DB_REACHABLE')}
                            sub_title_error={t('DB_CONNECTION_BROKEN')}
                            healthcheck={this.state.healthcheck.db_read.healthy}
                        />
                    </GridItem>
                    <GridItem xs={12} sm={4} md={4}>
                        <HealthcheckCard
                            title={t('DB_SYNCHRONIZED')}
                            sub_title_success={t(
                                'ARE_DATABASE_MIGRATIONS_PENDING'
                            )}
                            sub_title_error={t(
                                'PENDING_DATABASE_MIGRATIONS_DETECTED'
                            )}
                            healthcheck={this.state.healthcheck.db_sync.healthy}
                        />
                    </GridItem>
                    <GridItem xs={12} sm={4} md={4}>
                        <HealthcheckCard
                            title={t('TIME_SYNC')}
                            sub_title_success={t('IS_SERVER_TIME_CORRECT')}
                            sub_title_error={t('SERVER_TIME_OUT_OF_SYNC')}
                            healthcheck={
                                this.state.healthcheck.time_sync.healthy
                            }
                        />
                    </GridItem>
                </Grid>
                <Grid container>
                    <GridItem xs={12} sm={12} md={6}>
                        {this.state.data_day_total !== undefined ? (
                            <ChartCard
                                chart={
                                    <ChartistGraph
                                        className="ct-chart"
                                        data={{
                                            labels: this.state.label_day,
                                            series: [
                                                this.state.data_day_total,
                                                this.state.data_day_new,
                                            ],
                                        }}
                                        type="Line"
                                        options={{
                                            lineSmooth:
                                                Chartist.Interpolation.cardinal(
                                                    {
                                                        tension: 0,
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
                                                left: 10,
                                            },
                                            plugins: [
                                                Chartist.plugins.ctAxisTitle({
                                                    axisX: {
                                                        axisTitle: t(
                                                            'WEEKDAY_RED_NEW_USERS_WHITE_TOTAL_USERS'
                                                        ),
                                                        axisClass: 'ct-label',
                                                        offset: {
                                                            x: 0,
                                                            y: 35,
                                                        },
                                                        textAnchor: 'middle',
                                                    },
                                                    axisY: {
                                                        axisTitle: t('USERS'),
                                                        axisClass: 'ct-label',
                                                        offset: {
                                                            x: 10,
                                                            y: -10,
                                                        },
                                                        flipTitle: false,
                                                    },
                                                }),
                                            ],
                                        }}
                                        listener={dailySalesChart.animation}
                                    />
                                }
                                chartColor="blue"
                                title={t('REGISTRATIONS_PER_DAY')}
                                text={registration_text}
                                statIcon={AccessTime}
                                statText={
                                    <Trans
                                        i18nKey="THIS_WEEK_USERS_VS_LAST_WEEK_USERS"
                                        count_registrations_second_week={
                                            count_registrations_second_week
                                        }
                                        count_registrations_first_week={
                                            count_registrations_first_week
                                        }
                                    >
                                        This week{' '}
                                        {{ count_registrations_second_week }}{' '}
                                        users registered (last week:{' '}
                                        {{ count_registrations_first_week }}{' '}
                                        users)
                                    </Trans>
                                }
                            />
                        ) : null}
                    </GridItem>
                    <GridItem xs={12} sm={12} md={6}>
                        {this.state.data_month_total !== undefined ? (
                            <ChartCard
                                chart={
                                    <ChartistGraph
                                        className="ct-chart"
                                        data={{
                                            labels: this.state.label_month,
                                            series: [
                                                this.state.data_month_total,
                                                this.state.data_month_new,
                                            ],
                                        }}
                                        type="Line"
                                        options={{
                                            lineSmooth:
                                                Chartist.Interpolation.cardinal(
                                                    {
                                                        tension: 0,
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
                                                left: 10,
                                            },
                                            plugins: [
                                                Chartist.plugins.ctAxisTitle({
                                                    axisX: {
                                                        axisTitle: t(
                                                            'MONTH_RED_NEW_USERS_WHITE_TOTAL_USERS'
                                                        ),
                                                        axisClass: 'ct-label',
                                                        offset: {
                                                            x: 0,
                                                            y: 35,
                                                        },
                                                        textAnchor: 'middle',
                                                    },
                                                    axisY: {
                                                        axisTitle: t('USERS'),
                                                        axisClass: 'ct-label',
                                                        offset: {
                                                            x: 10,
                                                            y: -10,
                                                        },
                                                        flipTitle: false,
                                                    },
                                                }),
                                            ],
                                        }}
                                        listener={dailySalesChart.animation}
                                    />
                                }
                                chartColor="green"
                                title={t('USERS_PER_MONTH')}
                                text={t('REGISTERED_USERS_OVER_TIME')}
                                statIcon={AccessTime}
                                statText={t('LAST_REGISRATION')}
                            />
                        ) : null}
                    </GridItem>
                </Grid>
                <Grid container>
                    <GridItem xs={12} sm={6} md={6} lg={3}>
                        <LicenseCard
                            active={this.state.server_user_count_active}
                            total={this.state.server_user_count_total}
                            licensed={this.state.server_license_max_users}
                            valid_from={this.state.server_license_valid_from}
                            valid_till={this.state.server_license_valid_till}
                        />
                    </GridItem>
                    <GridItem xs={12} sm={6} md={6} lg={3}>
                        <Sessions
                            users={this.state.server_token_count_user}
                            devices={this.state.server_token_count_device}
                            total={this.state.server_token_count_total}
                        />
                    </GridItem>
                    <GridItem xs={12} sm={6} md={4} lg={2}>
                        <VersionCard
                            used_version={this.state.client_used_version}
                            latest_version={this.state.client_latest_version}
                            title={t('CLIENT_VERSION')}
                        />
                    </GridItem>
                    <GridItem xs={12} sm={6} md={4} lg={2}>
                        <VersionCard
                            used_version={this.state.server_used_version}
                            latest_version={this.state.server_latest_version}
                            title={t('SERVER_VERSION')}
                        />
                    </GridItem>
                    <GridItem xs={12} sm={6} md={4} lg={2}>
                        <VersionCard
                            used_version={this.state.admin_client_used_version}
                            latest_version={
                                this.state.admin_client_latest_version
                            }
                            title={t('PORTAL_VERSION')}
                        />
                    </GridItem>
                </Grid>
                <Grid container>
                    <GridItem xs={12} sm={12} md={6}>
                        {files && (
                            <FileserverCard
                                fileserver={this.state.fileserver}
                                latest_version={
                                    this.state.fileserver_latest_version
                                }
                            />
                        )}
                        <ReleaseCard
                            server_releases={this.state.server_tags}
                            client_releases={this.state.client_tags}
                            admin_client_releases={this.state.admin_client_tags}
                            fileserver_releases={this.state.fileserver_tags}
                        />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={6}>
                        {this.state.registrations !== undefined ? (
                            <Card>
                                <CardHeader color="warning">
                                    <h4
                                        className={
                                            this.props.classes.cardTitleWhite
                                        }
                                    >
                                        {t('REGISTRATIONS')}
                                    </h4>
                                    <p
                                        className={
                                            this.props.classes.cardCategoryWhite
                                        }
                                    >
                                        {t('LAST_JOINED_USERS')}
                                    </p>
                                </CardHeader>
                                <CardBody>
                                    <CustomMaterialTable
                                        columns={[
                                            { field: 'date', title: t('DATE') },
                                            {
                                                field: 'username',
                                                title: t('USERNAME'),
                                            },
                                            {
                                                field: 'active',
                                                title: t('ACTIVE'),
                                            },
                                        ]}
                                        data={this.state.registrations}
                                        title={''}
                                    />
                                </CardBody>
                            </Card>
                        ) : null}
                    </GridItem>
                </Grid>
            </div>
        );
    }
}

Dashboard.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default compose(
    withTranslation(),
    withStyles(dashboardStyle)
)(Dashboard);
