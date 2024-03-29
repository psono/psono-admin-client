import React from 'react';
import { Grid, Checkbox, withStyles } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import moment from 'moment';

import {
    RegularCard,
    CustomInput,
    GridItem,
    CustomMaterialTable,
    ChartCard,
} from '../../components';
import psono_server from '../../services/api-server';
import helperService from '../../services/helper';
import customInputStyle from '../../assets/jss/material-dashboard-react/customInputStyle';
import ChartistGraph from 'react-chartist';

class SecurityReport extends React.Component {
    state = {};

    componentDidMount() {
        const { t } = this.props;
        psono_server
            .admin_security_report(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                this.props.match.params.security_report_id
            )
            .then((response) => {
                const security_report = response.data;

                const password_length_distribution = {};
                const password_length_distribution_labels = [];
                const password_length_distribution_series = [];

                const variation_count_distribution = {};
                const variation_count_distribution_labels = [];
                const variation_count_distribution_series = [];

                security_report.entries.forEach((e) => {
                    e.duplicate = e.duplicate ? t('YES') : t('NO');
                    e.write_age = helperService.timeDifference(e.write_age)[
                        'days'
                    ];
                    e.create_age = helperService.timeDifference(e.create_age)[
                        'days'
                    ];

                    if (security_report.check_haveibeenpwned) {
                        e.breached = e.breached ? t('YES') : t('NO');
                    } else {
                        e.breached = t('UNTESTED');
                    }
                    e.master_password = e.master_password ? t('YES') : t('NO');

                    if (
                        !password_length_distribution.hasOwnProperty(
                            e.password_length
                        )
                    ) {
                        password_length_distribution[e.password_length] = 0;
                    }
                    password_length_distribution[e.password_length]++;

                    if (
                        !variation_count_distribution.hasOwnProperty(
                            e.variation_count
                        )
                    ) {
                        variation_count_distribution[e.variation_count] = 0;
                    }
                    variation_count_distribution[e.variation_count]++;
                });

                for (var password_length in password_length_distribution) {
                    if (
                        !password_length_distribution.hasOwnProperty(
                            password_length
                        )
                    ) {
                        continue;
                    }
                    password_length_distribution_labels.push(password_length);
                    password_length_distribution_series.push(
                        password_length_distribution[password_length]
                    );
                }

                for (var variation_count in variation_count_distribution) {
                    if (
                        !variation_count_distribution.hasOwnProperty(
                            variation_count
                        )
                    ) {
                        continue;
                    }
                    variation_count_distribution_labels.push(variation_count);
                    variation_count_distribution_series.push(
                        variation_count_distribution[variation_count]
                    );
                }

                this.setState({
                    password_length_distribution_labels:
                        password_length_distribution_labels,
                    password_length_distribution_series:
                        password_length_distribution_series,
                    variation_count_distribution_labels:
                        variation_count_distribution_labels,
                    variation_count_distribution_series:
                        variation_count_distribution_series,
                    security_report: security_report,
                });
            });
    }

