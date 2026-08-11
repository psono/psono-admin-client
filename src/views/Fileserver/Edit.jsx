import React, { useEffect, useState } from 'react';
import { Checkbox, Grid } from '@material-ui/core';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import {
    CustomInput,
    CustomMaterialTable,
    GridItem,
    RegularCard,
} from '../../components';
import psono_server from '../../services/api-server';
import store from '../../services/store';

const Fileserver = () => {
    const { t } = useTranslation();
    const { fileserver_id } = useParams();
    const [fileserver, setFileserver] = useState(null);

    useEffect(() => {
        psono_server
            .admin_fileserver(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                fileserver_id
            )
            .then((response) => setFileserver(response.data));
    }, [fileserver_id]);

    if (!fileserver) return null;

    const ReadField = ({ id, label, value, md = 6 }) => (
        <GridItem xs={12} sm={12} md={md}>
            <CustomInput
                labelText={label}
                id={id}
                formControlProps={{ fullWidth: true }}
                inputProps={{
                    value: value || '',
                    disabled: true,
                    readOnly: true,
                }}
            />
        </GridItem>
    );
    const date = (value) => moment(value).format('YYYY-MM-DD HH:mm:ss');
    const shardRows = fileserver.shards.map((shard) => ({
        title: shard.shard_title,
        read: shard.read ? t('YES') : t('NO'),
        write: shard.write ? t('YES') : t('NO'),
        delete_capability: shard.delete_capability ? t('YES') : t('NO'),
        allow_link_shares: shard.allow_link_shares ? t('YES') : t('NO'),
    }));

    return (
        <Grid container>
            <GridItem xs={12} sm={12} md={12}>
                <RegularCard
                    cardTitle={t('FILESERVER_DETAILS')}
                    cardSubtitle={t('FILESERVER_DETAILS_INFO')}
                    content={
                        <>
                            <Grid container>
                                <ReadField
                                    id="id"
                                    label={t('ID')}
                                    value={fileserver.id}
                                />
                                <ReadField
                                    id="hostname"
                                    label={t('HOSTNAME')}
                                    value={fileserver.hostname}
                                />
                                <ReadField
                                    id="cluster"
                                    label={t('CLUSTER')}
                                    value={fileserver.cluster_title}
                                />
                                <ReadField
                                    id="version"
                                    label={t('VERSION')}
                                    value={fileserver.version}
                                />
                                <ReadField
                                    id="url"
                                    label={t('PUBLIC_URL')}
                                    value={fileserver.url}
                                />
                                <ReadField
                                    id="create-ip"
                                    label={t('CREATE_IP')}
                                    value={fileserver.create_ip}
                                />
                                <ReadField
                                    id="create-date"
                                    label={t('CREATED_AT')}
                                    value={date(fileserver.create_date)}
                                />
                                <ReadField
                                    id="write-date"
                                    label={t('LAST_SEEN')}
                                    value={date(fileserver.write_date)}
                                />
                                <ReadField
                                    id="valid-till"
                                    label={t('VALID_TILL')}
                                    value={date(fileserver.valid_till)}
                                />
                                <ReadField
                                    id="public-key"
                                    label={t('PUBLIC_KEY')}
                                    value={fileserver.public_key}
                                />
                            </Grid>
                            <Grid container>
                                {[
                                    ['alive', 'ALIVE'],
                                    ['read', 'READ'],
                                    ['write', 'WRITE'],
                                    ['delete_capability', 'DELETE_CAPABILITY'],
                                    ['allow_link_shares', 'ALLOW_LINK_SHARES'],
                                ].map(([field, label]) => (
                                    <GridItem xs={12} sm={6} md={4} key={field}>
                                        <Checkbox
                                            checked={Boolean(fileserver[field])}
                                            disabled
                                        />
                                        {t(label)}
                                    </GridItem>
                                ))}
                            </Grid>
                        </>
                    }
                />
            </GridItem>
            <GridItem xs={12} sm={12} md={12}>
                <RegularCard
                    cardTitle={t('SHARDS')}
                    content={
                        <CustomMaterialTable
                            title=""
                            columns={[
                                { field: 'title', title: t('SHARD') },
                                { field: 'read', title: t('READ') },
                                { field: 'write', title: t('WRITE') },
                                {
                                    field: 'delete_capability',
                                    title: t('DELETE_CAPABILITY'),
                                },
                                {
                                    field: 'allow_link_shares',
                                    title: t('ALLOW_LINK_SHARES'),
                                },
                            ]}
                            data={shardRows}
                        />
                    }
                />
            </GridItem>
        </Grid>
    );
};

export default Fileserver;
