import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';

import { Checkbox, Grid, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Autocomplete, {
    createFilterOptions,
} from '@material-ui/lab/Autocomplete';

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
import { hasCapabilityForTenantIds } from '../../services/authorization';

const useStyles = makeStyles(customInputStyle);
const filterOptions = createFilterOptions({ limit: 5 });

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
    const [tenantIds, setTenantIds] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [selectedTenants, setSelectedTenants] = useState([]);
    const [tenantSearch, setTenantSearch] = useState('');
    const [tenantsLoading, setTenantsLoading] = useState(false);
    const [createSuccess, setCreateSuccess] = useState(false);
    const authorization = store.getState().user.authorization;
    const createCapability = authorization.capabilities
        ? authorization.capabilities['users.create']
        : null;
    const tenantScopeRequired = Boolean(
        !authorization.is_superuser &&
            createCapability &&
            !createCapability.global
    );

    useEffect(() => {
        if (authorization.is_superuser) return;
        setTenants(
            (createCapability ? createCapability.tenant_ids : []).map((id) => ({
                id,
                name: id,
                is_active: true,
            }))
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!authorization.is_superuser) return undefined;

        let active = true;
        setTenantsLoading(true);
        const timer = setTimeout(() => {
            psono_server
                .admin_tenant(
                    store.getState().user.token,
                    store.getState().user.session_secret_key,
                    undefined,
                    { page_size: 5, page: 0, search: tenantSearch }
                )
                .then(
                    (response) => {
                        if (!active) return;
                        setTenants(response.data.tenants);
                        setTenantsLoading(false);
                    },
                    () => {
                        if (!active) return;
                        setTenants([]);
                        setTenantsLoading(false);
                    }
                );
        }, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantSearch]);

    const selectableTenants = [
        ...selectedTenants,
        ...tenants.filter(
            (tenant) =>
                !selectedTenants.some((selected) => selected.id === tenant.id)
        ),
    ];

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
        setCreateSuccess(false);
        const onSuccess = (data) => {
            if (
                hasCapabilityForTenantIds(
                    authorization,
                    'users.read',
                    tenantIds
                )
            ) {
                setRedirectTo('/user/' + data.data.id);
                return;
            }
            setCreateSuccess(true);
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
                requirePasswordChange,
                tenantIds
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
                                    {(authorization.is_superuser ||
                                        tenants.length > 0) && (
                                        <GridItem xs={12} sm={12} md={6}>
                                            <Autocomplete
                                                multiple
                                                autoHighlight
                                                filterSelectedOptions
                                                limitTags={5}
                                                filterOptions={
                                                    authorization.is_superuser
                                                        ? (options) => options
                                                        : filterOptions
                                                }
                                                inputValue={tenantSearch}
                                                loading={tenantsLoading}
                                                options={selectableTenants.filter(
                                                    (tenant) => tenant.is_active
                                                )}
                                                getOptionLabel={(tenant) =>
                                                    tenant.name
                                                }
                                                getOptionSelected={(
                                                    option,
                                                    value
                                                ) => option.id === value.id}
                                                value={selectedTenants}
                                                onChange={(
                                                    event,
                                                    nextTenants
                                                ) => {
                                                    setSelectedTenants(
                                                        nextTenants
                                                    );
                                                    setTenantIds(
                                                        nextTenants.map(
                                                            (tenant) =>
                                                                tenant.id
                                                        )
                                                    );
                                                    setTenantSearch('');
                                                }}
                                                onInputChange={(
                                                    event,
                                                    value,
                                                    reason
                                                ) => {
                                                    if (
                                                        reason === 'input' ||
                                                        reason === 'clear'
                                                    ) {
                                                        setTenantSearch(value);
                                                    }
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        fullWidth
                                                        margin="normal"
                                                        label={t('TENANTS')}
                                                        inputProps={{
                                                            ...params.inputProps,
                                                            autoComplete:
                                                                'new-password',
                                                        }}
                                                    />
                                                )}
                                            />
                                        </GridItem>
                                    )}
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
                                    disabled={
                                        !createUserPossible ||
                                        (tenantScopeRequired &&
                                            tenantIds.length === 0)
                                    }
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
                                {createSuccess && (
                                    <SnackbarContent
                                        message={t('SAVE_SUCCESS')}
                                        color="success"
                                    />
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
