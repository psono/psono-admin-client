import React, { useState, useEffect } from 'react';
import { withStyles, Grid } from '@material-ui/core';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
    ChartCard,
    GridItem,
    RegularCard,
    CustomMaterialTable,
} from '../../components';
import dashboardStyle from '../../assets/jss/material-dashboard-react/dashboardStyle';
import psono_server from '../../services/api-server';

import ChartistGraph from 'react-chartist';
import { Search } from '@material-ui/icons';
import store from '../../services/store';

function SecurityReports() {
    const { t } = useTranslation();
    const [state, setState] = useState({
        redirect_to: '',
        users_missing_reports: [],
        security_reports: [],
        count_reports: 0,
        user_count: 0,
        count_passwords: 0,
        count_passwords_breached: 0,
        count_passwords_breached_unknown: 0,
        count_passwords_duplicate: 0,
        count_recovery_code_exists: 0,
        count_two_factor_exists: 0,
        count_master_password_breached: 0,
        count_master_password_breach_unknown: 0,
        count_master_password_duplicate: 0,
        total_master_password_length: 0,
        total_master_password_variation_count: 0,
    });

    useEffect(() => {
        psono_server
            .admin_security_report(
                store.getState().user.token,
                store.getState().user.session_secret_key
            )
            .then((response) => {
                const { security_reports, user_count, users_missing_reports } =
                    response.data;

                let count_reports = 0;
                let count_passwords = 0;
                let count_passwords_breached = 0;
                let count_passwords_breached_unknown = 0;
                let count_passwords_duplicate = 0;
                let count_recovery_code_exists = 0;
                let count_two_factor_exists = 0;
                let count_master_password_breached = 0;
                let count_master_password_breach_unknown = 0;
                let count_master_password_duplicate = 0;
                let total_master_password_length = 0;
                let total_master_password_variation_count = 0;

                security_reports.forEach((g) => {
                    count_reports += 1;
                    count_passwords += g.website_password_count;
                    if (!g.check_haveibeenpwned) {
                        count_passwords_breached_unknown +=
                            g.website_password_count;
                    } else {
                        count_passwords_breached += g.breached_password_count;
                    }

                    count_passwords_duplicate += g.duplicate_password_count;
                    if (g.recovery_code_exists) {
                        count_recovery_code_exists += 1;
                    }
                    if (g.two_factor_exists) {
                        count_two_factor_exists += 1;
                    }

                    total_master_password_length += g.master_password_length;
                    total_master_password_variation_count +=
                        g.master_password_variation_count;

                    if (!g.check_haveibeenpwned) {
                        count_master_password_breach_unknown += 1;
                    } else if (g.master_password_breached) {
                        count_master_password_breached += 1;
                    }

                    if (g.master_password_duplicate) {
                        count_master_password_duplicate += 1;
                    }

                    g.create_date = moment(g.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    g.recovery_code_exists = g.recovery_code_exists
                        ? t('YES')
                        : t('NO');
                    g.two_factor_exists = g.two_factor_exists
                        ? t('YES')
                        : t('NO');
                    g.master_password_breached = g.master_password_breached
                        ? t('YES')
                        : t('NO');
                    g.master_password_breached = g.check_haveibeenpwned
                        ? g.master_password_breached
                        : t('UNTESTED');
                    g.check_haveibeenpwned = g.check_haveibeenpwned
                        ? t('YES')
                        : t('NO');
                });

                setState((prevState) => ({
                    ...prevState,
                    users_missing_reports,
                    security_reports,
                    count_reports,
                    user_count,
                    count_passwords,
                    count_passwords_breached,
                    count_passwords_breached_unknown,
                    count_passwords_duplicate,
                    count_recovery_code_exists,
                    count_two_factor_exists,
                    count_master_password_breached,
                    count_master_password_breach_unknown,
                    count_master_password_duplicate,
                    total_master_password_length,
                    total_master_password_variation_count,
                }));
            });
    }, [t]);

    const onShowDetails = (selected_reports) => {
        setState((prevState) => ({
            ...prevState,
            redirect_to: '/security-report/' + selected_reports[0].id,
        }));
    };

    if (state.redirect_to) {
        return <Redirect to={state.redirect_to} />;
    }

    return (
        <div>
            <Grid container>
                <GridItem xs={12} sm={4} md={4}>
                    <ChartCard
                        chart={
                            <ChartistGraph
                                className="ct-chart"
                                data={{
                                    labels: [
                                        t('MISSING') +
                                            ' (' +
                                            (state.user_count -
                                                state.count_reports) +
                                            ')',
                                        t('SENT') +
                                            ' (' +
                                            state.count_reports +
                                            ')',
                                    ],
                                    series: [
                                        {
                                            value:
                                                state.user_count -
                                                state.count_reports,
                                            className: 'ct-series-a',
                                        },
                                        {
                                            value: state.count_reports,
                                            className: 'ct-series-f',
                                        },
                                    ],
                                }}
                                type="Pie"
                                options={{
                                    labelInterpolationFnc: function (value) {
                                        return value[0];
                                    },
                                }}
                                responsiveOptions={[
                                    [
                                        'screen and (min-width: 640px)',
                                        {
                                            chartPadding: 20,
                                            labelOffset: 40,
                                            labelDirection: 'explode',
                                            labelInterpolationFnc: function (
                                                value
                                            ) {
                                                return value;
                                            },
                                        },
                                    ],
                                    [
                                        'screen and (min-width: 1024px)',
                                        {
                                            labelOffset: 40,
                                            chartPadding: 20,
                                        },
                                    ],
                                ]}
                            />
                        }
                        chartColor="blue"
                        title={t('SENT_REPORTS')}
                        fontAwesomeStatsIcon="flag"
                        statText={t('HOW_MANY_USERS_SENT_A_REPORT')}
                    />
                </GridItem>
                <GridItem xs={12} sm={4} md={4}>
                    <ChartCard
                        chart={
                            <ChartistGraph
                                className="ct-chart"
                                data={{
                                    labels: [
                                        t('MISSING') +
                                            ' (' +
                                            (state.count_reports -
                                                state.count_two_factor_exists) +
                                            ')',
                                        t('EXISTS') +
                                            ' (' +
                                            state.count_two_factor_exists +
                                            ')',
                                    ],
                                    series: [
                                        {
                                            value:
                                                state.count_reports -
                                                state.count_two_factor_exists,
                                            className: 'ct-series-a',
                                        },
                                        {
                                            value: state.count_two_factor_exists,
                                            className: 'ct-series-f',
                                        },
                                    ],
                                }}
                                type="Pie"
                                options={{
                                    labelInterpolationFnc: function (value) {
                                        return value[0];
                                    },
                                }}
                                responsiveOptions={[
                                    [
                                        'screen and (min-width: 640px)',
                                        {
                                            chartPadding: 20,
                                            labelOffset: 40,
                                            labelDirection: 'explode',
                                            labelInterpolationFnc: function (
                                                value
                                            ) {
                                                return value;
                                            },
                                        },
                                    ],
                                    [
                                        'screen and (min-width: 1024px)',
                                        {
                                            labelOffset: 40,
                                            chartPadding: 20,
                                        },
                                    ],
                                ]}
                            />
                        }
                        chartColor="blue"
                        title={t('TWO_FACTOR_CONFIGURED')}
                        fontAwesomeStatsIcon="flag"
                        statText={t(
                            'HOW_MANY_USERS_ARE_MISSING_A_SECOND_FACTOR'
                        )}
                    />
                </GridItem>
                <GridItem xs={12} sm={4} md={4}>
                    <ChartCard
                        chart={
                            <ChartistGraph
                                className="ct-chart"
                                data={{
                                    labels: [
                                        t('MISSING') +
                                            ' (' +
                                            (state.user_count -
                                                state.count_recovery_code_exists) +
                                            ')',
                                        t('EXISTS') +
                                            ' (' +
                                            state.count_recovery_code_exists +
                                            ')',
                                    ],
                                    series: [
                                        {
                                            value:
                                                state.user_count -
                                                state.count_recovery_code_exists,
                                            className: 'ct-series-a',
                                        },
                                        {
                                            value: state.count_recovery_code_exists,
                                            className: 'ct-series-f',
                                        },
                                    ],
                                }}
                                type="Pie"
                                options={{
                                    labelInterpolationFnc: function (value) {
                                        return value[0];
                                    },
                                }}
                                responsiveOptions={[
                                    [
                                        'screen and (min-width: 640px)',
                                        {
                                            chartPadding: 20,
                                            labelOffset: 40,
                                            labelDirection: 'explode',
                                            labelInterpolationFnc: function (
                                                value
                                            ) {
                                                return value;
                                            },
                                        },
                                    ],
                                    [
                                        'screen and (min-width: 1024px)',
                                        {
                                            labelOffset: 40,
                                            chartPadding: 20,
                                        },
                                    ],
                                ]}
                            />
                        }
                        chartColor="blue"
                        title={t('RECOVERY_CODE_EXISTS')}
                        fontAwesomeStatsIcon="flag"
                        statText={t(
                            'HOW_MANY_USERS_ARE_MISSING_A_RECOVERY_CODE'
                        )}
                    />
                </GridItem>
            </Grid>
            <Grid container>
                <RegularCard
                    headerColor="orange"
                    cardTitle={t('SECURITY_REPORTS')}
                    cardSubtitle={t('SECURITY_REPORT_LIST_INFO')}
                    content={
                        <CustomMaterialTable
                            columns={[
                                {
                                    field: 'create_date',
                                    title: t('CREATED_AT'),
                                },
                                {
                                    field: 'username',
                                    title: t('USERNAME'),
                                },
                                {
                                    field: 'two_factor_exists',
                                    title: t('TWO_FACTOR'),
                                },
                                {
                                    field: 'website_password_count',
                                    title: t('PASSWORDS'),
                                },
                                {
                                    field: 'breached_password_count',
                                    title: t('BREACHED'),
                                },
                                {
                                    field: 'duplicate_password_count',
                                    title: t('DUPLICATES'),
                                },
                                {
                                    field: 'master_password_breached',
                                    title: t('MASTER_PASSWORD_BREACHED'),
                                },
                                {
                                    field: 'master_password_duplicate',
                                    title: t('MASTER_PASSWORD_REUSED'),
                                },
                                {
                                    field: 'master_password_length',
                                    title: t('MASTER_PASSWORD_LENGTH'),
                                },
                                {
                                    field: 'master_password_variation_count',
                                    title: t(
                                        'MASTER_PASSWORD_CHARACTER_GROUPS'
                                    ),
                                },
                                {
                                    field: 'recovery_code_exists',
                                    title: t('RECOVERY_CODE'),
                                },
                            ]}
                            data={state.security_reports}
                            title={''}
                            actions={[
                                {
                                    tooltip: t('SHOW_DETAILS'),
                                    icon: Search,
                                    onClick: (evt, selected_report) =>
                                        onShowDetails([selected_report]),
                                },
                            ]}
                        />
                    }
                />
            </Grid>
            <Grid container>
                <RegularCard
                    headerColor="purple"
                    cardTitle={t('USERS')}
                    cardSubtitle={t('LIST_OF_USERS_WITHOUT_SECURITY_REPORT')}
                    content={
                        <CustomMaterialTable
                            columns={[
                                {
                                    field: 'create_date',
                                    title: t('JOINED_AT'),
                                },
                                {
                                    field: 'username',
                                    title: t('USERNAME'),
                                },
                            ]}
                            data={state.users_missing_reports}
                            title={''}
                        />
                    }
                />
            </Grid>
        </div>
    );
}

export default SecurityReports;
