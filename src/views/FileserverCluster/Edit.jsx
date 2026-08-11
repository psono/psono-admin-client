import React, { useEffect, useRef, useState } from 'react';
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

const FileserverCluster = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const { cluster_id } = useParams();
    const shardTableRef = useRef(null);
    const [cluster, setCluster] = useState(null);
    const [title, setTitle] = useState('');
    const [fileSizeLimit, setFileSizeLimit] = useState('0');
    const [links, setLinks] = useState({});
    const [errors, setErrors] = useState({});
    const [saved, setSaved] = useState(false);
    const [configuration, setConfiguration] = useState('');
    const credentials = () => [
        store.getState().user.token,
        store.getState().user.session_secret_key,
    ];

    const loadCluster = () => {
        if (!cluster_id) return Promise.resolve();
        return psono_server
            .admin_fileserver_cluster(...credentials(), cluster_id)
            .then((response) => {
                setCluster(response.data);
                setTitle(response.data.title);
                setFileSizeLimit(String(response.data.file_size_limit));
                const linkIndex = {};
                response.data.links.forEach((link) => {
                    linkIndex[link.shard_id] = link;
                });
                setLinks(linkIndex);
                shardTableRef.current && shardTableRef.current.onQueryChange();
            });
    };

    useEffect(() => {
        loadCluster();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cluster_id]);

    const save = () => {
        setErrors({});
        setSaved(false);
        const request = cluster_id
            ? psono_server.admin_update_fileserver_cluster(
                  ...credentials(),
                  cluster_id,
                  title,
                  fileSizeLimit
              )
            : psono_server.admin_create_fileserver_cluster(
                  ...credentials(),
                  title,
                  fileSizeLimit
              );
        request.then(
            (response) => {
                if (!cluster_id) {
                    history.replace('/fileserver-cluster/' + response.data.id);
                    return;
                }
                setSaved(true);
                loadCluster();
            },
            (response) => setErrors(response.data)
        );
    };

    const permissions = (link, change) => ({
        read: change.read === undefined ? link.read : change.read,
        write: change.write === undefined ? link.write : change.write,
        delete_capability:
            change.delete_capability === undefined
                ? link.delete_capability
                : change.delete_capability,
        allow_link_shares:
            change.allow_link_shares === undefined
                ? link.allow_link_shares
                : change.allow_link_shares,
    });

    const toggleLink = (shard) => {
        const link = links[shard.id];
        const request = link
            ? psono_server.admin_delete_fileserver_cluster_shard_link(
                  ...credentials(),
                  link.id
              )
            : psono_server.admin_create_fileserver_cluster_shard_link(
                  ...credentials(),
                  cluster_id,
                  shard.id,
                  {
                      read: true,
                      write: true,
                      delete_capability: true,
                      allow_link_shares: true,
                  }
              );
        request.then(loadCluster);
    };

    const togglePermission = (shard, field) => {
        const link = links[shard.id];
        psono_server
            .admin_update_fileserver_cluster_shard_link(
                ...credentials(),
                link.id,
                permissions(link, { [field]: !link[field] })
            )
            .then(loadCluster);
    };

    const loadShards = (query) => {
        const params = {
            page_size: query.pageSize,
            page: query.page,
            search: query.search,
        };
        if (query.orderBy) {
            params.ordering =
                (query.orderDirection === 'desc' ? '-' : '') +
                query.orderBy.field;
        }
        return psono_server
            .admin_fileserver_shard(...credentials(), undefined, params)
            .then((response) => ({
                data: response.data.shards.map((shard) => {
                    const link = links[shard.id];
                    const capability = (field) => (
                        <Checkbox
                            checked={Boolean(link && link[field])}
                            disabled={!link}
                            onChange={() => togglePermission(shard, field)}
                        />
                    );
                    return {
                        id: shard.id,
                        title: shard.title,
                        active: shard.active ? t('YES') : t('NO'),
                        linked: (
                            <Checkbox
                                checked={Boolean(link)}
                                onChange={() => toggleLink(shard)}
                            />
                        ),
                        read: capability('read'),
                        write: capability('write'),
                        delete_capability: capability('delete_capability'),
                        allow_link_shares: capability('allow_link_shares'),
                    };
                }),
                page: query.page,
                pageSize: query.pageSize,
                totalCount: response.data.count,
            }));
    };

    const validFileSize = /^\d+$/.test(fileSizeLimit);
    const generateConfiguration = () => {
        setErrors({});
        psono_server
            .admin_generate_fileserver_cluster_configuration(
                ...credentials(),
                cluster_id
            )
            .then(
                (response) => setConfiguration(response.data.configuration),
                (response) => setErrors(response.data)
            );
    };
    return (
        <Grid container>
            <GridItem xs={12} sm={12} md={12}>
                <RegularCard
                    cardTitle={t(
                        cluster_id
                            ? 'EDIT_FILESERVER_CLUSTER'
                            : 'CREATE_FILESERVER_CLUSTER'
                    )}
                    cardSubtitle={t('FILESERVER_CLUSTER_DETAILS_INFO')}
                    content={
                        <Grid container>
                            {cluster_id && cluster && (
                                <>
                                    <GridItem xs={12} sm={6} md={6}>
                                        <CustomInput
                                            labelText={t('ID')}
                                            id="cluster-id"
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: cluster.id,
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
                                                    cluster.create_date
                                                ).format('YYYY-MM-DD HH:mm:ss'),
                                                disabled: true,
                                            }}
                                        />
                                    </GridItem>
                                </>
                            )}
                            <GridItem xs={12} sm={6} md={6}>
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
                            <GridItem xs={12} sm={6} md={6}>
                                <CustomInput
                                    labelText={t('FILE_SIZE_LIMIT')}
                                    id="file-size-limit"
                                    formControlProps={{ fullWidth: true }}
                                    inputProps={{
                                        type: 'number',
                                        min: 0,
                                        value: fileSizeLimit,
                                        onChange: (event) =>
                                            setFileSizeLimit(
                                                event.target.value
                                            ),
                                    }}
                                    helperText={
                                        errors.file_size_limit
                                            ? t(errors.file_size_limit)
                                            : t('BYTES_ZERO_UNLIMITED')
                                    }
                                    error={
                                        Boolean(errors.file_size_limit) ||
                                        !validFileSize
                                    }
                                />
                            </GridItem>
                        </Grid>
                    }
                    footer={
                        <div>
                            <Button
                                color="primary"
                                disabled={!title || !validFileSize}
                                onClick={save}
                            >
                                {t(cluster_id ? 'SAVE' : 'CREATE')}
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
            {cluster_id && (
                <GridItem xs={12} sm={12} md={12}>
                    <RegularCard
                        cardTitle={t('SHARD_LINKS')}
                        cardSubtitle={t('SHARD_LINKS_INFO')}
                        content={
                            <CustomMaterialTable
                                tableRef={shardTableRef}
                                title=""
                                columns={[
                                    {
                                        field: 'linked',
                                        title: t('LINKED'),
                                        sorting: false,
                                    },
                                    { field: 'title', title: t('SHARD') },
                                    { field: 'active', title: t('ACTIVE') },
                                    {
                                        field: 'read',
                                        title: t('READ'),
                                        sorting: false,
                                    },
                                    {
                                        field: 'write',
                                        title: t('WRITE'),
                                        sorting: false,
                                    },
                                    {
                                        field: 'delete_capability',
                                        title: t('DELETE_CAPABILITY'),
                                        sorting: false,
                                    },
                                    {
                                        field: 'allow_link_shares',
                                        title: t('ALLOW_LINK_SHARES'),
                                        sorting: false,
                                    },
                                ]}
                                data={loadShards}
                            />
                        }
                    />
                </GridItem>
            )}
            {cluster_id && (
                <GridItem xs={12} sm={12} md={12}>
                    <RegularCard
                        cardTitle={t('FILESERVER_CONFIGURATION')}
                        cardSubtitle={t('FILESERVER_CONFIGURATION_INFO')}
                        content={
                            configuration ? (
                                <CustomInput
                                    labelText={t('CONFIGURATION')}
                                    id="fileserver-configuration"
                                    formControlProps={{ fullWidth: true }}
                                    inputProps={{
                                        value: configuration,
                                        multiline: true,
                                        rows: 12,
                                        readOnly: true,
                                    }}
                                />
                            ) : null
                        }
                        footer={
                            <Button
                                color="primary"
                                onClick={generateConfiguration}
                            >
                                {t('GENERATE_FILESERVER_CONFIGURATION')}
                            </Button>
                        }
                    />
                </GridItem>
            )}
        </Grid>
    );
};

export default FileserverCluster;
