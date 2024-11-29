import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { BarLoader } from 'react-spinners';
import { useHistory } from 'react-router-dom';

import { Grid, Checkbox, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Check } from '@material-ui/icons';
import InputAdornment from '@material-ui/core/InputAdornment';
import {
    RegularCard,
    Button,
    CustomInput,
    GridItem,
    SnackbarContent,
} from '../../components';

import action from '../../actions/boundActionCreators';
import helper from '../../services/helper';
import ivaltClient from '../../services/ivalt';
import webauthnService from '../../services/webauthn';
import converter from '../../services/converter';
import store from '../../services/store';
import iValtLogo from '../../assets/img/sc-logo.png';
const defaultTimer = 2 * 60;

const useStyles = makeStyles((theme) => ({
    wrapper: {
        width: '340px',
        'z-index': '4',
    },
    '@media (min-width: 960px)': {
        wrapper: {
            width: '540px',
        },
    },
    checked: {
        color: '#9c27b0',
    },
    checkedIcon: {
        width: '20px',
        height: '20px',
        border: '1px solid rgba(0, 0, 0, .54)',
        borderRadius: '3px',
    },
    uncheckedIcon: {
        width: '0px',
        height: '0px',
        padding: '10px',
        border: '1px solid rgba(0, 0, 0, .54)',
        borderRadius: '3px',
    },
    progress: {
        position: 'absolute',
        top: '104px',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
    },
}));

