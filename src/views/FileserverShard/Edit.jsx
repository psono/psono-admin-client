import React, { useEffect, useState } from 'react';
import { Checkbox, Grid } from '@material-ui/core';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';

import {
    Button,
    CustomInput,
    CustomMaterialTable,
    GridItem,
    RegularCard,
    SnackbarContent,
} from '../../components';
import psono_server from '../../services/api-server';
import store from '../../services/store';

const FileserverShard = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const { shard_id } = useParams();
    const [shard, setShard] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [active, setActive] = useState(true);
    const [errors, setErrors] = useState({});
    const [saved, setSaved] = useState(false);
    const credentials = () => [
        store.getState().user.token,
        store.getState().user.session_secret_key,
    ];

    const loadShard = () => {
        if (!shard_id) return;
        psono_server
            .admin_fileserver_shard(...credentials(), shard_id)
            .then((response) => {
                setShard(response.data);
                setTitle(response.data.title);
                setDescription(response.data.description);
                setActive(response.data.active);
            });
    };

    useEffect(() => {
        loadShard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shard_id]);

    const save = () => {
        setErrors({});
        setSaved(false);
        const request = shard_id
            ? psono_server.admin_update_fileserver_shard(
                  ...credentials(),
                  shard_id,
                  title,
                  description,
                  active
              )
            : psono_server.admin_create_fileserver_shard(
                  ...credentials(),
                  title,
                  description,
                  active
              );
        request.then(
            (response) => {
                if (!shard_id) {
                    history.replace('/fileserver-shard/' + response.data.id);
                    return;
                }
                setSaved(true);
                loadShard();
            },
            (response) => setErrors(response.data)
        );
    };

    const linkRows = !shard
        ? []
        : shard.links.map((link) => ({
              cluster_title: link.cluster_title,
              read: link.read ? t('YES') : t('NO'),
              write: link.write ? t('YES') : t('NO'),
              delete_capability: link.delete_capability ? t('YES') : t('NO'),
              allow_link_shares: link.allow_link_shares ? t('YES') : t('NO'),
          }));

    return (
        <Grid container>
            <GridItem xs={12} sm={12} md={12}>
                <RegularCard
                    cardTitle={t(
                        shard_id
                            ? 'EDIT_FILESERVER_SHARD'
                            : 'CREATE_FILESERVER_SHARD'
                    )}
                    cardSubtitle={t('FILESERVER_SHARD_DETAILS_INFO')}
                    content={
                        <Grid container>
                            {shard_id && shard && (
                                <>
                                    <GridItem xs={12} sm={6} md={6}>
                                        <CustomInput
                                            labelText={t('ID')}
                                            id="shard-id"
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: shard.id,
                                                disabled: true,
                                            }}
                                        />
                                    </GridItem>
                                    <GridItem xs={12} sm={6} md={6}>
                                        <CustomInput
                                            labelText={t('CREATED_AT')}
                                            id="create-date"
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: moment(
                                                    shard.create_date
                                                ).format('YYYY-MM-DD HH:mm:ss'),
                                                disabled: true,
                                            }}
                                        />
                                    </GridItem>
                                </>
                            )}
                            <GridItem xs={12} sm={12} md={12}>
                                <CustomInput
                                    labelText={t('TITLE')}
                                    id="title"
                                    formControlProps={{ fullWidth: true }}
                                    inputProps={{
                                        value: title,
                                        onChange: (event) =>
                                            setTitle(event.target.value),
                                    }}
                                    helperText={
                                        errors.title ? t(errors.title) : ''
                                    }
                                    error={Boolean(errors.title)}
                                />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={12}>
                                <CustomInput
                                    labelText={t('DESCRIPTION')}
                                    id="description"
                                    formControlProps={{ fullWidth: true }}
                                    inputProps={{
                                        value: description,
                                        multiline: true,
                                        onChange: (event) =>
                                            setDescription(event.target.value),
                                    }}
                                    helperText={
                                        errors.description
                                            ? t(errors.description)
                                            : ''
                                    }
                                    error={Boolean(errors.description)}
                                />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={12}>
                                <Checkbox
                                    checked={active}
                                    onChange={() => setActive(!active)}
                                />
                                {t('ACTIVE')}
                            </GridItem>
                        </Grid>
                    }
                    footer={
                        <div>
                            <Button
                                color="primary"
                                disabled={!title}
                                onClick={save}
                            >
                                {t(shard_id ? 'SAVE' : 'CREATE')}
                            </Button>
                            {saved && (
                                <SnackbarContent
                                    message={t('SAVE_SUCCESS')}
                                    color="success"
                                />
                            )}
                            {errors.non_field_errors && (
                                <SnackbarContent
                                    message={t(errors.non_field_errors)}
                                    color="danger"
                                />
                            )}
                        </div>
                    }
                />
            </GridItem>
            {shard_id && shard && (
                <GridItem xs={12} sm={12} md={12}>
                    <RegularCard
                        cardTitle={t('LINKED_CLUSTERS')}
                        content={
                            <CustomMaterialTable
                                title=""
                                columns={[
                                    {
                                        field: 'cluster_title',
                                        title: t('CLUSTER'),
                                    },
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
                                data={linkRows}
                            />
                        }
                    />
                </GridItem>
            )}
        </Grid>
    );
};

export default FileserverShard;
