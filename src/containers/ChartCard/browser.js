import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChartistGraph from 'react-chartist';
import { ChartCard } from '../../components';

import psono_server from '../../services/api-server';
import store from '../../services/store';

const BrowserChartCard = () => {
    const { t } = useTranslation();
    const [series, setSeries] = useState([0, 0, 0, 0, 0]);
    const [labels, setLabels] = useState([
        'Other',
        'Firefox',
        'Chrome',
        'Safari',
        'Vivaldi',
    ]);

    React.useEffect(() => {
        loadStats();
    }, []);

    const loadStats = () => {
        psono_server
            .admin_stats_browser(
                store.getState().user.token,
                store.getState().user.session_secret_key
            )
            .then((response) => {
                const newSeries = [
                    response.data.other,
                    response.data.firefox,
                    response.data.chrome,
                    response.data.safari,
                    response.data.vivaldi,
                    response.data.edge || 0,
                    response.data.brave || 0,
                    response.data.opera || 0,
                ];

                const newLabels = [
                    'Other',
                    'Firefox',
                    'Chrome',
                    'Safari',
                    'Vivaldi',
                    'Edge',
                    'Brave',
                    'Opera',
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
            chartColor="purple"
            title={t('BROWSER')}
            fontAwesomeStatsIcon="chrome"
            statText={t('DISTRIBUTION_BY_BROWSER')}
        />
    );
};

export default BrowserChartCard;