const LoginForm = (props) => {
    const classes = useStyles();
    let location = useLocation();
    const history = useHistory();
    const { t } = useTranslation();
    const [view, setView] = useState('default');
    const [username, setUsername] = useState(store.getState().user.username);
    const [password, setPassword] = useState('');
    const [server, setServer] = useState(store.getState().server.url);
    const [rememberMe, setRememberMe] = useState(
        store.getState().user.remember_me
    );
    const [providerId, setProviderId] = useState(0);
    const [trustDevice, setTrustDevice] = useState(
        store.getState().user.trust_device
    );
    const [loginLoading, setLoginLoading] = useState(false);
    const [domain, setDomain] = useState('');
    const [errors, setErrors] = useState([]);
    const [googleAuthenticator, setGoogleAuthenticator] = useState('');
    const [duo, setDuo] = useState('');
    const [decryptLoginDataFunction, setDecryptLoginDataFunction] =
        useState(null);
    const [yubikeyOtp, setYubikeyOtp] = useState('');
    const [multifactors, setMultifactors] = useState([]);
    const [loginType, setLoginType] = useState('');
    const [serverCheck, setServerCheck] = useState({});
    const [adminClientConfig, setAdminClientConfig] = useState({});
    const [timer, setTimer] = useState(defaultTimer);
    const [ivaltLoading, setIvaltLoading] = useState(false);
    const errorsResponses = {
        AUTHENTICATION_FAILED: t('IVALT_AUTH_FAILED'),
        BIOMETRIC_AUTH_REQUEST_SUCCESSFULLY_SENT: t('IVALT_AUTH_REQUEST_SENT'),
        INVALID_TIMEZONE: t('IVALT_INVALID_TIMEZONE'),
        INVALID_GEOFENCE: t('IVALT_INVALID_GEOFENCE'),
    };
    React.useEffect(() => {
        let timerInterval;
        let timeout;

        if (ivaltLoading) {
            timerInterval = setInterval(() => {
                if (timer <= 0) {
                    setIvaltLoading(false);
                    setTimer(defaultTimer);
                    clearInterval(timerInterval);
                    setErrors([t('IVALT_AUTH_TIMEOUT')]);

                    return;
                }
                if (timer % 2 == 0) {
                    validateIvalt();
                }
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        }

        return () => {
            clearInterval(timerInterval);
            clearTimeout(timeout);
        };
    }, [ivaltLoading, timer]);

    const validateIvalt = () => {
        ivaltClient.validateIvaltTwoFactor().then(
            (res) => {
                if (res.data.non_field_errors === undefined) {
                    setIvaltLoading(false);
                    setTimer(defaultTimer);

                    let requiredMultifactors = [...multifactors];
                    if (serverCheck.info.multifactor_enabled === false) {
                        helper.removeFromArray(
                            requiredMultifactors,
                            'ivalt_2fa'
                        );
                    } else {
                        requiredMultifactors = [];
                    }

                    setMultifactors(requiredMultifactors);
                } else if (
                    errorsResponses[res.data.non_field_errors[0]] !==
                        undefined &&
                    res.data.non_field_errors[0] !== 'AUTHENTICATION_FAILED'
                ) {
                    setErrors([errorsResponses[res.data.non_field_errors[0]]]);
                    setIvaltLoading(false);
                }
            },
            (error, res) => {
                console.log(error, 'ERROR RESPONSE');
            }
        );
    };

    React.useEffect(() => {
        props.get_config().then(onNewConfigLoaded);
    }, []);

    const handleToggleRememberMe = () => {
        setRememberMe(!rememberMe);
    };

    const handleToggleTrustDevice = () => {
        setTrustDevice(!trustDevice);
    };
    const onChangeYubikeyOTP = (event) => {
        setYubikeyOtp(event.target.value);
    };
    const onChangeDuo = (event) => {
        setDuo(event.target.value);
    };
    const onChangeGoogleAuthentication = (event) => {
        setGoogleAuthenticator(event.target.value);
    };
    const onChangeUsername = (event) => {
        setUsername(event.target.value);
    };
    const onChangePassword = (event) => {
        setPassword(event.target.value);
    };
    const onChangeServer = (event) => {
        setServer(event.target.value);
        setDomain(helper.get_domain(event.target.value));
    };

    const requirementCheckMfa = () => {
        if (!store.getState().user.token) {
            return;
        }
        if (multifactors.length === 0) {
            props.activateToken().then(() => {
                history.push('/dashboard');
                setLoginLoading(false);
            });
        } else {
            setLoginLoading(false);
            handleMfa();
        }
    };

    React.useEffect(() => {
        requirementCheckMfa(multifactors);
    }, [multifactors]);

    const verify_yubikey_otp = () => {
        props.yubikey_otp_verify(yubikeyOtp).then(
            () => {
                let requiredMultifactors = [...multifactors];
                if (serverCheck.info.multifactor_enabled === false) {
                    requiredMultifactors = [];
                } else {
                    helper.removeFromArray(
                        requiredMultifactors,
                        'yubikey_otp_2fa'
                    );
                }
                setMultifactors(requiredMultifactors);
            },
            (errors) => {
                setErrors(errors);
            }
        );
    };

    const verify_google_authenticator = () => {
        props.ga_verify(googleAuthenticator).then(
            () => {
                let requiredMultifactors = [...multifactors];
                if (serverCheck.info.multifactor_enabled === false) {
                    requiredMultifactors = [];
                } else {
                    helper.removeFromArray(
                        requiredMultifactors,
                        'google_authenticator_2fa'
                    );
                }
                setMultifactors(requiredMultifactors);
            },
            (errors) => {
                setErrors(errors);
            }
        );
    };

    const verify_duo = () => {
        let duo_code = duo;
        if (duo_code === '') {
            duo_code = undefined;
        }

        props.duo_verify(duo_code).then(
            () => {
                let requiredMultifactors = [...multifactors];
                if (serverCheck.info.multifactor_enabled === false) {
                    requiredMultifactors = [];
                } else {
                    helper.removeFromArray(requiredMultifactors, 'duo_2fa');
                }
                setMultifactors(requiredMultifactors);
            },
            (errors) => {
                setErrors(errors);
            }
        );
    };

    const show_ga_2fa_form = () => {
        setView('google_authenticator');
        setLoginLoading(false);
    };

    const show_yubikey_otp_2fa_form = () => {
        setView('yubikey_otp');
        setLoginLoading(false);
    };

    const verify_webauthn = () => {
        webauthnService.verifyWebauthnInit().then(
            async (webauthn) => {
                webauthn.options.challenge = Uint8Array.from(
                    webauthn.options.challenge,
                    (c) => c.charCodeAt(0)
                );
                for (
                    let i = 0;
                    i < webauthn.options.allowCredentials.length;
                    i++
                ) {
                    webauthn.options.allowCredentials[i]['id'] =
                        converter.base64ToArrayBuffer(
                            webauthn.options.allowCredentials[i]['id']
                                .replace(/-/g, '+')
                                .replace(/_/g, '/')
                        );
                }

                let credential;
                try {
                    credential = await navigator.credentials.get({
                        publicKey: webauthn.options,
                    });
                } catch (error) {
                    setView('default');
                    setLoginLoading(false);
                    return;
                }

                const convertedCredential = {
                    id: credential.id,
                    rawId: credential.id,
                    type: credential.type,
                    authenticatorAttachment: credential.authenticatorAttachment,
                    response: {
                        authenticatorData: converter.arrayBufferToBase64(
                            credential.response.authenticatorData
                        ),
                        clientDataJSON: converter.arrayBufferToBase64(
                            credential.response.clientDataJSON
                        ),
                        signature: converter.arrayBufferToBase64(
                            credential.response.signature
                        ),
                        userHandle: converter.arrayBufferToBase64(
                            credential.response.userHandle
                        ),
                    },
                };

                return webauthnService
                    .verifyWebauthn(JSON.stringify(convertedCredential))
                    .then(
                        (successful) => {
                            if (
                                serverCheck.info.multifactor_enabled === false
                            ) {
                                setMultifactors([]);
                            } else {
                                helper.removeFromArray(
                                    multifactors,
                                    'webauthn_2fa'
                                );
                                setMultifactors(multifactors);
                            }
                        },
                        (error) => {
                            console.log(error);
                            setErrors(['WEBAUTHN_FIDO2_TOKEN_NOT_FOUND']);
                        }
                    );
            },
            (error) => {
                setErrors(['WEBAUTHN_FIDO2_TOKEN_NOT_FOUND_FOR_THIS_ORIGIN']);
            }
        );
    };

    const show_webauthn_2fa_form = () => {
        setView('webauthn');
        setLoginLoading(false);
        verify_webauthn();
    };

    const show_duo_2fa_form = () => {
        setView('duo');
        setLoginLoading(false);
        verify_duo();
    };

    const handleMfa = () => {
        if (
            serverCheck.info.multifactor_enabled === false &&
            multifactors.length > 1
        ) {
            // show choose multifactor screen as only one is required to be solved
            setView('pick_second_factor');
            setLoginLoading(false);
        } else if (multifactors.indexOf('webauthn_2fa') !== -1) {
            show_webauthn_2fa_form();
        } else if (multifactors.indexOf('yubikey_otp_2fa') !== -1) {
            show_yubikey_otp_2fa_form();
        } else if (multifactors.indexOf('google_authenticator_2fa') !== -1) {
            show_ga_2fa_form();
        } else if (multifactors.indexOf('duo_2fa') !== -1) {
            show_duo_2fa_form();
        } else if (multifactors.indexOf('ivalt_2fa') !== -1) {
            setIvaltLoading(true);
            sendIvaltAuthRequest();
            showIvaltForm();
        } else {
            setView('default');
            setLoginLoading(false);
            setErrors([
                'Unknown multi-factor authentication requested by server.',
            ]);
            props.logout();
        }
    };

    const sendIvaltAuthRequest = () => {
        setErrors([]);
        ivaltClient.sendTwoFactorNotification().then(
            (createdIvalt) => {
                validateIvalt();
            },
            function (error) {
                if (error.hasOwnProperty('non_field_errors')) {
                    setErrors(error.non_field_errors);
                } else {
                    console.error(error);
                }
            }
        );
    };

    const showIvaltForm = () => {
        setView('ivalt');
        setLoginLoading(false);
    };

    const has_ldap_auth = (server_check) => {
        return (
            server_check.hasOwnProperty('info') &&
            server_check['info'].hasOwnProperty('authentication_methods') &&
            server_check['info']['authentication_methods'].indexOf('LDAP') !==
                -1
        );
    };

    const approveSendPlain = () => {
        return nextLoginStep(true, serverCheck);
    };

    const disapproveSendPlain = () => {
        return nextLoginStep(false, serverCheck);
    };

    const nextLoginStep = (sendPlain, serverCheck) => {
        let passwordCopy = password;
        setPassword('');

        return props
            .login(passwordCopy, serverCheck, sendPlain)
            .then(handleLogin, (result) => {
                setLoginLoading(false);
                if (result.hasOwnProperty('non_field_errors')) {
                    let errors = result.non_field_errors;
                    setView('default');
                    setErrors(errors);
                } else {
                    setView('default');
                    setErrors([result]);
                }
            });
    };

    const initiateLogin = () => {
        setLoginLoading(true);
        setErrors([]);
        setLoginType('');

        let parsedUrl = helper.parse_url(server);
        let fullUsername = helper.form_full_username(
            username,
            domain || parsedUrl['full_domain']
        );

        return props
            .initiateLogin(fullUsername, server, rememberMe, trustDevice)
            .then(
                (serverCheck) => {
                    setServerCheck(serverCheck);
                    action.setServerInfo(serverCheck.info);
                    if (serverCheck.status !== 'matched') {
                        setView(serverCheck.status);
                        setLoginLoading(false);
                    } else if (has_ldap_auth(serverCheck)) {
                        setView('ask_send_plain');
                        setLoginLoading(false);
                    } else {
                        return nextLoginStep(false, serverCheck);
                    }
                },
                (result) => {
                    if (result.hasOwnProperty('errors')) {
                        let errors = result.errors;
                        setErrors(errors);
                        setLoginLoading(false);
                    } else {
                        setErrors([result]);
                        setLoginLoading(false);
                    }
                }
            )
            .catch((result) => {
                setLoginLoading(false);
                return Promise.reject(result);
            });
    };

    const initiateSamlLogin = (providerId) => {
        setLoginLoading(true);
        setErrors([]);
        setLoginType('SAML');
        setProviderId(providerId);
        return props
            .initiateSamlLogin(server, rememberMe, trustDevice)
            .then(
                (result) => {
                    setServerCheck(result);
                    action.setServerInfo(result.info);
                    if (result.status !== 'matched') {
                        setView(result.status);
                    } else {
                        props
                            .get_saml_redirect_url(providerId)
                            .then((result) => {
                                window.location = result.saml_redirect_url;
                            });
                    }
                },
                (result) => {
                    if (result.hasOwnProperty('errors')) {
                        let errors = result.errors;
                        setErrors(errors);
                        setLoginLoading(false);
                    } else {
                        setErrors([result]);
                        setLoginLoading(false);
                    }
                }
            )
            .catch((result) => {
                setLoginLoading(false);
                return Promise.reject(result);
            });
    };

    const initiateOidcLogin = (providerId) => {
        setLoginLoading(true);
        setErrors([]);
        setLoginType('OIDC');
        setProviderId(providerId);
        return props
            .initiateOidcLogin(server, rememberMe, trustDevice)
            .then(
                (result) => {
                    setServerCheck(result);
                    action.setServerInfo(result.info);
                    if (result.status !== 'matched') {
                        setView(result.status);
                    } else {
                        props
                            .get_oidc_redirect_url(providerId)
                            .then((result) => {
                                window.location = result.oidc_redirect_url;
                            });
                    }
                },
                (result) => {
                    if (result.hasOwnProperty('errors')) {
                        let errors = result.errors;
                        setErrors(errors);
                        setLoginLoading(false);
                    } else {
                        setErrors([result]);
                        setLoginLoading(false);
                    }
                }
            )
            .catch((result) => {
                setLoginLoading(false);
                return Promise.reject(result);
            });
    };

    const approveHost = () => {
        props.approveHost(serverCheck.server_url, serverCheck.verify_key);

        if (loginType === 'SAML') {
            initiateSamlLogin(providerId);
        } else if (loginType === 'OIDC') {
            initiateOidcLogin(providerId);
        } else if (has_ldap_auth(serverCheck)) {
            setView('ask_send_plain');
            setLoginLoading(false);
        } else {
            let passwordCopy = password;
            setPassword('');

            props
                .login(passwordCopy, serverCheck)
                .then(handleLogin, (result) => {
                    setLoginLoading(false);
                    if (result.hasOwnProperty('non_field_errors')) {
                        let errors = result.non_field_errors;
                        setErrors(errors);
                    } else {
                        console.log(result);
                        setErrors([result]);
                    }
                });
        }
    };

    const cancel = () => {
        setView('default');
        setPassword('');
        setErrors([]);
        setDecryptLoginDataFunction(null);
        props.logout();
    };

    const decryptData = () => {
        const loginDetails = decryptLoginDataFunction(password);

        if (loginDetails.hasOwnProperty('required_multifactors')) {
            const requiredMultifactors = loginDetails['required_multifactors'];
            setMultifactors(requiredMultifactors);
        }
        if (loginDetails.hasOwnProperty('require_password')) {
            setView('default');
            setErrors(['PASSWORD_INCORRECT']);
        } else {
            setDecryptLoginDataFunction(null);
        }
    };

    const handleLogin = (loginDetails) => {
        if (loginDetails.hasOwnProperty('required_multifactors')) {
            const requiredMultifactors = loginDetails['required_multifactors'];
            setMultifactors(requiredMultifactors);
        }
        if (loginDetails.hasOwnProperty('require_password')) {
            setDecryptLoginDataFunction(() => loginDetails['require_password']);
        }
    };

    const onNewConfigLoaded = (adminClientConfig) => {
        setServer(server || adminClientConfig.backend_servers[0].url);
        setDomain(adminClientConfig.backend_servers[0].domain);
        setAdminClientConfig(adminClientConfig);
        if (location.pathname.startsWith('/saml/token/')) {
            const samlTokenId = location.pathname.replace('/saml/token/', '');
            props.checkHost(store.getState().server.url).then((result) => {
                setServerCheck(result);
                action.setServerInfo(result.info);
                props.samlLogin(samlTokenId).then(handleLogin, (result) => {
                    setLoginLoading(false);
                    if (result.hasOwnProperty('non_field_errors')) {
                        let errors = result.non_field_errors;
                        setView('default');
                        setErrors(errors);
                    } else {
                        setView('default');
                        setErrors([result]);
                    }
                });
            });
        }

        if (location.pathname.startsWith('/oidc/token/')) {
            const oidcTokenId = location.pathname.replace('/oidc/token/', '');
            props.checkHost(store.getState().server.url).then((result) => {
                setServerCheck(result);
                action.setServerInfo(result.info);
                props.oidcLogin(oidcTokenId).then(handleLogin, (result) => {
                    setLoginLoading(false);
                    if (result.hasOwnProperty('non_field_errors')) {
                        let errors = result.non_field_errors;
                        setView('default');
                        setErrors(errors);
                    } else {
                        setView('default');
                        setErrors([result]);
                    }
                });
            });
        }
    };
    const errorGridItem = (
        <GridItem xs={8} sm={8} md={8} style={{ marginTop: '20px' }}>
            {errors.map((prop, index) => {
                return (
                    <SnackbarContent
                        message={t(prop)}
                        color="danger"
                        key={index}
                    />
                );
            })}
        </GridItem>
    );

    if (decryptLoginDataFunction !== null) {
        return (
            <div className={classes.wrapper}>
                <RegularCard
                    cardTitle={t('VERIFY_USER')}
                    cardSubtitle={t('ENTER_PASSWORD_TO_DECRYPT_YOUR_DATASTORE')}
                    content={
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                            autoComplete="off"
                        >
                            <Grid container>
                                <GridItem xs={12} sm={12} md={12}>
                                    <CustomInput
                                        labelText={t('PASSWORD')}
                                        id="password"
                                        formControlProps={{
                                            fullWidth: true,
                                        }}
                                        inputProps={{
                                            value: password,
                                            onChange: onChangePassword,
                                            type: 'password',
                                        }}
                                    />
                                </GridItem>
                            </Grid>
                            <Grid container>
                                <GridItem
                                    xs={12}
                                    sm={4}
                                    md={12}
                                    style={{ marginTop: '20px' }}
                                >
                                    <Button
                                        color="primary"
                                        onClick={decryptData}
                                        type="submit"
                                    >
                                        {t('DECRYPT')}
                                    </Button>
                                    <Button
                                        color="transparent"
                                        onClick={cancel}
                                    >
                                        {t('CANCEL')}
                                    </Button>
                                </GridItem>
                            </Grid>
                            <Grid container>{errorGridItem}</Grid>
                        </form>
                    }
                />
            </div>
        );
    }

    if (view === 'default') {
        const saml_provider = adminClientConfig.saml_provider || [];
        const oidc_provider = adminClientConfig.oidc_provider || [];
        const authentication_methods =
            adminClientConfig.authentication_methods || [];
        const server_style = adminClientConfig.allow_custom_server
            ? {}
            : { display: 'none' };
        const regular_login_style =
            authentication_methods.includes('AUTHKEY') ||
            authentication_methods.includes('LDAP')
                ? {}
                : { display: 'none' };

        return (
            <div className={classes.wrapper}>
                <RegularCard
                    cardTitle={t('LOGIN')}
                    cardSubtitle={t('ENTER_YOUR_USERNAME_AND_PASSWORD')}
                    content={
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                            autoComplete="off"
                        >
                            <Grid container style={regular_login_style}>
                                <GridItem xs={12} sm={12} md={12}>
                                    <CustomInput
                                        labelText={t('USERNAME')}
                                        id="username"
                                        formControlProps={{
                                            fullWidth: true,
                                        }}
                                        inputProps={{
                                            value: username,
                                            onChange: onChangeUsername,
                                            endAdornment:
                                                domain &&
                                                !username.includes('@') ? (
                                                    <InputAdornment position="end">
                                                        {'@' + domain}
                                                    </InputAdornment>
                                                ) : null,
                                        }}
                                    />
                                </GridItem>
                            </Grid>
                            <Grid container style={regular_login_style}>
                                <GridItem xs={12} sm={12} md={12}>
                                    <CustomInput
                                        labelText={t('PASSWORD')}
                                        id="password"
                                        formControlProps={{
                                            fullWidth: true,
                                        }}
                                        inputProps={{
                                            value: password,
                                            onChange: onChangePassword,
                                            type: 'password',
                                        }}
                                    />
                                </GridItem>
                            </Grid>
                            {saml_provider.map((provider, i) => {
                                const initiateSamlLoginHelper = () => {
                                    return initiateSamlLogin(
                                        provider.provider_id
                                    );
                                };
                                return (
                                    <Grid container key={i}>
                                        <GridItem
                                            xs={4}
                                            sm={4}
                                            md={4}
                                            style={{ marginTop: '20px' }}
                                        >
                                            {provider.title}
                                            <Button
                                                color="primary"
                                                onClick={
                                                    initiateSamlLoginHelper
                                                }
                                                type="submit"
                                                id="sad"
                                            >
                                                <span
                                                    style={
                                                        !loginLoading
                                                            ? {}
                                                            : {
                                                                  display:
                                                                      'none',
                                                              }
                                                    }
                                                >
                                                    {provider.button_name}
                                                </span>
                                                <BarLoader
                                                    color={'#FFF'}
                                                    height={17}
                                                    width={37}
                                                    loading={loginLoading}
                                                />
                                            </Button>
                                        </GridItem>
                                    </Grid>
                                );
                            })}
                            {oidc_provider.map((provider, i) => {
                                const initiateOidcLoginHelper = () => {
                                    return initiateOidcLogin(
                                        provider.provider_id
                                    );
                                };
                                return (
                                    <Grid container key={i}>
                                        <GridItem
                                            xs={4}
                                            sm={4}
                                            md={4}
                                            style={{ marginTop: '20px' }}
                                        >
                                            {provider.title}
                                            <Button
                                                color="primary"
                                                onClick={
                                                    initiateOidcLoginHelper
                                                }
                                                type="submit"
                                                id="sad"
                                            >
                                                <span
                                                    style={
                                                        !loginLoading
                                                            ? {}
                                                            : {
                                                                  display:
                                                                      'none',
                                                              }
                                                    }
                                                >
                                                    {provider.button_name}
                                                </span>
                                                <BarLoader
                                                    color={'#FFF'}
                                                    height={17}
                                                    width={37}
                                                    loading={loginLoading}
                                                />
                                            </Button>
                                        </GridItem>
                                    </Grid>
                                );
                            })}

                            <Grid container>
                                <GridItem xs={12} sm={12} md={12}>
                                    <Checkbox
                                        tabIndex={1}
                                        checked={rememberMe}
                                        onClick={handleToggleRememberMe}
                                        checkedIcon={
                                            <Check
                                                className={classes.checkedIcon}
                                            />
                                        }
                                        icon={
                                            <Check
                                                className={
                                                    classes.uncheckedIcon
                                                }
                                            />
                                        }
                                        classes={{
                                            checked: classes.checked,
                                        }}
                                    />{' '}
                                    {t('REMEMBER_USERNAME_AND_SERVER')}
                                </GridItem>
                            </Grid>
                            <Grid container>
                                <GridItem xs={12} sm={12} md={12}>
                                    <Checkbox
                                        tabIndex={2}
                                        checked={trustDevice}
                                        onClick={handleToggleTrustDevice}
                                        checkedIcon={
                                            <Check
                                                className={classes.checkedIcon}
                                            />
                                        }
                                        icon={
                                            <Check
                                                className={
                                                    classes.uncheckedIcon
                                                }
                                            />
                                        }
                                        classes={{
                                            checked: classes.checked,
                                        }}
                                    />{' '}
                                    {t('TRUST_DEVICE')}
                                </GridItem>
                            </Grid>
                            <Grid container style={regular_login_style}>
                                <GridItem
                                    xs={4}
                                    sm={4}
                                    md={4}
                                    style={{ marginTop: '20px' }}
                                >
                                    <Button
                                        color="primary"
                                        onClick={initiateLogin}
                                        type="submit"
                                        disabled={
                                            !(username && password) ||
                                            loginLoading
                                        }
                                    >
                                        <span
                                            style={
                                                !loginLoading
                                                    ? {}
                                                    : { display: 'none' }
                                            }
                                        >
                                            {t('LOGIN')}
                                        </span>
                                        <BarLoader
                                            color={'#FFF'}
                                            height={17}
                                            width={37}
                                            loading={loginLoading}
                                        />
                                    </Button>
                                </GridItem>
                            </Grid>
                            <Grid container>{errorGridItem}</Grid>
                            <Grid container style={server_style}>
                                <GridItem xs={12} sm={12} md={12}>
                                    <CustomInput
                                        labelText={t('SERVER')}
                                        id="server"
                                        formControlProps={{
                                            fullWidth: true,
                                        }}
                                        inputProps={{
                                            value: server,
                                            onChange: onChangeServer,
                                        }}
                                    />
                                </GridItem>
                            </Grid>
                        </form>
                    }
                />
            </div>
        );
    }
    if (view === 'new_server') {
        return (
            <div className={classes.wrapper}>
                <RegularCard
                    cardTitle={t('NEW_SERVER')}
                    cardSubtitle={t('VERIFY_FINGERPRINT_AND_APPROVE')}
                    content={
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                            autoComplete="off"
                        >
                            <Grid container>
                                <GridItem xs={12} sm={12} md={12}>
                                    <CustomInput
                                        labelText={t('FINGERPRINT')}
                                        id="server_fingerprint"
                                        formControlProps={{
                                            fullWidth: true,
                                        }}
                                        inputProps={{
                                            value: serverCheck.verify_key,
                                            disabled: true,
                                            multiline: true,
                                        }}
                                    />
                                    <SnackbarContent
                                        message={t(
                                            'IT_APPEARS_THAT_YOU_WANT_TO_CONNECT'
                                        )}
                                        close
                                        color="info"
                                    />
                                </GridItem>
                            </Grid>
                            <Grid container>
                                <GridItem
                                    xs={12}
                                    sm={4}
                                    md={12}
                                    style={{ marginTop: '20px' }}
                                >
                                    <Button
                                        color="primary"
                                        onClick={approveHost}
                                        type="submit"
                                    >
                                        {t('APPROVE')}
                                    </Button>
                                    <Button
                                        color="transparent"
                                        onClick={cancel}
                                    >
                                        {t('CANCEL')}
                                    </Button>
                                </GridItem>
                            </Grid>
                            <Grid container>{errorGridItem}</Grid>
                        </form>
                    }
                />
            </div>
        );
    }
    if (view === 'unsupported_server_version') {
        return (
            <div className={classes.wrapper}>
                <RegularCard
                    cardTitle={t('SERVER_UNSUPPORTED')}
                    content={
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                            autoComplete="off"
                        >
                            <Grid container>
                                <GridItem xs={12} sm={12} md={12}>
                                    <SnackbarContent
                                        message={t(
                                            'THE_VERSION_OF_THE_SERVER_IS_TOO_OLD_AND_NOT_SUPPORTED_PLEASE_UPGRADE'
                                        )}
                                        close
                                        color="warning"
                                    />
                                </GridItem>
                            </Grid>
                            <Grid container>
                                <GridItem
                                    xs={12}
                                    sm={4}
                                    md={12}
                                    style={{ marginTop: '20px' }}
                                >
                                    <Button
                                        color="primary"
                                        onClick={cancel}
                                        type="submit"
                                    >
                                        {t('BACK')}
                                    </Button>
                                </GridItem>
                            </Grid>
                            <Grid container>{errorGridItem}</Grid>
                        </form>
                    }
                />
            </div>
        );
    }
    if (view === 'signature_changed') {
        return (
            <div className={classes.wrapper}>
                <RegularCard
                    cardTitle={t('SERVER_SIGNATURE_CHANGED')}
                    cardSubtitle={t('THE_FINGERPRINT_OF_THE_SERVER_CHANGED')}
                    content={
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                            autoComplete="off"
                        >
                            <Grid container>
                                <GridItem xs={12} sm={12} md={12}>
                                    <CustomInput
                                        labelText={t(
                                            'FINGERPRINT_OF_THE_NEW_SERVER'
                                        )}
                                        id="server_fingerprint"
                                        formControlProps={{
                                            fullWidth: true,
                                        }}
                                        inputProps={{
                                            value: serverCheck.verify_key,
                                            disabled: true,
                                            multiline: true,
                                        }}
                                    />
                                </GridItem>
                            </Grid>
                            <Grid container>
                                <GridItem xs={12} sm={12} md={12}>
                                    <CustomInput
                                        labelText={t(
                                            'FINGERPRINT_OF_THE_OLD_SERVER'
                                        )}
                                        id="server_fingerprint"
                                        formControlProps={{
                                            fullWidth: true,
                                        }}
                                        inputProps={{
                                            value: serverCheck.verify_key_old,
                                            disabled: true,
                                            multiline: true,
                                        }}
                                    />
                                    <SnackbarContent
                                        message={
                                            <>
                                                {t(
                                                    'THE_SIGNATURE_OF_THE_SERVER_CHANGED'
                                                )}
                                                <br />
                                                <br />
                                                <strong>
                                                    {t(
                                                        'CONTACT_THE_OWNER_OF_THE_SERVER'
                                                    )}
                                                </strong>
                                            </>
                                        }
                                        close
                                        color="warning"
                                    />
                                </GridItem>
                            </Grid>
                            <Grid container>
                                <GridItem
                                    xs={12}
                                    sm={4}
                                    md={12}
                                    style={{ marginTop: '20px' }}
                                >
                                    <Button
                                        color="primary"
                                        onClick={cancel}
                                        type="submit"
                                    >
                                        {t('CANCEL')}
                                    </Button>
                                    <Button
                                        color="transparent"
                                        onClick={approveHost}
                                    >
                                        {t('IGNORE_AND_CONTINUE')}
                                    </Button>
                                </GridItem>
                            </Grid>
                            <Grid container>{errorGridItem}</Grid>
                        </form>
                    }
                />
            </div>
        );
    }
    if (view === 'webauthn') {
        return (
            <div className={classes.wrapper}>
                <RegularCard
                    cardTitle={t('WEBAUTHN')}
                    cardSubtitle={t('SOLVE_THE_WEBAUTHN_CHALLENGE')}
                    content={
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                            autoComplete="off"
                        >
                            <Grid container>
                                <GridItem xs={12} sm={12} md={12}>
                                    <SnackbarContent
                                        message={t(
                                            'SOLVE_THE_WEBAUTHN_CHALLENGE_EXPLAINED'
                                        )}
                                        close
                                        color="info"
                                    />
                                </GridItem>
                            </Grid>
                            <Grid container>
                                <GridItem
                                    xs={12}
                                    sm={4}
                                    md={12}
                                    style={{ marginTop: '20px' }}
                                >
                                    <Button
                                        color="transparent"
                                        onClick={cancel}
                                    >
                                        {t('CANCEL')}
                                    </Button>
                                </GridItem>
                            </Grid>
                            <Grid container>{errorGridItem}</Grid>
                        </form>
                    }
                />
            </div>
        );
    }

    if (view === 'pick_second_factor') {
        return (
            <div className={classes.wrapper}>
                <RegularCard
                    cardTitle={t('SECOND_FACTOR')}
                    cardSubtitle={t('PICK_SECOND_FACTOR')}
                    content={
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                            autoComplete="off"
                        >
                            <Grid container>
                                {multifactors.indexOf(
                                    'google_authenticator_2fa'
                                ) !== -1 && (
                                    <GridItem
                                        xs={12}
                                        sm={12}
                                        md={12}
                                        style={{ marginTop: '20px' }}
                                    >
                                        <Button
                                            color="primary"
                                            onClick={show_ga_2fa_form}
                                            type="submit"
                                            fullWidth
                                        >
                                            {t('GOOGLE_AUTHENTICATOR')}
                                        </Button>
                                    </GridItem>
                                )}
                                {multifactors.indexOf('yubikey_otp_2fa') !==
                                    -1 && (
                                    <GridItem
                                        xs={12}
                                        sm={12}
                                        md={12}
                                        style={{ marginTop: '20px' }}
                                    >
                                        <Button
                                            color="primary"
                                            onClick={show_yubikey_otp_2fa_form}
                                            type="submit"
                                            fullWidth
                                        >
                                            {t('YUBIKEY')}
                                        </Button>
                                    </GridItem>
                                )}
                                {multifactors.indexOf('webauthn_2fa') !==
                                    -1 && (
                                    <GridItem
                                        xs={12}
                                        sm={12}
                                        md={12}
                                        style={{ marginTop: '20px' }}
                                    >
                                        <Button
                                            color="primary"
                                            onClick={show_webauthn_2fa_form}
                                            type="submit"
                                            fullWidth
                                        >
                                            {t('FIDO2_WEBAUTHN')}
                                        </Button>
                                    </GridItem>
                                )}
                                {multifactors.indexOf('duo_2fa') !== -1 && (
                                    <GridItem
                                        xs={12}
                                        sm={12}
                                        md={12}
                                        style={{ marginTop: '20px' }}
                                    >
                                        <Button
                                            color="primary"
                                            onClick={show_duo_2fa_form}
                                            type="submit"
                                            fullWidth
                                        >
                                            {t('DUO')}
                                        </Button>
                                    </GridItem>
                                )}
                            </Grid>

                            <Grid container>
                                <GridItem
                                    xs={12}
                                    sm={4}
                                    md={12}
                                    style={{ marginTop: '20px' }}
                                >
                                    <Button
                                        color="transparent"
                                        onClick={cancel}
                                        fullWidth
                                    >
                                        {t('CANCEL')}
                                    </Button>
                                </GridItem>
                            </Grid>
                            <Grid container>{errorGridItem}</Grid>
                        </form>
                    }
                />
            </div>
        );
    }

    if (view === 'ivalt') {
        return (
            <div className={classes.wrapper}>
                <RegularCard
                    cardTitle={t('IVALT_AUTHENTICATION')}
                    cardSubtitle={t('VERIFY_IVALT_AUTHENTICATION')}
                    content={
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                            autoComplete="off"
                        >
                            <Grid container>
                                <GridItem xs={12} sm={12} md={12}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'nowrap',
                                            alignContent: 'center',
                                            justifyContent: 'center !important',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            marginBottom: '20px',
                                        }}
                                    >
                                        <img
                                            src={iValtLogo}
                                            alt="ivalt"
                                            style={{ width: 50 }}
                                        />
                                        <CircularProgress
                                            size={60}
                                            className={classes.progress}
                                            style={{
                                                animation: 'unset',
                                                zIndex: 2,
                                            }}
                                        />
                                    </div>
                                </GridItem>
                                <GridItem xs={12} sm={12} md={12}>
                                    <SnackbarContent
                                        message={t(
                                            'IVALT_AUTHENTICATION_REQUEST_SENT_PLEASE_CHECK_APP'
                                        )}
                                        close
                                        color="info"
                                    />
                                </GridItem>
                                <GridItem xs={12} sm={12} md={12}>
                                    {ivaltLoading ? (
                                        <div
                                            style={{
                                                marginTop: '20px',
                                                textAlign: 'center',
                                                color: 'red',
                                            }}
                                        >
                                            <p>
                                                <Trans
                                                    i18nKey="TIME_REMAINING_TIMER_SECONDS"
                                                    timer={timer}
                                                >
                                                    Time remaining: {{ timer }}{' '}
                                                    seconds
                                                </Trans>
                                            </p>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => {
                                                setIvaltLoading(true);
                                                sendIvaltAuthRequest();
                                            }}
                                        >
                                            {t('RETRY')}
                                        </Button>
                                    )}
                                </GridItem>
                            </Grid>
                        </form>
                    }
                />
            </div>
        );
    }

    if (view === 'yubikey_otp') {
        return (
            <div className={classes.wrapper}>
                <RegularCard
                    cardTitle={t('YUBIKEY_AUTHENTICATION')}
                    cardSubtitle={t('ENTER_YUBIKEY_BELOW')}
                    content={
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                            autoComplete="off"
                        >
                            <Grid container>
                                <GridItem xs={12} sm={12} md={12}>
                                    <CustomInput
                                        labelText={t('YUBIKEY')}
                                        id="yubikey_otp"
                                        formControlProps={{
                                            fullWidth: true,
                                        }}
                                        inputProps={{
                                            value: yubikeyOtp,
                                            onChange: onChangeYubikeyOTP,
                                        }}
                                    />
                                </GridItem>
                            </Grid>
                            <Grid container>
                                <GridItem
                                    xs={12}
                                    sm={4}
                                    md={12}
                                    style={{ marginTop: '20px' }}
                                >
                                    <Button
                                        color="primary"
                                        onClick={verify_yubikey_otp}
                                        type="submit"
                                    >
                                        {t('SEND')}
                                    </Button>
                                    <Button
                                        color="transparent"
                                        onClick={cancel}
                                    >
                                        {t('CANCEL')}
                                    </Button>
                                </GridItem>
                            </Grid>
                            <Grid container>{errorGridItem}</Grid>
                        </form>
                    }
                />
            </div>
        );
    }

    if (view === 'google_authenticator') {
        return (
            <div className={classes.wrapper}>
                <RegularCard
                    cardTitle={t('GOOGLE_AUTHENTICATION')}
                    cardSubtitle={t('ENTER_GOOGLE_AUTHENTICATOR_BELOW')}
                    content={
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                            autoComplete="off"
                        >
                            <Grid container>
                                <GridItem xs={12} sm={12} md={12}>
                                    <CustomInput
                                        labelText={t('GOOGLE_AUTHENTICATOR')}
                                        id="google_authenticator"
                                        formControlProps={{
                                            fullWidth: true,
                                        }}
                                        inputProps={{
                                            value: googleAuthenticator,
                                            onChange:
                                                onChangeGoogleAuthentication,
                                        }}
                                    />
                                </GridItem>
                            </Grid>
                            <Grid container>
                                <GridItem
                                    xs={12}
                                    sm={4}
                                    md={12}
                                    style={{ marginTop: '20px' }}
                                >
                                    <Button
                                        color="primary"
                                        onClick={verify_google_authenticator}
                                        type="submit"
                                    >
                                        {t('SEND')}
                                    </Button>
                                    <Button
                                        color="transparent"
                                        onClick={cancel}
                                    >
                                        {t('CANCEL')}
                                    </Button>
                                </GridItem>
                            </Grid>
                            <Grid container>{errorGridItem}</Grid>
                        </form>
                    }
                />
            </div>
        );
    }

    if (view === 'duo') {
        return (
            <div className={classes.wrapper}>
                <RegularCard
                    cardTitle={t('DUO_AUTHENTICATION')}
                    cardSubtitle={t('PLEASE_APPROVE_ON_PHONE_OR_ENTER_CODE')}
                    content={
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                            autoComplete="off"
                        >
                            <Grid container>
                                <GridItem xs={12} sm={12} md={12}>
                                    <CustomInput
                                        labelText={t('DUO_CODE')}
                                        id="duo"
                                        formControlProps={{
                                            fullWidth: true,
                                        }}
                                        inputProps={{
                                            value: duo,
                                            onChange: onChangeDuo,
                                        }}
                                    />
                                </GridItem>
                            </Grid>
                            <Grid container>
                                <GridItem
                                    xs={12}
                                    sm={4}
                                    md={12}
                                    style={{ marginTop: '20px' }}
                                >
                                    <Button
                                        color="primary"
                                        onClick={verify_duo}
                                        type="submit"
                                    >
                                        {t('SEND')}
                                    </Button>
                                    <Button
                                        color="transparent"
                                        onClick={cancel}
                                    >
                                        {t('CANCEL')}
                                    </Button>
                                </GridItem>
                            </Grid>
                            <Grid container>{errorGridItem}</Grid>
                        </form>
                    }
                />
            </div>
        );
    }

    if (view === 'ask_send_plain') {
        return (
            <div className={classes.wrapper}>
                <RegularCard
                    cardTitle={t('SERVER_INFO')}
                    cardSubtitle={t('SERVER_ASKS_FOR_YOUR_PLAINTEXT_PASSWORD')}
                    content={
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                            autoComplete="off"
                        >
                            <Grid container>
                                <GridItem xs={12} sm={12} md={12}>
                                    <SnackbarContent
                                        color="warning"
                                        message={t(
                                            'ACCEPTING_THIS_WILL_SEND_YOUR_PLAIN_PASSWORD'
                                        )}
                                    />
                                </GridItem>
                            </Grid>
                            <Grid container>
                                <GridItem
                                    xs={12}
                                    sm={4}
                                    md={12}
                                    style={{ marginTop: '20px' }}
                                >
                                    <Button
                                        color="warning"
                                        onClick={approveSendPlain}
                                        type="submit"
                                    >
                                        {t('APPROVE_UNSAFE')}
                                    </Button>
                                    <Button
                                        color="success"
                                        onClick={disapproveSendPlain}
                                    >
                                        {t('DISAPPROVE_UNSAFE')}
                                    </Button>
                                </GridItem>
                            </Grid>
                            <Grid container>{errorGridItem}</Grid>
                        </form>
                    }
                />
            </div>
        );
    }
};

export default LoginForm;
