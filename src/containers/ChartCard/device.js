import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChartistGraph from 'react-chartist';
import { ChartCard } from '../../components';

import psono_server from '../../services/api-server';
import store from '../../services/store';

const DeviceChartCard = () => {
    const { t } = useTranslation();
    const [series, setSeries] = useState([0, 0, 0, 0, 0, 0]);
    const [labels, setLabels] = useState([
        'Other',
        'Android',
        'iPhone',
        'Linux',
        'Mac',
        'Windows',
    ]);

    React.useEffect(() => {
        loadStats();
    }, []);

    const loadStats = () => {
        psono_server
            .admin_stats_device(
                store.getState().user.token,
                store.getState().user.session_secret_key
            )
            .then((response) => {
                console.log(response.data);

                const newSeries = [
                    response.data.other,
                    response.data.android,
                    response.data.iphone,
                    response.data.linux,
                    response.data.mac,
                    response.data.windows,
                ];

                const newLabels = [
                    'Other',
                    'Android',
                    'iPhone',
                    'Linux',
                    'Mac',
                    'Windows',
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
            title={t('DEVICES')}
            fontAwesomeStatsIcon="tablet"
            statText={t('DISTRIBUTION_BY_DEVICE')}
        />
    );
};

export default DeviceChartCard;
