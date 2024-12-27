import React, { useState } from 'react';
import { Checkbox, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';

import {
    RegularCard,
    CustomInput,
    GridItem,
    Button,
    SnackbarContent,
} from '../../components/index';
import psono_server from '../../services/api-server';
import customInputStyle from '../../assets/jss/material-dashboard-react/customInputStyle';
import store from '../../services/store';

const useStyles = makeStyles(customInputStyle);

const GroupCreate = (props) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const [errorsDict, setErrorsDict] = useState({});
    const [redirectTo, setRedirectTo] = useState('');
    const [groupName, setGroupName] = useState('');
    const [autoCreateFolder, setAutoCreateFolder] = useState(false);

    React.useEffect(() => {
        const is_ee_server = store.getState().server.type === 'EE';

        if (!is_ee_server) {
            setRedirectTo('/dashboard');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onChangeGroupName = (event) => {
        setGroupName(event.target.value);
    };

    const createGroup = () => {
        const onSuccess = (data) => {
            setRedirectTo('/group/' + data.data.id);
        };
        const onError = (data) => {
            setErrorsDict(data.data);
        };

        psono_server
            .admin_create_group(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                groupName,
                autoCreateFolder
            )
            .then(onSuccess, onError);
    };

    if (redirectTo) {
        return <Redirect to={redirectTo} />;
    }

    return (
        <div>
            <Grid container>
                <GridItem xs={12} sm={12} md={12}>
                    <RegularCard
                        cardTitle={t('CREATE_GROUP')}
                        cardSubtitle={t('ADD_NECESSARY_DETAILS_BELOW')}
                        content={
                            <div>
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText={t('GROUP_NAME')}
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
                                                value: groupName,
                                                onChange: onChangeGroupName,
                                            }}
                                            error={errorsDict.hasOwnProperty(
                                                'name'
                                            )}
                                        />
                                    </GridItem>
                                    <GridItem xs={12} sm={6} md={4}>
                                        <div className={classes.checkbox}>
                                            <Checkbox
                                                tabIndex={1}
                                                checked={autoCreateFolder}
                                                onClick={(event) => {
                                                    setAutoCreateFolder(
                                                        !autoCreateFolder
                                                    );
                                                }}
                                            />{' '}
                                            {t('AUTOMATICALLY_CREATE_FOLDER')}
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
                                    disabled={
                                        groupName.length <= 2 ||
                                        groupName.indexOf('@') !== -1
                                    }
                                >
                                    {t('CREATE_GROUP')}
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

export default GroupCreate;
