import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChartistGraph from 'react-chartist';
import { ChartCard } from '../../components';

import psono_server from '../../services/api-server';
import store from '../../services/store';

const TwoFactorChartCard = () => {
    const { t } = useTranslation();
    const [series, setSeries] = useState([0, 0, 0, 0]);
    const [labels, setLabels] = useState([
        'None',
        'Yubikey',
        'Google Authenticator',
        'Duo',
        'WebAuthn',
    ]);

    React.useEffect(() => {
        loadStats();
    }, []);

    const loadStats = () => {
        psono_server
            .admin_stats_two_factor(
                store.getState().user.token,
                store.getState().user.session_secret_key
            )
            .then((response) => {
                const newSeries = [
                    response.data.users -
                        response.data.user_yubikey_otp_enabled_count -
                        response.data.user_duo_enabled_count -
                        response.data.user_webauthn_enabled_count -
                        response.data.user_google_authenticator_enabled_count,
                    response.data.user_yubikey_otp_enabled_count,
                    response.data.user_google_authenticator_enabled_count,
                    response.data.user_duo_enabled_count,
                    response.data.user_webauthn_enabled_count,
                ];

                const newLabels = [
                    'None',
                    'Yubikey',
                    'Google Authenticator',
                    'Duo',
                    'WebAuthn',
                ];

                function filterNotZero(entry, index) {
                    if (entry === 0) {
                        newLabels.splice(index, 1);
                        return false;
                    } else {
                        return true;
                    }
                }

                setSeries(newSeries.filter(filterNotZero));
                setLabels(newLabels);
            });
    };

    return (
        <ChartCard
            chart={
                <ChartistGraph
                    className="ct-chart"
                    data={{
                        labels,
                        series,
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
                                labelInterpolationFnc: function (value) {
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
            title={t('TWO_FACTOR')}
            fontAwesomeStatsIcon="angellist"
            statText={t('DISTRIBUTION_BY_TWO_FACTOR')}
        />
    );
};

export default TwoFactorChartCard;
