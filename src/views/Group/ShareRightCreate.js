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

    React.useEffect(() => {
        const is_ee_server = props.state.server.type === 'EE';

        if (!is_ee_server) {
            history.push('/dashboard');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const createGroup = () => {
        const onSuccess = (data) => {
            history.push('/group/' + params.group_id);
        };
        const onError = (data) => {
            setErrorsDict(data.data);
        };

        psono_server
            .admin_create_share_right(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                params.group_id,
                folderName,
                read,
                write,
                grant
            )
            .then(onSuccess, onError);
    };

    return (
        <div>
            <Grid container>
                <GridItem xs={12} sm={12} md={12}>
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
                </GridItem>
            </Grid>
        </div>
    );
};

export default ShareRightGroupCreate;
