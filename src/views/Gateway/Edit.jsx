import React, { useEffect, useState } from 'react';
import { Checkbox, Grid } from '@material-ui/core';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { CustomInput, GridItem, RegularCard } from '../../components';
import psono_server from '../../services/api-server';
import store from '../../services/store';

const Gateway = () => {
    const { t } = useTranslation();
    const { gateway_id } = useParams();
    const [gateway, setGateway] = useState(null);

    useEffect(() => {
        psono_server
            .admin_gateway(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                gateway_id
            )
            .then((response) => setGateway(response.data));
    }, [gateway_id]);

    if (!gateway) return null;
    const date = (value) => moment(value).format('YYYY-MM-DD HH:mm:ss');
    const fields = [
        ['id', 'ID', gateway.id],
        ['hostname', 'HOSTNAME', gateway.hostname],
        ['cluster', 'CLUSTER', gateway.cluster_title],
        ['version', 'VERSION', gateway.version],
        ['url', 'PUBLIC_URL', gateway.url],
        ['create-ip', 'CREATE_IP', gateway.create_ip],
        ['create-date', 'CREATED_AT', date(gateway.create_date)],
        ['write-date', 'LAST_SEEN', date(gateway.write_date)],
        ['valid-till', 'VALID_TILL', date(gateway.valid_till)],
        ['public-key', 'PUBLIC_KEY', gateway.public_key],
    ];

    return (
        <Grid container>
            <GridItem xs={12} sm={12} md={12}>
                <RegularCard
                    cardTitle={t('GATEWAY_DETAILS')}
                    cardSubtitle={t('GATEWAY_DETAILS_INFO')}
                    content={
                        <Grid container>
                            {fields.map(([id, label, value]) => (
                                <GridItem xs={12} sm={12} md={6} key={id}>
                                    <CustomInput
                                        labelText={t(label)}
                                        id={id}
                                        formControlProps={{ fullWidth: true }}
                                        inputProps={{
                                            value: value || '',
                                            disabled: true,
                                            readOnly: true,
                                        }}
                                    />
                                </GridItem>
                            ))}
                            <GridItem xs={12} sm={12} md={6}>
                                <Checkbox checked={gateway.alive} disabled />
                                {t('ALIVE')}
                            </GridItem>
                        </Grid>
                    }
                />
            </GridItem>
        </Grid>
    );
};

export default Gateway;
