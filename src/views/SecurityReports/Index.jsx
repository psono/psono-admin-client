import React from 'react';
import { withStyles, Grid } from 'material-ui';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import {
    ChartCard,
    ItemGrid,
    RegularCard,
    CustomTable
} from '../../components';
import { dashboardStyle } from '../../variables/styles';
import psono_server from '../../services/api-server';

import ChartistGraph from 'react-chartist';
import { Search } from 'material-ui-icons';

class SecurityReports extends React.Component {
    state = {
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
        os_data: [],
        os_labels: [],
        device_data: [],
        device_labels: [],
        browser_data: [],
        browser_labels: [],
        twofa_data: [],
        twofa_labels: []
    };
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

    onShowDetails(selected_reports) {
        this.setState({
            redirect_to: '/security-report/' + selected_reports[0].id
        });
    }

    componentDidMount() {
        const { t } = this.props;
        psono_server
            .admin_security_report(
                this.props.state.user.token,
                this.props.state.user.session_secret_key
            )
            .then(response => {
                const {
                    security_reports,
                    user_count,
                    users_missing_reports
                } = response.data;

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

                security_reports.forEach(g => {
                    count_reports = count_reports + 1;
                    count_passwords =
                        count_passwords + g.website_password_count;
                    if (!g.check_haveibeenpwned) {
                        count_passwords_breached_unknown =
                            count_passwords_breached_unknown +
                            g.website_password_count;
                    } else {
                        count_passwords_breached =
                            count_passwords_breached +
                            g.breached_password_count;
                    }

                    count_passwords_duplicate =
                        count_passwords_duplicate + g.duplicate_password_count;
                    if (g.recovery_code_exists) {
                        count_recovery_code_exists =
                            count_recovery_code_exists + 1;
                    }
                    if (g.two_factor_exists) {
                        count_two_factor_exists = count_two_factor_exists + 1;
                    }

                    total_master_password_length =
                        total_master_password_length + g.master_password_length;
                    total_master_password_variation_count =
                        total_master_password_variation_count +
                        g.master_password_variation_count;

                    if (!g.check_haveibeenpwned) {
                        count_master_password_breach_unknown =
                            count_master_password_breach_unknown + 1;
                    } else {
                        if (g.master_password_breached) {
                            count_master_password_breached =
                                count_master_password_breached + 1;
                        }
                    }

                    if (g.master_password_duplicate) {
                        count_master_password_duplicate =
                            count_master_password_duplicate + 1;
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
                    g.master_password_duplicate = g.master_password_duplicate
                        ? t('YES')
                        : t('NO');

                    g.master_password_breached = g.check_haveibeenpwned
                        ? g.master_password_breached
                        : t('UNTESTED');

                    g.check_haveibeenpwned = g.check_haveibeenpwned
                        ? t('YES')
                        : t('NO');
                });

                this.setState({
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
                    total_master_password_variation_count
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
                    <ItemGrid xs={12} sm={4} md={4}>
                        <ChartCard
                            chart={
                                <ChartistGraph
                                    className="ct-chart"
                                    data={{
                                        labels: [
                                            t('MISSING') +
                                                ' (' +
                                                (this.state.user_count -
                                                    this.state.count_reports) +
                                                ')',
                                            t('SENT') +
                                                ' (' +
                                                this.state.count_reports +
                                                ')'
                                        ],
                                        series: [
                                            {
                                                value:
                                                    this.state.user_count -
                                                    this.state.count_reports,
                                                className: 'ct-series-a'
                                            },
                                            {
                                                value: this.state.count_reports,
                                                className: 'ct-series-f'
                                            }
                                        ]
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
                            title={t('SENT_REPORTS')}
                            fontAwesomeStatsIcon="flag"
                            statText={t('HOW_MANY_USERS_SENT_A_REPORT')}
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={4} md={4}>
                        <ChartCard
                            chart={
                                <ChartistGraph
                                    className="ct-chart"
                                    data={{
                                        labels: [
                                            t('MISSING') +
                                                ' (' +
                                                (this.state.count_reports -
                                                    this.state
                                                        .count_two_factor_exists) +
                                                ')',
                                            t('EXISTS') +
                                                ' (' +
                                                this.state
                                                    .count_two_factor_exists +
                                                ')'
                                        ],
                                        series: [
                                            {
                                                value:
                                                    this.state.count_reports -
                                                    this.state
                                                        .count_two_factor_exists,
                                                className: 'ct-series-a'
                                            },
                                            {
                                                value: this.state
                                                    .count_two_factor_exists,
                                                className: 'ct-series-f'
                                            }
                                        ]
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
                            title={t('TWO_FACTOR_CONFIGURED')}
                            fontAwesomeStatsIcon="flag"
                            statText={t(
                                'HOW_MANY_USERS_ARE_MISSING_A_SECOND_FACTOR'
                            )}
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={4} md={4}>
                        <ChartCard
                            chart={
                                <ChartistGraph
                                    className="ct-chart"
                                    data={{
                                        labels: [
                                            t('MISSING') +
                                                ' (' +
                                                (this.state.user_count -
                                                    this.state
                                                        .count_recovery_code_exists) +
                                                ')',
                                            t('EXISTS') +
                                                ' (' +
                                                this.state
                                                    .count_recovery_code_exists +
                                                ')'
                                        ],
                                        series: [
                                            {
                                                value:
                                                    this.state.user_count -
                                                    this.state
                                                        .count_recovery_code_exists,
                                                className: 'ct-series-a'
                                            },
                                            {
                                                value: this.state
                                                    .count_recovery_code_exists,
                                                className: 'ct-series-f'
                                            }
                                        ]
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
                            title={t('RECOVERY_CODE_EXISTS')}
                            fontAwesomeStatsIcon="flag"
                            statText={t(
                                'HOW_MANY_USERS_ARE_MISSING_A_RECOVERY_CODE'
                            )}
                        />
                    </ItemGrid>
                </Grid>
                <Grid container>
                    <ItemGrid xs={12} sm={6} md={6} lg={3}>
                        <ChartCard
                            chart={
                                <ChartistGraph
                                    className="ct-chart"
                                    data={{
                                        labels: [
                                            t('BREACHED') +
                                                ' (' +
                                                this.state
                                                    .count_master_password_breached +
                                                ')',
                                            t('UNTESTED') +
                                                ' (' +
                                                this.state
                                                    .count_master_password_breach_unknown +
                                                ')',
                                            t('SECURE') +
                                                ' (' +
                                                (this.state.count_reports -
                                                    this.state
                                                        .count_master_password_breach_unknown -
                                                    this.state
                                                        .count_master_password_breached) +
                                                ')'
                                        ],
                                        series: [
                                            {
                                                value: this.state
                                                    .count_master_password_breached,
                                                className: 'ct-series-a'
                                            },
                                            {
                                                value: this.state
                                                    .count_master_password_breach_unknown,
                                                className: 'ct-series-b'
                                            },
                                            {
                                                value:
                                                    this.state.count_reports -
                                                    this.state
                                                        .count_master_password_breach_unknown -
                                                    this.state
                                                        .count_master_password_breached,
                                                className: 'ct-series-f'
                                            }
                                        ]
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
                            title={t('BREACHED_MASTER_PASSWORDS')}
                            fontAwesomeStatsIcon="flag"
                            statText={t(
                                'HOW_MANY_MASTER_PASSWORDS_HAVE_BEEN_BREACHED'
                            )}
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={6} md={6} lg={3}>
                        <ChartCard
                            chart={
                                <ChartistGraph
                                    className="ct-chart"
                                    data={{
                                        labels: [
                                            t('DUPLICATES') +
                                                ' (' +
                                                this.state
                                                    .count_master_password_duplicate +
                                                ')',
                                            t('UNIQUES') +
                                                ' (' +
                                                (this.state.count_reports -
                                                    this.state
                                                        .count_master_password_duplicate) +
                                                ')'
                                        ],
                                        series: [
                                            {
                                                value: this.state
                                                    .count_master_password_duplicate,
                                                className: 'ct-series-a'
                                            },
                                            {
                                                value:
                                                    this.state.count_reports -
                                                    this.state
                                                        .count_master_password_duplicate,
                                                className: 'ct-series-f'
                                            }
                                        ]
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
                            title={t('DUPLICATE_MASTER_PASSWORDS')}
                            fontAwesomeStatsIcon="flag"
                            statText={t(
                                'HOW_MANY_MASTER_PASSWORDS_HAVE_BEEN_USED_MULTIPLE_TIMES'
                            )}
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={6} md={6} lg={3}>
                        <ChartCard
                            chart={
                                <ChartistGraph
                                    className="ct-chart"
                                    data={{
                                        labels: [
                                            t('BREACHED') +
                                                ' (' +
                                                this.state
                                                    .count_passwords_breached +
                                                ')',
                                            t('UNTESTED') +
                                                ' (' +
                                                this.state
                                                    .count_passwords_breached_unknown +
                                                ')',
                                            t('SECURE') +
                                                ' (' +
                                                (this.state.count_passwords -
                                                    this.state
                                                        .count_passwords_breached_unknown -
                                                    this.state
                                                        .count_passwords_breached) +
                                                ')'
                                        ],
                                        series: [
                                            {
                                                value: this.state
                                                    .count_passwords_breached,
                                                className: 'ct-series-a'
                                            },
                                            {
                                                value: this.state
                                                    .count_passwords_breached_unknown,
                                                className: 'ct-series-b'
                                            },
                                            {
                                                value:
                                                    this.state.count_passwords -
                                                    this.state
                                                        .count_passwords_breached_unknown -
                                                    this.state
                                                        .count_passwords_breached,
                                                className: 'ct-series-f'
                                            }
                                        ]
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
                            title={t('BREACHED_PASSWORDS')}
                            fontAwesomeStatsIcon="flag"
                            statText={t(
                                'HOW_MANY_PASSWORDS_HAVE_BEEN_BREACHED'
                            )}
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={6} md={6} lg={3}>
                        <ChartCard
                            chart={
                                <ChartistGraph
                                    className="ct-chart"
                                    data={{
                                        labels: [
                                            t('DUPLICATES') +
                                                ' (' +
                                                this.state
                                                    .count_passwords_duplicate +
                                                ')',
                                            t('UNIQUES') +
                                                ' (' +
                                                (this.state.count_passwords -
                                                    this.state
                                                        .count_passwords_duplicate) +
                                                ')'
                                        ],
                                        series: [
                                            {
                                                value: this.state
                                                    .count_passwords_duplicate,
                                                className: 'ct-series-a'
                                            },
                                            {
                                                value:
                                                    this.state.count_passwords -
                                                    this.state
                                                        .count_passwords_duplicate,
                                                className: 'ct-series-f'
                                            }
                                        ]
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
                            title={t('DUPLICATE_PASSWORDS')}
                            fontAwesomeStatsIcon="flag"
                            statText={t(
                                'HOW_MANY_PASSWORDS_HAVE_BEEN_USED_MULTIPLE_TIMES'
                            )}
                        />
                    </ItemGrid>
                </Grid>
                <Grid container>
                    <RegularCard
                        headerColor="orange"
                        cardTitle={t('SECURITY_REPORTS')}
                        cardSubtitle={t('SECURITY_REPORT_LIST_INFO')}
                        content={
                            <CustomTable
                                headerFunctions={[
                                    {
                                        title: t('SHOW_DETAILS'),
                                        onClick: selected_reports =>
                                            this.onShowDetails(
                                                selected_reports
                                            ),
                                        icon: <Search />,
                                        max_selected: 1
                                    }
                                ]}
                                head={[
                                    {
                                        id: 'create_date',
                                        label: t('CREATED_AT')
                                    },
                                    {
                                        id: 'username',
                                        label: t('USERNAME')
                                    },
                                    {
                                        id: 'two_factor_exists',
                                        label: t('TWO_FACTOR')
                                    },
                                    {
                                        id: 'website_password_count',
                                        label: t('PASSWORDS')
                                    },
                                    {
                                        id: 'breached_password_count',
                                        label: t('BREACHED')
                                    },
                                    {
                                        id: 'duplicate_password_count',
                                        label: t('DUPLICATES')
                                    },
                                    {
                                        id: 'master_password_breached',
                                        label: t('MASTER_PASSWORD_BREACHED')
                                    },
                                    {
                                        id: 'master_password_duplicate',
                                        label: t('MASTER_PASSWORD_REUSED')
                                    },
                                    {
                                        id: 'master_password_length',
                                        label: t('MASTER_PASSWORD_LENGTH')
                                    },
                                    {
                                        id: 'master_password_variation_count',
                                        label: t(
                                            'MASTER_PASSWORD_CHARACTER_GROUPS'
                                        )
                                    },
                                    {
                                        id: 'recovery_code_exists',
                                        label: t('RECOVERY_CODE')
                                    }
                                ]}
                                data={this.state.security_reports}
                            />
                        }
                    />
                </Grid>
                <Grid container>
                    <RegularCard
                        headerColor="purple"
                        cardTitle={t('USERS')}
                        cardSubtitle={t(
                            'LIST_OF_USERS_WITHOUT_SECURITY_REPORT'
                        )}
                        content={
                            <CustomTable
                                head={[
                                    {
                                        id: 'create_date',
                                        label: t('JOINED_AT')
                                    },
                                    {
                                        id: 'username',
                                        label: t('USERNAME')
                                    }
                                ]}
                                data={this.state.users_missing_reports}
                            />
                        }
                    />
                </Grid>
            </div>
        );
    }
}

SecurityReports.propTypes = {
    classes: PropTypes.object.isRequired
};

export default compose(withTranslation(), withStyles(dashboardStyle))(
    SecurityReports
);
