import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Checkbox, Grid } from '@material-ui/core';

import {
    RegularCard,
    CustomInput,
    GridItem,
    Button,
    SnackbarContent,
} from '../../components/index';
import psono_server from '../../services/api-server';
import { makeStyles } from '@material-ui/core/styles';
import customInputStyle from '../../assets/jss/material-dashboard-react/customInputStyle';
import store from '../../services/store';
import moment from 'moment/moment';
import { CheckBox, CheckBoxOutlineBlank } from '@material-ui/icons';
import cryptoLibrary from '../../services/cryptoLibrary';
import { hasCapabilityForTenantIds } from '../../services/authorization';

const useStyles = makeStyles(customInputStyle);

const ShareRightGroupCreate = (props) => {
    const { t } = useTranslation();
    const params = useParams();
    const classes = useStyles();
    const history = useHistory();
    const [errorsDict, setErrorsDict] = useState({});
    const [folderName, setFolderName] = useState('');
    const [read, setRead] = useState(true);
    const [write, setWrite] = useState(true);
    const [grant, setGrant] = useState(true);
    const [groupSecretKey, setGroupSecretKey] = useState('');
    const [missingGroupUserSecret, setMissingGroupUserSecret] = useState(false);

    React.useEffect(() => {
        const is_ee_server = props.state.server.type === 'EE';

        if (!is_ee_server) {
            history.push('/dashboard');
            return;
        }
        loadGroup();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function loadGroup() {
        psono_server
            .admin_group(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                params.group_id
            )
            .then((response) => {
                const group = response.data;
                if (
                    !hasCapabilityForTenantIds(
                        store.getState().user.authorization,
                        'groups.shares.manage',
                        group.tenant_ids
                    )
                ) {
                    history.replace('/group/' + params.group_id);
                    return;
                }
                if (!group.own_group_user_secret) {
                    setMissingGroupUserSecret(true);
                    return;
                }

                let decryptedGroupSecretKey;
                if (
                    group.own_group_user_secret.secret_key_type === 'asymmetric'
                ) {
                    decryptedGroupSecretKey =
                        cryptoLibrary.decryptDataPublicKey(
                            group.own_group_user_secret.secret_key,
                            group.own_group_user_secret.secret_key_nonce,
                            group.public_key,
                            store.getState().user.user_private_key
                        );
                } else {
                    decryptedGroupSecretKey = cryptoLibrary.decryptData(
                        group.own_group_user_secret.secret_key,
                        group.own_group_user_secret.secret_key_nonce,
                        store.getState().user.user_secret_key
                    );
                }

                setGroupSecretKey(decryptedGroupSecretKey);
            });
    }

    const createGroup = () => {
        if (missingGroupUserSecret || !groupSecretKey) {
            return;
        }

        const onSuccess = (data) => {
            history.push('/group/' + params.group_id);
        };
        const onError = (data) => {
            setErrorsDict(data.data);
        };

        const shareSecretKey = cryptoLibrary.generateSecretKey();
        const encryptedShareData = cryptoLibrary.encryptData(
            JSON.stringify({ name: folderName }),
            shareSecretKey
        );

        const encryptedShareSecretKey = cryptoLibrary.encryptData(
            shareSecretKey,
            groupSecretKey
        );
        const encryptedTitle = cryptoLibrary.encryptData(
            folderName,
            groupSecretKey
        );
        const encryptedType = cryptoLibrary.encryptData(
            'folder',
            groupSecretKey
        );

        psono_server
            .adminCreateShareRight(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                params.group_id,
                read,
                write,
                grant,
                encryptedShareData['text'],
                encryptedShareData['nonce'],
                encryptedShareSecretKey['text'],
                encryptedShareSecretKey['nonce'],
                encryptedTitle['text'],
                encryptedTitle['nonce'],
                encryptedType['text'],
                encryptedType['nonce']
            )
            .then(onSuccess, onError);
    };

    return (
        <div>
            <Grid container>
                <GridItem xs={12} sm={12} md={12}>
                    {missingGroupUserSecret ? (
                        <RegularCard
                            cardTitle={t('CREATE_SHARE_RIGHT')}
                            cardSubtitle={t('CREATE_SHARE_RIGHT_DETAILS')}
                            content={
                                <SnackbarContent
                                    message={t(
                                        'NO_GROUP_USER_SECRETS_FOUND_FOR_THIS_GROUP'
                                    )}
                                    color="danger"
                                />
                            }
                            footer={
                                <div>
                                    <Button
                                        color="primary"
                                        onClick={() =>
                                            history.push(
                                                '/group/' + params.group_id
                                            )
                                        }
                                    >
                                        {t('BACK')}
                                    </Button>
                                </div>
                            }
                        />
                    ) : (
                        <RegularCard
                            cardTitle={t('CREATE_SHARE_RIGHT')}
                            cardSubtitle={t('CREATE_SHARE_RIGHT_DETAILS')}
                            content={
                                <div>
                                    <Grid container>
                                        <GridItem xs={12} sm={12} md={12}>
                                            <CustomInput
                                                labelText={t('FOLDER_NAME')}
                                                id="groupname"
                                                helperText={
                                                    errorsDict.hasOwnProperty(
                                                        'name'
                                                    )
                                                        ? errorsDict['name']
                                                        : ''
                                                }
                                                formControlProps={{
                                                    fullWidth: true,
                                                }}
                                                inputProps={{
                                                    value: folderName,
                                                    onChange: (event) => {
                                                        setFolderName(
                                                            event.target.value
                                                        );
                                                    },
                                                }}
                                                error={errorsDict.hasOwnProperty(
                                                    'name'
                                                )}
                                            />
                                        </GridItem>
                                        <GridItem xs={12} sm={4} md={4}>
                                            <div className={classes.checkbox}>
                                                <Checkbox
                                                    tabIndex={1}
                                                    checked={read}
                                                    onClick={(event) => {
                                                        setRead(!read);
                                                    }}
                                                />{' '}
                                                {t('READ')}
                                            </div>
                                        </GridItem>
                                        <GridItem xs={12} sm={4} md={4}>
                                            <div className={classes.checkbox}>
                                                <Checkbox
                                                    tabIndex={1}
                                                    checked={write}
                                                    onClick={(event) => {
                                                        setWrite(!write);
                                                    }}
                                                />{' '}
                                                {t('WRITE')}
                                            </div>
                                        </GridItem>
                                        <GridItem xs={12} sm={4} md={4}>
                                            <div className={classes.checkbox}>
                                                <Checkbox
                                                    tabIndex={1}
                                                    checked={grant}
                                                    onClick={(event) => {
                                                        setGrant(!grant);
                                                    }}
                                                />{' '}
                                                {t('ADMIN')}
                                            </div>
                                        </GridItem>
                                    </Grid>
                                </div>
                            }
                            footer={
                                <div>
                                    <Button
                                        color="primary"
                                        onClick={createGroup}
                                        disabled={!folderName}
                                    >
                                        {t('CREATE')}
                                    </Button>
                                    {errorsDict.hasOwnProperty(
                                        'non_field_errors'
                                    ) ? (
                                        <SnackbarContent
                                            message={t(
                                                errorsDict['non_field_errors']
                                            )}
                                            color="danger"
                                        />
                                    ) : (
                                        ''
                                    )}
                                </div>
                            }
                        />
                    )}
                </GridItem>
            </Grid>
        </div>
    );
};

export default ShareRightGroupCreate;
