import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';

import { Grid } from '@material-ui/core';

import {
    RegularCard,
    CustomInput,
    GridItem,
    Button,
    SnackbarContent,
} from '../../components/index';
import psono_server from '../../services/api-server';
import store from '../../services/store';

const PolicyCreate = (props) => {
    const { t } = useTranslation();
    const [errorsDict, setErrorsDict] = useState({});
    const [redirectTo, setRedirectTo] = useState('');
    const [title, setTitle] = useState('');

    const createPolicy = () => {
        setErrorsDict({});
        const onSuccess = (data) => {
            setRedirectTo('/policy/' + data.data.policy_id);
        };
        const onError = (data) => {
            setErrorsDict(data.data);
        };

        psono_server
            .admin_create_policy(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                title,
                {},
                0
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
                        cardTitle={t('CREATE_POLICY')}
                        cardSubtitle={t('ADD_NECESSARY_DETAILS_BELOW')}
                        content={
                            <div>
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText={t('TITLE')}
                                            id="title"
                                            helperText={
                                                errorsDict.hasOwnProperty(
                                                    'title'
                                                )
                                                    ? t(errorsDict['title'])
                                                    : ''
                                            }
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: title,
                                                onChange: (event) =>
                                                    setTitle(
                                                        event.target.value
                                                    ),
                                            }}
                                            error={errorsDict.hasOwnProperty(
                                                'title'
                                            )}
                                        />
                                    </GridItem>
                                </Grid>
                            </div>
                        }
                        footer={
                            <div>
                                <Button
                                    color="primary"
                                    onClick={createPolicy}
                                    disabled={!title}
                                >
                                    {t('CREATE_POLICY')}
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

export default PolicyCreate;
