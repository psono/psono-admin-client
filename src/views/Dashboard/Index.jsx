import React, { useState, useEffect } from 'react';
import { withStyles, Grid } from '@material-ui/core';
import { useTranslation, Trans } from 'react-i18next';
import moment from 'moment';
import { ArrowUpward, ArrowDownward, AccessTime } from '@material-ui/icons';
import PropTypes from 'prop-types';
import ChartistGraph from 'react-chartist';

import {
    Sessions,
    VersionCard,
    LicenseCard,
    ChartCard,
    ReleaseCard,
    FileserverCard,
    GridItem,
    CustomMaterialTable,
} from '../../components';
import Card from '../../components/Card/Card.js';
import CardHeader from '../../components/Card/CardHeader.js';
import CardBody from '../../components/Card/CardBody.js';

import { dailySalesChart } from '../../variables/charts';
import dashboardStyle from '../../assets/jss/material-dashboard-react/dashboardStyle';
import api_static from '../../services/api-static';
import psono_server from '../../services/api-server';
import psono_client from '../../services/api-client';
import HealthCheck from './HealthCheck';
import store from '../../services/store';

const Chartist = require('chartist');

const Dashboard = ({ classes, state }) => {
    const { t } = useTranslation();
    const [dashboardData, setDashboardData] = useState({
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
        label_day: [],
        data_day_total: [],
        data_day_new: [],
        label_month: [],
        data_month_total: [],
        data_month_new: [],
        registrations: [],
    });

    const convertTagsToReleases = (tags) => {
        tags.forEach((r) => {
            Object.keys(r.commit).forEach((key) => {
                r[key] = r.commit[key];
            });
            Object.keys(r.release).forEach((key) => {
                r[key] = r.release[key];
            });
            r.created_at = moment(r.created_at).format('YYYY-MM-DD HH:mm:ss');
            delete r.commit;
            delete r.release;
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            const serverType = state.server.type;

            const serverChangelogUrl =
                serverType === 'CE'
                    ? '/gitlab.com/psono/psono-server/changelog.json'
                    : '/gitlab.com/psono-enterprise/psono-server/changelog.json';

            const [
                serverResponse,
                clientResponse,
                adminClientResponse,
                fileServerResponse,
            ] = await Promise.all([
                api_static.get(serverChangelogUrl),
                api_static.get('/gitlab.com/psono/psono-client/changelog.json'),
                api_static.get(
                    '/gitlab.com/psono/psono-admin-client/changelog.json'
                ),
                api_static.get(
                    '/gitlab.com/psono/psono-fileserver/changelog.json'
                ),
            ]);

            convertTagsToReleases(serverResponse);
            convertTagsToReleases(clientResponse);
            convertTagsToReleases(adminClientResponse);
            convertTagsToReleases(fileServerResponse);

            setDashboardData((prevData) => ({
                ...prevData,
                server_tags: serverResponse,
                server_latest_version: serverResponse[0].name,
                client_tags: clientResponse,
                client_latest_version: clientResponse[0].name,
                admin_client_tags: adminClientResponse,
                admin_client_latest_version: adminClientResponse[0].name,
                fileserver_tags: fileServerResponse,
                fileserver_latest_version: fileServerResponse[0].name,
            }));

            const serverInfoResponse = await psono_server.admin_info(
                store.getState().user.token,
                store.getState().user.session_secret_key
            );

            const info = JSON.parse(serverInfoResponse.data.info);

            let label_day = [];
            let data_day_total = [];
            let data_day_new = [];
            let count = serverInfoResponse.data.registrations_over_day.length;
            let count_registrations_first_week = 0;
            let count_registrations_second_week = 0;

            serverInfoResponse.data.registrations_over_day.forEach((r) => {
                count -= 1;
                if (count > 13) return;
                if (count > 6) {
                    count_registrations_first_week += r.count_new;
                } else {
                    count_registrations_second_week += r.count_new;
                }
                label_day.push(r.weekday);
                data_day_new.push(r.count_new);
                data_day_total.push(r.count_total);
            });

            let label_month = [];
            let data_month_new = [];
            let data_month_total = [];
            serverInfoResponse.data.registrations_over_month.forEach((r) => {
                label_month.push(r.month);
                data_month_new.push(r.count_new);
                data_month_total.push(r.count_total);
            });

            let registrations = serverInfoResponse.data.registrations.map(
                (r) => ({
                    date: moment(r.date).format('YYYY-MM-DD HH:mm:ss'),
                    username: r.username,
                    active: r.active ? t('YES') : t('NO'),
                })
            );

            setDashboardData((prevData) => ({
                ...prevData,
                server_license_max_users: info.license_max_users,
                server_user_count_active:
                    serverInfoResponse.data.user_count_active,
                server_user_count_total:
                    serverInfoResponse.data.user_count_total,
                server_token_count_device:
                    serverInfoResponse.data.token_count_device,
                server_token_count_user:
                    serverInfoResponse.data.token_count_user,
                server_token_count_total:
                    serverInfoResponse.data.token_count_total,
                fileserver: serverInfoResponse.data.fileserver,
                server_license_valid_from: info.license_valid_from,
                server_license_valid_till: info.license_valid_till,
                server_used_version: 'v' + info.version.split(' ')[0],
                count_registrations_first_week,
                count_registrations_second_week,
                label_day,
                data_day_total,
                data_day_new,
                label_month,
                data_month_new,
                data_month_total,
                registrations,
            }));

            const clientVersionResponse = await psono_client.getVersion();
            setDashboardData((prevData) => ({
                ...prevData,
                client_used_version: 'v' + clientVersionResponse.split(' ')[0],
            }));

            const adminClientVersionRequest = await fetch(
                '/portal/VERSION.txt?t=' + new Date().getTime()
            );
            const adminClientVersionResponse =
                await adminClientVersionRequest.text();
            setDashboardData((prevData) => ({
                ...prevData,
                admin_client_used_version:
                    'v' + adminClientVersionResponse.split(' ')[0],
            }));
        };

        fetchData();
    }, [state.server.type, t]);

    const {
        count_registrations_second_week,
        count_registrations_first_week,
        fileserver,
        data_day_total,
        data_day_new,
        label_day,
        data_month_total,
        data_month_new,
        label_month,
    } = dashboardData;

    let registration_text;
    if (count_registrations_second_week) {
        const percentage = Math.round(
            (count_registrations_second_week / count_registrations_first_week) *
                100 -
                100
        );
        registration_text =
            percentage >= 0 ? (
                <span>
                    <span className={classes.successText}>
                        <ArrowUpward className={classes.upArrowCardCategory} />{' '}
                        {percentage}%
                    </span>{' '}
                    {t('INCREASE_IN_THIS_WEEKS_REGISTRAITIONS')}
                </span>
            ) : (
                <span>
                    <span className={classes.dangerText}>
                        <ArrowDownward
                            className={classes.upArrowCardCategory}
                        />{' '}
                        {-percentage}%
                    </span>{' '}
                    {t('DECREASE_IN_THIS_WEEKS_REGISTRAITIONS')}
                </span>
            );
    } else {
        registration_text = (
            <span>
                <span className={classes.successText}>
                    <ArrowUpward className={classes.upArrowCardCategory} /> 0%
                </span>{' '}
                {t('INCREASE_IN_THIS_WEEKS_REGISTRAITIONS')}
            </span>
        );
    }

    return (
        <div>
            <HealthCheck />
            <Grid container>
                <GridItem xs={12} sm={12} md={6}>
                    {data_day_total && (
                        <ChartCard
                            chart={
                                <ChartistGraph
                                    className="ct-chart"
                                    data={{
                                        labels: label_day,
                                        series: [data_day_total, data_day_new],
                                    }}
                                    type="Line"
                                    options={{
                                        lineSmooth:
                                            Chartist.Interpolation.cardinal({
                                                tension: 0,
                                            }),
                                        low: 0,
                                        high:
                                            Math.max(
                                                ...data_day_total,
                                                ...data_day_new
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
                                    {{ count_registrations_second_week }} users
                                    registered (last week:{' '}
                                    {{ count_registrations_first_week }} users)
                                </Trans>
                            }
                        />
                    )}
                </GridItem>
                <GridItem xs={12} sm={12} md={6}>
                    {data_month_total && (
                        <ChartCard
                            chart={
                                <ChartistGraph
                                    className="ct-chart"
                                    data={{
                                        labels: label_month,
                                        series: [
                                            data_month_total,
                                            data_month_new,
                                        ],
                                    }}
                                    type="Line"
                                    options={{
                                        lineSmooth:
                                            Chartist.Interpolation.cardinal({
                                                tension: 0,
                                            }),
                                        low: 0,
                                        high:
                                            Math.max(
                                                ...data_month_total,
                                                ...data_month_new
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
                    )}
                </GridItem>
            </Grid>
            <Grid container>
                <GridItem xs={12} sm={6} md={6} lg={3}>
                    <LicenseCard
                        active={dashboardData.server_user_count_active}
                        total={dashboardData.server_user_count_total}
                        licensed={dashboardData.server_license_max_users}
                        valid_from={dashboardData.server_license_valid_from}
                        valid_till={dashboardData.server_license_valid_till}
                    />
                </GridItem>
                <GridItem xs={12} sm={6} md={6} lg={3}>
                    <Sessions
                        users={dashboardData.server_token_count_user}
                        devices={dashboardData.server_token_count_device}
                        total={dashboardData.server_token_count_total}
                    />
                </GridItem>
                <GridItem xs={12} sm={6} md={4} lg={2}>
                    <VersionCard
                        used_version={dashboardData.client_used_version}
                        latest_version={dashboardData.client_latest_version}
                        title={t('CLIENT_VERSION')}
                    />
                </GridItem>
                <GridItem xs={12} sm={6} md={4} lg={2}>
                    <VersionCard
                        used_version={dashboardData.server_used_version}
                        latest_version={dashboardData.server_latest_version}
                        title={t('SERVER_VERSION')}
                    />
                </GridItem>
                <GridItem xs={12} sm={6} md={4} lg={2}>
                    <VersionCard
                        used_version={dashboardData.admin_client_used_version}
                        latest_version={
                            dashboardData.admin_client_latest_version
                        }
                        title={t('PORTAL_VERSION')}
                    />
                </GridItem>
            </Grid>
            <Grid container>
                <GridItem xs={12} sm={12} md={6}>
                    {state.server.files && (
                        <FileserverCard
                            fileserver={dashboardData.fileserver}
                            latest_version={
                                dashboardData.fileserver_latest_version
                            }
                        />
                    )}
                    <ReleaseCard
                        server_releases={dashboardData.server_tags}
                        client_releases={dashboardData.client_tags}
                        admin_client_releases={dashboardData.admin_client_tags}
                        fileserver_releases={dashboardData.fileserver_tags}
                    />
                </GridItem>
                <GridItem xs={12} sm={12} md={6}>
                    {dashboardData.registrations.length > 0 && (
                        <Card>
                            <CardHeader color="warning">
                                <h4 className={classes.cardTitleWhite}>
                                    {t('REGISTRATIONS')}
                                </h4>
                                <p className={classes.cardCategoryWhite}>
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
                                        { field: 'active', title: t('ACTIVE') },
                                    ]}
                                    data={dashboardData.registrations}
                                    title={''}
                                />
                            </CardBody>
                        </Card>
                    )}
                </GridItem>
            </Grid>
        </div>
    );
};

Dashboard.propTypes = {
    classes: PropTypes.object.isRequired,
    state: PropTypes.object.isRequired,
};

export default withStyles(dashboardStyle)(Dashboard);
