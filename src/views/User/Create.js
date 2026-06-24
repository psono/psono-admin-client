import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';

import { Checkbox, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import {
    RegularCard,
    CustomInput,
    GridItem,
    Button,
    SnackbarContent,
} from '../../components/index';
import psono_server from '../../services/api-server';
import store from '../../services/store';
import i18n, { languages } from '../../i18n';
import SelectFieldLanguage from '../../components/SelectField/Language';
import customInputStyle from '../../assets/jss/material-dashboard-react/customInputStyle';

const useStyles = makeStyles(customInputStyle);

const getDefaultLanguage = () => {
    const detectedLanguages = [];
    if (typeof navigator !== 'undefined') {
        if (navigator.languages) {
            detectedLanguages.push(...navigator.languages);
        }
        detectedLanguages.push(navigator.language);
    }
    detectedLanguages.push(i18n.language, i18n.resolvedLanguage);

    for (const detectedLanguage of detectedLanguages) {
        if (!detectedLanguage) {
            continue;
        }

        const normalizedLanguage = detectedLanguage.replace(/_/g, '-');
        const candidates = [
            normalizedLanguage,
            normalizedLanguage.split('-')[0],
        ];
        for (const candidate of candidates) {
            const language = Object.values(languages).find(
                (language) =>
                    language.active &&
                    language.code.toLowerCase() === candidate.toLowerCase()
            );
            if (language) {
                return language.code;
            }
        }
    }

    return 'en';
};

const UserCreate = (props) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const [errorsDict, setErrorsDict] = useState({});
    const [redirectTo, setRedirectTo] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [language, setLanguage] = useState(getDefaultLanguage());
    const [requirePasswordChange, setRequirePasswordChange] = useState(false);
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [createUserPossible, setCreateUserPossible] = useState(false);

    const isCreateUserPossible = (username, email, password1, password2) => {
        const usernameValid =
            username.length > 2 && username.indexOf('@') !== -1;
        const emailValid = email.length > 2 && email.indexOf('@') !== -1;
        const passwordValid = password1.length > 0 && password1 === password2;

        const newErrorsDict = {};
        if (username && !usernameValid) {
            newErrorsDict['username'] = 'INVALID_USERNAME_FORMAT';
        }
        if (email && !emailValid) {
            newErrorsDict['email'] = 'INVALID_EMAIL_FORMAT';
        }
        if (password2 && password1 !== password2) {
            newErrorsDict['password2'] = 'PASSWORDS_DONT_MATCH';
        }
        setErrorsDict(newErrorsDict);

        return usernameValid && emailValid && passwordValid;
    };

    const onChangeUsername = (event) => {
        setUsername(event.target.value);
        setCreateUserPossible(
            isCreateUserPossible(
                event.target.value,
                email,
                password1,
                password2
            )
        );
    };

    const onChangeEmail = (event) => {
        setEmail(event.target.value);
        setCreateUserPossible(
            isCreateUserPossible(
                username,
                event.target.value,
                password1,
                password2
            )
        );
    };

    const onChangeLanguage = (value) => {
        setLanguage(value);
    };

    const onRequirePasswordChangeToggle = () => {
        setRequirePasswordChange(!requirePasswordChange);
    };

    const onChangePassword1 = (event) => {
        setPassword1(event.target.value);
        setCreateUserPossible(
            isCreateUserPossible(username, email, event.target.value, password2)
        );
    };

    const onChangePassword2 = (event) => {
        setPassword2(event.target.value);
        setCreateUserPossible(
            isCreateUserPossible(username, email, password1, event.target.value)
        );
    };

    const createUser = () => {
        setErrorsDict({});
        const onSuccess = (data) => {
            setRedirectTo('/user/' + data.data.id);
        };
        const onError = (data) => {
            setErrorsDict(data.data);
        };

        psono_server
            .admin_create_user(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                username,
                password1,
                email,
                language,
                requirePasswordChange
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
                        cardTitle={t('CREATE_USER')}
                        cardSubtitle={t('ADD_NECESSARY_DETAILS_BELOW')}
                        content={
                            <div>
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={6}>
                                        <CustomInput
                                            labelText={t('USERNAME')}
                                            id="username"
                                            helperText={
                                                errorsDict.hasOwnProperty(
                                                    'username'
                                                )
                                                    ? t(errorsDict['username'])
                                                    : ''
                                            }
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: username,
                                                onChange: onChangeUsername,
                                            }}
                                            error={errorsDict.hasOwnProperty(
                                                'username'
                                            )}
                                        />
                                    </GridItem>
                                    <GridItem xs={12} sm={12} md={6}>
                                        <CustomInput
                                            labelText={t('EMAIL')}
                                            id="email"
                                            helperText={
                                                errorsDict.hasOwnProperty(
                                                    'email'
                                                )
                                                    ? t(errorsDict['email'])
                                                    : ''
                                            }
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: email,
                                                onChange: onChangeEmail,
                                            }}
                                            error={errorsDict.hasOwnProperty(
                                                'email'
                                            )}
                                        />
                                    </GridItem>
                                    <GridItem xs={12} sm={12} md={6}>
                                        <CustomInput
                                            labelText={t('PASSWORD')}
                                            id="password1"
                                            helperText={
                                                errorsDict.hasOwnProperty(
                                                    'password'
                                                )
                                                    ? t(errorsDict['password'])
                                                    : ''
                                            }
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: password1,
                                                onChange: onChangePassword1,
                                                type: 'password',
                                            }}
                                            error={errorsDict.hasOwnProperty(
                                                'password'
                                            )}
                                        />
                                    </GridItem>
                                    <GridItem xs={12} sm={12} md={6}>
                                        <CustomInput
                                            labelText={t('PASSWORD_REPEAT')}
                                            id="password2"
                                            helperText={
                                                errorsDict.hasOwnProperty(
                                                    'password2'
                                                )
                                                    ? t(errorsDict['password2'])
                                                    : ''
                                            }
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: password2,
                                                onChange: onChangePassword2,
                                                type: 'password',
                                            }}
                                            error={errorsDict.hasOwnProperty(
                                                'password2'
                                            )}
                                        />
                                    </GridItem>
                                    <GridItem xs={12} sm={12} md={6}>
                                        <SelectFieldLanguage
                                            value={language}
                                            onChange={onChangeLanguage}
                                            fullWidth={true}
                                            required={true}
                                            margin="normal"
                                            helperText={
                                                errorsDict.hasOwnProperty(
                                                    'language'
                                                )
                                                    ? t(errorsDict['language'])
                                                    : ''
                                            }
                                            error={errorsDict.hasOwnProperty(
                                                'language'
                                            )}
                                        />
                                    </GridItem>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <div className={classes.checkbox}>
                                            <Checkbox
                                                tabIndex={1}
                                                checked={requirePasswordChange}
                                                onClick={
                                                    onRequirePasswordChangeToggle
                                                }
                                            />{' '}
                                            {t('REQUIRE_PASSWORD_CHANGE')}
                                        </div>
                                    </GridItem>
                                </Grid>
                            </div>
                        }
                        footer={
                            <div>
                                <Button
                                    color="primary"
                                    onClick={createUser}
                                    disabled={!createUserPossible}
                                >
                                    {t('CREATE_USER')}
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

export default UserCreate;