    render() {
        const { classes, t } = this.props;
        const security_report = this.state.security_report;

        if (!security_report) {
            return null;
        }

        return (
            <div>
                <Grid container>
                    <GridItem xs={12} sm={12} md={12}>
                        <RegularCard
                            cardTitle={t('SECURITY_REPORT_DETAILS')}
                            cardSubtitle={t(
                                'SHOWS_DETAILS_ABOUT_SECURITY_REPORT'
                            )}
                            content={
                                <div>
                                    <Grid container>
                                        <GridItem xs={12} sm={12} md={4}>
                                            <CustomInput
                                                labelText={t('CREATED_AT')}
                                                id="create_date"
                                                formControlProps={{
                                                    fullWidth: true,
                                                }}
                                                inputProps={{
                                                    value: moment(
                                                        security_report.create_date
                                                    ).format(
                                                        'YYYY-MM-DD HH:mm:ss'
                                                    ),
                                                    disabled: true,
                                                    readOnly: true,
                                                }}
                                            />
                                        </GridItem>
                                        <GridItem xs={12} sm={12} md={8}>
                                            <CustomInput
                                                labelText={t('USERNAME')}
                                                id="username"
                                                formControlProps={{
                                                    fullWidth: true,
                                                }}
                                                inputProps={{
                                                    value: security_report.username,
                                                    disabled: true,
                                                    readOnly: true,
                                                }}
                                            />
                                        </GridItem>
                                    </Grid>
                                    <Grid container>
                                        <GridItem xs={12} sm={6} md={4}>
                                            <div className={classes.checkbox}>
                                                <Checkbox
                                                    tabIndex={1}
                                                    checked={
                                                        security_report.two_factor_exists
                                                    }
                                                    disabled
                                                />{' '}
                                                {t('TWO_FACTOR')}
                                            </div>
                                        </GridItem>
                                        <GridItem xs={12} sm={6} md={4}>
                                            <div className={classes.checkbox}>
                                                <Checkbox
                                                    tabIndex={1}
                                                    checked={
                                                        security_report.recovery_code_exists
                                                    }
                                                    disabled
                                                />{' '}
                                                {t('RECOVERY_CODE')}
                                            </div>
                                        </GridItem>
                                        <GridItem xs={12} sm={6} md={4}>
                                            <div className={classes.checkbox}>
                                                <Checkbox
                                                    tabIndex={1}
                                                    checked={
                                                        security_report.check_haveibeenpwned
                                                    }
                                                    disabled
                                                />{' '}
                                                {t('BREACH_DETECTION')}
                                            </div>
                                        </GridItem>
                                    </Grid>
                                </div>
                            }
                        />
                    </GridItem>
                </Grid>
                <Grid container>
                    <GridItem xs={12} sm={6} md={6}>
                        <ChartCard
                            chart={
                                <ChartistGraph
                                    className="ct-chart"
                                    data={{
                                        labels: this.state
                                            .password_length_distribution_labels,
                                        series: this.state
                                            .password_length_distribution_series,
                                    }}
                                    type="Pie"
                                    options={{
                                        labelInterpolationFnc: function (
                                            value
                                        ) {
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
                                                labelInterpolationFnc:
                                                    function (value) {
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
                            title={t('PASSWORD_LENGTH_DISTRIBUTION')}
                            fontAwesomeStatsIcon="flag"
                            statText={t('HOW_MANY_PASSWORDS_HAVE_WHICH_LENGTH')}
                        />
                    </GridItem>
                    <GridItem xs={12} sm={6} md={6}>
                        <ChartCard
                            chart={
                                <ChartistGraph
                                    className="ct-chart"
                                    data={{
                                        labels: this.state
                                            .variation_count_distribution_labels,
                                        series: this.state
                                            .variation_count_distribution_series,
                                    }}
                                    type="Pie"
                                    options={{
                                        labelInterpolationFnc: function (
                                            value
                                        ) {
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
                                                labelInterpolationFnc:
                                                    function (value) {
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
                            title={t('CHARACTER_GROUP_DISTRIBUTION')}
                            fontAwesomeStatsIcon="flag"
                            statText={t(
                                'HOW_MANY_PASSWORDS_HAVE_HOW_MANY_CHARACTER_GROUPS'
                            )}
                        />
                    </GridItem>
                </Grid>
                <Grid container>
                    <RegularCard
                        headerColor="orange"
                        cardTitle={t('ENTRIES')}
                        cardSubtitle={t('LIST_OF_SECURITY_REPORT_ENTRIES')}
                        content={
                            <CustomMaterialTable
                                columns={[
                                    {
                                        field: 'name',
                                        title: t('TITLE'),
                                    },
                                    {
                                        field: 'master_password',
                                        title: t('MASTER_PASSWORD'),
                                    },
                                    {
                                        field: 'password_length',
                                        title: t('PASSWORD_LENGTH'),
                                    },
                                    {
                                        field: 'variation_count',
                                        title: t('PASSWORD_CHARACTER_GROUPS'),
                                    },
                                    {
                                        field: 'create_age',
                                        title: t('CREATED_IN_DAYS'),
                                    },
                                    {
                                        field: 'write_age',
                                        title: t('LAST_UPDATED_IN_DAYS'),
                                    },
                                    { field: 'breached', title: t('BREACHED') },
                                    {
                                        field: 'duplicate',
                                        title: t('DUPLICATE'),
                                    },
                                ]}
                                data={this.state.security_report.entries}
                                title={''}
                            />
                        }
                    />
                </Grid>
            </div>
        );
    }
}

export default compose(
    withTranslation(),
    withStyles(customInputStyle)
)(SecurityReport);
