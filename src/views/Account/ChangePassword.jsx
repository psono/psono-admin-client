import React, { useState } from 'react';
import { Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import {
    Button,
    RegularCard,
    CustomInput,
    GridItem,
    SnackbarContent,
} from '../../components';
import SelectFieldLanguage from '../../components/SelectField/Language';
import { languages } from '../../i18n';
import userService from '../../services/user';

const ChangePassword = () => {
    const { t, i18n } = useTranslation();
    const requirePasswordChange = useSelector(
        (state) => state.user.requirePasswordChange
    );
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordRepeat, setNewPasswordRepeat] = useState('');
    const [errors, setErrors] = useState([]);
    const [msgs, setMsgs] = useState([]);
    const [languageErrors, setLanguageErrors] = useState([]);
    const [languageMsgs, setLanguageMsgs] = useState([]);

    const selectedLanguage =
        !i18n.language || i18n.language in languages
            ? i18n.language
            : i18n.resolvedLanguage;

    const save = () => {
        setErrors([]);
        setMsgs([]);

        userService
            .saveNewPassword(newPassword, newPasswordRepeat, oldPassword)
            .then(
                (result) => {
                    setOldPassword('');
                    setNewPassword('');
                    setNewPasswordRepeat('');
                    setMsgs(result.msgs || ['SAVE_SUCCESS']);
                },
                (result) => {
                    setOldPassword('');
                    setErrors(result.errors || ['OLD_PASSWORD_INCORRECT']);
                }
            );
    };

    const saveLanguage = (value) => {
        setLanguageErrors([]);
        setLanguageMsgs([]);

        i18n.changeLanguage(value).then(() => {
            userService.saveNewLanguage(value).then(
                (result) => {
                    setLanguageMsgs(result.msgs || ['SAVE_SUCCESS']);
                },
                (result) => {
                    if (result.data && result.data.language) {
                        setLanguageErrors(result.data.language);
                    } else if (result.data && result.data.errors) {
                        setLanguageErrors(result.data.errors);
                    } else if (result.data) {
                        setLanguageErrors([String(result.data)]);
                    } else {
                        setLanguageErrors(['Error']);
                    }
                }
            );
        });
    };

    return (
        <div>
            <Grid container>
                <GridItem xs={12} sm={12} md={12}>
                    <RegularCard
                        cardTitle={t('LANGUAGE')}
                        cardSubtitle={t('LANGUAGE_DESCRIPTION')}
                        content={
                            <div>
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={6}>
                                        <SelectFieldLanguage
                                            value={selectedLanguage}
                                            onChange={saveLanguage}
                                            fullWidth={true}
                                            required={true}
                                            margin="normal"
                                        />
                                    </GridItem>
                                </Grid>
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={12}>
                                        {languageErrors.map((prop) => {
                                            return (
                                                <SnackbarContent
                                                    message={t(prop)}
                                                    color="danger"
                                                    key={`language-error-${prop}`}
                                                />
                                            );
                                        })}
                                        {languageMsgs.map((prop) => {
                                            return (
                                                <SnackbarContent
                                                    message={t(prop)}
                                                    color="info"
                                                    key={`language-msg-${prop}`}
                                                />
                                            );
                                        })}
                                    </GridItem>
                                </Grid>
                            </div>
                        }
                    />
                </GridItem>
                <GridItem xs={12} sm={12} md={12}>
                    <RegularCard
                        cardTitle={t('CHANGE_PASSWORD')}
                        cardSubtitle={t('CHANGE_PASSWORD_DESCRIPTION')}
                        content={
                            <div>
                                {requirePasswordChange && (
                                    <Grid container>
                                        <GridItem xs={12} sm={12} md={12}>
                                            <SnackbarContent
                                                message={t(
                                                    'ADMINISTRATOR_REQUIRES_PASSWORD_CHANGE'
                                                )}
                                                color="danger"
                                            />
                                        </GridItem>
                                    </Grid>
                                )}
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText={t('OLD_PASSWORD')}
                                            id="old_password"
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: oldPassword,
                                                onChange: (event) =>
                                                    setOldPassword(
                                                        event.target.value
                                                    ),
                                                type: 'password',
                                            }}
                                        />
                                    </GridItem>
                                </Grid>
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText={t('NEW_PASSWORD')}
                                            id="new_password"
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: newPassword,
                                                onChange: (event) =>
                                                    setNewPassword(
                                                        event.target.value
                                                    ),
                                                type: 'password',
                                            }}
                                        />
                                    </GridItem>
                                </Grid>
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText={t('NEW_PASSWORD_REPEAT')}
                                            id="new_password_repeat"
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: newPasswordRepeat,
                                                onChange: (event) =>
                                                    setNewPasswordRepeat(
                                                        event.target.value
                                                    ),
                                                type: 'password',
                                            }}
                                        />
                                    </GridItem>
                                </Grid>
                                <Grid container>
                                    <GridItem
                                        xs={12}
                                        sm={12}
                                        md={12}
                                        style={{ marginTop: '20px' }}
                                    >
                                        {errors.map((prop) => {
                                            return (
                                                <SnackbarContent
                                                    message={t(prop)}
                                                    color="danger"
                                                    key={`error-${prop}`}
                                                />
                                            );
                                        })}
                                        {msgs.map((prop) => {
                                            return (
                                                <SnackbarContent
                                                    message={t(prop)}
                                                    color="info"
                                                    key={`msg-${prop}`}
                                                />
                                            );
                                        })}
                                    </GridItem>
                                </Grid>
                            </div>
                        }
                        footer={
                            <Button
                                color="primary"
                                onClick={save}
                                disabled={
                                    !(
                                        oldPassword &&
                                        newPassword &&
                                        newPasswordRepeat
                                    )
                                }
                            >
                                {t('SAVE')}
                            </Button>
                        }
                    />
                </GridItem>
            </Grid>
        </div>
    );
};

export default ChangePassword;
