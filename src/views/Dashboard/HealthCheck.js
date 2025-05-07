import React from 'react';
import { Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { HealthcheckCard } from '../../components';
import { GridItem } from '../../components';
import psono_server from '../../services/api-server';

const HealthCheck = (props) => {
    const { t } = useTranslation();
    const [healthcheck, setHealthcheck] = React.useState({
        db_read: {},
        db_sync: {},
        time_sync: {},
    });

    React.useEffect(() => {
        psono_server.healthcheck().then(
            (response) => {
                //healthy is reported as 200
                setHealthcheck(response.data);
            },
            (response) => {
                if (response.hasOwnProperty('data')) {
                    setHealthcheck(response.data);
                } else {
                    console.log(response);
                }
            }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Grid container>
            <GridItem xs={12} sm={4} md={4}>
                <HealthcheckCard
                    title={t('DB_ACCESSIBILITY')}
                    sub_title_success={t('IS_DB_REACHABLE')}
                    sub_title_error={t('DB_CONNECTION_BROKEN')}
                    healthcheck={healthcheck.db_read.healthy}
                />
            </GridItem>
            <GridItem xs={12} sm={4} md={4}>
                <HealthcheckCard
                    title={t('DB_SYNCHRONIZED')}
                    sub_title_success={t('ARE_DATABASE_MIGRATIONS_PENDING')}
                    sub_title_error={t('PENDING_DATABASE_MIGRATIONS_DETECTED')}
                    healthcheck={healthcheck.db_sync.healthy}
                />
            </GridItem>
            <GridItem xs={12} sm={4} md={4}>
                <HealthcheckCard
                    title={t('TIME_SYNC')}
                    sub_title_success={t('IS_SERVER_TIME_CORRECT')}
                    sub_title_error={t('SERVER_TIME_OUT_OF_SYNC')}
                    healthcheck={healthcheck.time_sync.healthy}
                />
            </GridItem>
        </Grid>
    );
};

export default HealthCheck;
