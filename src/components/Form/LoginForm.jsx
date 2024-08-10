import React from 'react';
import PropTypes from 'prop-types';
import {
    withStyles,
    Grid,
    Checkbox,
    CircularProgress,
} from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import { BarLoader } from 'react-spinners';
import { Check } from '@material-ui/icons';
import InputAdornment from '@material-ui/core/InputAdornment';
import { Redirect } from 'react-router-dom';
import {
    RegularCard,
    Button,
    CustomInput,
    GridItem,
    SnackbarContent,
} from '../../components';

import helper from '../../services/helper';
import webauthnService from '../../services/webauthn';
import converter from '../../services/converter';
import store from '../../services/store';
import iValtLogo from '../../assets/img/sc-logo.png';
const defaultTimer = 2 * 60;
const style = {
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
};

class LoginForm extends React.Component {
    state = {
        view: 'default',
        providerId: 0,
        loginType: '',
        username: this.props.state.user.username,
        password: '',
        server: this.props.state.server.url,
        domain: '',
        remember_me: this.props.state.user.remember_me,
        trust_device: this.props.state.user.trust_device,
        loginPossible: false,
        loginLoading: false,
        errors: [],
        loggedIn: this.props.state.user.isLoggedIn,
        server_info: {},
        admin_client_config: {},
        multifactors: [],
        yubikey_otp: '',
        duo: '',
        google_authenticator: '',
        duo_request: false,
        timer: defaultTimer,
        ivaltLoading: false,
        timerActive: false,
        isTimeUp: false,
    };

    startTimer = () => {
        this.setState({ timerActive: true, isTimeUp: false });
        const interval = setInterval(() => {
            this.setState((prevState) => {
                if (prevState.timer <= 0) {
                    clearInterval(interval);
                    return { timer: 0, timerActive: false, isTimeUp: true }; // Stop timer
                }
                return { timer: prevState.timer - 1 };
            });
        }, 1000);
    };
    handleRetry = () => {
        this.setState({ timer: 120 }, this.startTimer); // Reset timer and start
        this.sendIvaltAuthRequest();
    };

    handleToggleRememberMe = () => () => {
        this.setState({ remember_me: !this.state.remember_me });
    };

    handleToggleTrustDevice = () => () => {
        this.setState({ trust_device: !this.state.trust_device });
    };
    manageButtonState = () => {
        if (this.state.username && this.state.password) {
            this.setState({ loginPossible: true });
        } else {
            this.setState({ loginPossible: false });
        }
    };
    onChangeYubikeyOTP = (event) => {
        this.setState({ yubikey_otp: event.target.value });
    };
    onChangeDuo = (event) => {
        this.setState({ duo: event.target.value });
    };
    onChangeGoogleAuthentication = (event) => {
        this.setState({ google_authenticator: event.target.value });
    };
    onChangeUsername = (event) => {
        this.setState({ username: event.target.value });
        // wrapping manageButtonState in timeout so that psono's autofill works
        setTimeout(() => this.manageButtonState(), 0);
    };
    onChangePassword = (event) => {
        this.setState({ password: event.target.value });
        // wrapping manageButtonState in timeout so that psono's autofill works
        setTimeout(() => this.manageButtonState(), 0);
    };
    onChangeServer = (event) => {
        this.setState({
            server: event.target.value,
            domain: helper.get_domain(event.target.value),
        });
        this.manageButtonState();
    };

    requirement_check_mfa = () => {
        let multifactors = this.state.multifactors;
        if (multifactors.length === 0) {
            this.props.activate_token().then(() => {
                this.setState({
                    loggedIn: true,
                    loginLoading: false,
                });
            });
        } else {
            this.setState({
                loginLoading: false,
            });
            this.handle_mfa();
        }
    };

    verify_yubikey_otp = () => {
        let multifactors = this.state.multifactors;

        this.props.yubikey_otp_verify(this.state.yubikey_otp).then(
            () => {
                if (this.state.server_info.info.multifactor_enabled === false) {
                    multifactors = [];
                } else {
                    helper.remove_from_array(multifactors, 'yubikey_otp_2fa');
                }
                this.setState({ multifactors: multifactors });
                this.requirement_check_mfa();
            },
            (errors) => {
                this.setState({ errors });
            }
        );
    };

    verify_google_authenticator = () => {
        let multifactors = this.state.multifactors;

        this.props.ga_verify(this.state.google_authenticator).then(
            () => {
                if (this.state.server_info.info.multifactor_enabled === false) {
                    multifactors = [];
                } else {
                    helper.remove_from_array(
                        multifactors,
                        'google_authenticator_2fa'
                    );
                }
                this.setState({ multifactors: multifactors });
                this.requirement_check_mfa();
            },
            (errors) => {
                this.setState({ errors });
            }
        );
    };

    verify_duo = () => {
        let multifactors = this.state.multifactors;
        let duo_code = this.state.duo;
        if (duo_code === '') {
            duo_code = undefined;
        }

        this.props.duo_verify(duo_code).then(
            () => {
                if (this.state.server_info.info.multifactor_enabled === false) {
                    multifactors = [];
                } else {
                    helper.remove_from_array(multifactors, 'duo_2fa');
                }
                this.setState({ multifactors: multifactors });
                this.requirement_check_mfa();
            },
            (errors) => {
                this.setState({ errors });
            }
        );
    };

    show_ga_2fa_form = () => {
        this.setState({
            view: 'google_authenticator',
            loginLoading: false,
        });
    };

    show_yubikey_otp_2fa_form = () => {
        this.setState({
            view: 'yubikey_otp',
            loginLoading: false,
        });
    };

    verify_webauthn = () => {
        let multifactors = this.state.multifactors;
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
                    this.setState({
                        view: 'default',
                        loginLoading: false,
                    });
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
                                this.state.server_info.info
                                    .multifactor_enabled === false
                            ) {
                                multifactors = [];
                            } else {
                                helper.remove_from_array(
                                    multifactors,
                                    'webauthn_2fa'
                                );
                            }
                            this.setState({ multifactors: multifactors });
                            this.requirement_check_mfa();
                        },
                        (error) => {
                            console.log(error);
                            this.setState({
                                errors: ['WEBAUTHN_FIDO2_TOKEN_NOT_FOUND'],
                            });
                        }
                    );
            },
            (error) => {
                this.setState({
                    errors: ['WEBAUTHN_FIDO2_TOKEN_NOT_FOUND_FOR_THIS_ORIGIN'],
                });
            }
        );
    };

    show_webauthn_2fa_form = () => {
        this.setState({
            view: 'webauthn',
            loginLoading: false,
        });
        this.verify_webauthn();
    };

    show_duo_2fa_form = () => {
        this.setState({
            view: 'duo',
            loginLoading: false,
        });
        this.verify_duo();
    };

    show_ivalt_2fa_form = () => {
        this.setState({
            view: 'ivalt',
            loginLoading: false,
        });
        this.sendIvaltAuthRequest();
    };

    sendIvaltAuthRequest = () => {
        this.setState({
            errors: [],
        });
        this.setState({ timerActive: true });
        this.startTimer();
        this.props.ivalt_notify('notification').then(
            (createdIvalt) => {
                this.validateIvalt();
            },
            function (error) {
                if (error.hasOwnProperty('non_field_errors')) {
                    this.setState({
                        errors: error.non_field_errors,
                    });
                } else {
                    console.error(error);
                }
            }
        );
    };

    validateIvalt = () => {
        this.props.validate_ivalt_2fa('verification').then(
            (res) => {
                if (res.data.non_field_errors === undefined) {
                    let multifactors = this.state.multifactors;
                    helper.remove_from_array(multifactors, 'ivalt_2fa');
                    this.setState({ multifactors: multifactors });
                    this.requirement_check_mfa();
                    console.log(res.data.non_field_errors, 'SUCCESS');
                } else if (
                    this.state.errorsResponses[res.data.non_field_errors[0]] !==
                        undefined &&
                    res.data.non_field_errors[0] !== 'AUTHENTICATION_FAILED'
                ) {
                    console.log(res.data.non_field_errors[0], 'KOI ERROR');
                    this.setState({
                        errors: [
                            this.state.errorsResponses[
                                res.data.non_field_errors[0]
                            ],
                        ],
                        timerActive: false,
                    });
                } else {
                    if (!this.state.isTimeUp) {
                        setTimeout(() => {
                            this.validateIvalt();
                        }, 1000);
                    }
                }
            },
            (error, res) => {
                console.log(error, 'ERROR RESPONSE');
            }
        );
    };

    handle_mfa = () => {
        let multifactors = this.state.multifactors;
        if (
            this.state.server_info.info.multifactor_enabled === false &&
            multifactors.length > 1
        ) {
            // show choose multifactor screen as only one is required to be solved
            this.setState({
                view: 'pick_second_factor',
                loginLoading: false,
            });
        } else if (multifactors.indexOf('webauthn_2fa') !== -1) {
            this.show_webauthn_2fa_form();
        } else if (multifactors.indexOf('yubikey_otp_2fa') !== -1) {
            this.show_yubikey_otp_2fa_form();
        } else if (multifactors.indexOf('google_authenticator_2fa') !== -1) {
            this.show_ga_2fa_form();
        } else if (multifactors.indexOf('duo_2fa') !== -1) {
            this.show_duo_2fa_form();
        } else if (multifactors.indexOf('ivalt_2fa') !== -1) {
            this.show_ivalt_2fa_form();
        } else {
            this.setState({
                view: 'default',
                errors: [
                    'Unknown multi-factor authentication requested by server.',
                ],
                loginLoading: false,
            });
            this.logout();
        }
    };

    has_ldap_auth = (server_check) => {
        return (
            server_check.hasOwnProperty('info') &&
            server_check['info'].hasOwnProperty('authentication_methods') &&
            server_check['info']['authentication_methods'].indexOf('LDAP') !==
                -1
        );
    };

    approve_send_plain = () => {
        return this.next_login_step(true);
    };

    disapprove_send_plain = () => {
        return this.next_login_step(false);
    };

    next_login_step = (send_plain) => {
        let password = this.state.password;
        this.setState({ password: '' });

        return this.props
            .login(password, this.state.server_info, send_plain)
            .then(
                (required_multifactors) => {
                    this.setState({
                        multifactors: required_multifactors,
                    });
                    this.requirement_check_mfa();
                },
                (result) => {
                    this.setState({ loginLoading: false });
                    if (result.hasOwnProperty('non_field_errors')) {
                        let errors = result.non_field_errors;
                        this.setState({
                            view: 'default',
                            errors,
                        });
                    } else {
                        this.setState({
                            view: 'default',
                            errors: [result],
                        });
                    }
                }
            );
    };

    initiate_login = () => {
        this.setState({
            loginLoading: true,
            errors: [],
            loginType: '',
        });

        let parsedUrl = helper.parse_url(this.state.server);
        let fullUsername = helper.form_full_username(
            this.state.username,
            this.state.domain || parsedUrl['full_domain']
        );

        return this.props
            .initiate_login(
                fullUsername,
                this.state.server,
                this.state.remember_me,
                this.state.trust_device
            )
            .then(
                (result) => {
                    this.setState({ server_info: result });
                    this.props.actions.set_server_info(result.info);
                    if (result.status !== 'matched') {
                        this.setState({ view: result.status });
                    } else if (this.has_ldap_auth(result)) {
                        this.setState({
                            view: 'ask_send_plain',
                            loginLoading: false,
                        });
                    } else {
                        return this.next_login_step(false);
                    }
                },
                (result) => {
                    if (result.hasOwnProperty('errors')) {
                        let errors = result.errors;
                        this.setState({ errors, loginLoading: false });
                    } else {
                        this.setState({
                            errors: [result],
                            loginLoading: false,
                        });
                    }
                }
            )
            .catch((result) => {
                this.setState({ loginLoading: false });
                return Promise.reject(result);
            });
    };

    initiate_saml_login = (providerId) => {
        this.setState({
            loginLoading: true,
            errors: [],
            loginType: 'SAML',
            providerId,
        });
        return this.props
            .initiate_saml_login(
                this.state.server,
                this.state.remember_me,
                this.state.trust_device
            )
            .then(
                (result) => {
                    this.setState({ server_info: result });
                    this.props.actions.set_server_info(result.info);
                    if (result.status !== 'matched') {
                        this.setState({ view: result.status });
                    } else {
                        this.props
                            .get_saml_redirect_url(providerId)
                            .then((result) => {
                                window.location = result.saml_redirect_url;
                            });
                    }
                },
                (result) => {
                    if (result.hasOwnProperty('errors')) {
                        let errors = result.errors;
                        this.setState({ errors, loginLoading: false });
                    } else {
                        this.setState({
                            errors: [result],
                            loginLoading: false,
                        });
                    }
                }
            )
            .catch((result) => {
                this.setState({ loginLoading: false });
                return Promise.reject(result);
            });
    };

    initiate_oidc_login = (providerId) => {
        this.setState({
            loginLoading: true,
            errors: [],
            loginType: 'OIDC',
            providerId,
        });
        return this.props
            .initiate_oidc_login(
                this.state.server,
                this.state.remember_me,
                this.state.trust_device
            )
            .then(
                (result) => {
                    this.setState({ server_info: result });
                    this.props.actions.set_server_info(result.info);
                    if (result.status !== 'matched') {
                        this.setState({ view: result.status });
                    } else {
                        this.props
                            .get_oidc_redirect_url(providerId)
                            .then((result) => {
                                window.location = result.oidc_redirect_url;
                            });
                    }
                },
                (result) => {
                    if (result.hasOwnProperty('errors')) {
                        let errors = result.errors;
                        this.setState({ errors, loginLoading: false });
                    } else {
                        this.setState({
                            errors: [result],
                            loginLoading: false,
                        });
                    }
                }
            )
            .catch((result) => {
                this.setState({ loginLoading: false });
                return Promise.reject(result);
            });
    };

    approve_host = () => {
        this.props.approve_host(
            this.state.server_info.server_url,
            this.state.server_info.verify_key
        );

        if (this.state.loginType === 'SAML') {
            this.initiate_saml_login(this.state.providerId);
        } else if (this.state.loginType === 'OIDC') {
            this.initiate_oidc_login(this.state.providerId);
        } else if (this.has_ldap_auth(this.state.server_info)) {
            this.setState({
                view: 'ask_send_plain',
                loginLoading: false,
            });
        } else {
            let password = this.state.password;
            this.setState({ password: '' });

            this.props.login(password, this.state.server_info).then(
                (required_multifactors) => {
                    this.setState({ multifactors: required_multifactors });
                    this.requirement_check_mfa();
                },
                (result) => {
                    this.setState({ loginLoading: false });
                    if (result.hasOwnProperty('non_field_errors')) {
                        let errors = result.non_field_errors;
                        this.setState({ errors: errors });
                    } else {
                        console.log(result);
                        this.setState({ errors: [result] });
                    }
                }
            );
            this.setState({ password: '' });
        }
    };

    cancel = () => {
        this.setState({
            view: 'default',
            password: '',
            errors: [],
        });
        this.props.logout();
    };

    onNewConfigLoaded = (admin_client_config) => {
        this.setState({
            server:
                this.state.server || admin_client_config.backend_servers[0].url,
            domain: admin_client_config.backend_servers[0].domain,
            admin_client_config: admin_client_config,
        });

        if (this.props.location.pathname.startsWith('/saml/token/')) {
            const saml_token_id = this.props.location.pathname.replace(
                '/saml/token/',
                ''
            );
            this.props
                .check_host(store.getState().server.url)
                .then((result) => {
                    this.setState({ server_info: result });
                    this.props.actions.set_server_info(result.info);
                    this.props.saml_login(saml_token_id).then(
                        (required_multifactors) => {
                            this.setState({
                                multifactors: required_multifactors,
                            });
                            this.requirement_check_mfa();
                        },
                        (result) => {
                            this.setState({ loginLoading: false });
                            if (result.hasOwnProperty('non_field_errors')) {
                                let errors = result.non_field_errors;
                                this.setState({
                                    view: 'default',
                                    errors,
                                });
                            } else {
                                this.setState({
                                    view: 'default',
                                    errors: [result],
                                });
                            }
                        }
                    );
                });
        }

        if (this.props.location.pathname.startsWith('/oidc/token/')) {
            const oidc_token_id = this.props.location.pathname.replace(
                '/oidc/token/',
                ''
            );
            this.props
                .check_host(store.getState().server.url)
                .then((result) => {
                    this.setState({ server_info: result });
                    this.props.actions.set_server_info(result.info);
                    this.props.oidc_login(oidc_token_id).then(
                        (required_multifactors) => {
                            this.setState({
                                multifactors: required_multifactors,
                            });
                            this.requirement_check_mfa();
                        },
                        (result) => {
                            this.setState({ loginLoading: false });
                            if (result.hasOwnProperty('non_field_errors')) {
                                let errors = result.non_field_errors;
                                this.setState({
                                    view: 'default',
                                    errors,
                                });
                            } else {
                                this.setState({
                                    view: 'default',
                                    errors: [result],
                                });
                            }
                        }
                    );
                });
        }
    };

    componentDidMount() {
        this.props.get_config().then(this.onNewConfigLoaded);
        const { t } = this.props;
        this.setState({
            errorsResponses: {
                AUTHENTICATION_FAILED: t('IVALT_AUTH_FAILED'),
                BIOMETRIC_AUTH_REQUEST_SUCCESSFULLY_SENT: t(
                    'IVALT_AUTH_REQUEST_SENT'
                ),
                INVALID_TIMEZONE: t('IVALT_INVALID_TIMEZONE'),
                INVALID_GEOFENCE: t('IVALT_INVALID_GEOFENCE'),
            },
        });
    }

    render() {
        const { classes, t } = this.props;
        const errors = (
            <GridItem xs={8} sm={8} md={8} style={{ marginTop: '20px' }}>
                {this.state.errors.map((prop, index) => {
                    return (
                        <SnackbarContent
                            message={t(prop)}
                            color='danger'
                            key={index}
                        />
                    );
                })}
            </GridItem>
        );

        if (this.state.loggedIn) {
            return <Redirect to='/dashboard' />;
        }

        if (this.state.view === 'default') {
            const saml_provider =
                this.state.admin_client_config.saml_provider || [];
            const oidc_provider =
                this.state.admin_client_config.oidc_provider || [];
            const authentication_methods =
                this.state.admin_client_config.authentication_methods || [];
            const server_style = this.state.admin_client_config
                .allow_custom_server
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
                                autoComplete='off'
                            >
                                <Grid container style={regular_login_style}>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText={t('USERNAME')}
                                            id='username'
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: this.state.username,
                                                onChange: this.onChangeUsername,
                                                endAdornment:
                                                    this.state.domain &&
                                                    !this.state.username.includes(
                                                        '@'
                                                    ) ? (
                                                        <InputAdornment position='end'>
                                                            {'@' +
                                                                this.state
                                                                    .domain}
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
                                            id='password'
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: this.state.password,
                                                onChange: this.onChangePassword,
                                                type: 'password',
                                            }}
                                        />
                                    </GridItem>
                                </Grid>
                                {saml_provider.map((provider, i) => {
                                    const initiate_saml_login_helper = () => {
                                        return this.initiate_saml_login(
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
                                                    color='primary'
                                                    onClick={
                                                        initiate_saml_login_helper
                                                    }
                                                    type='submit'
                                                    id='sad'
                                                >
                                                    <span
                                                        style={
                                                            !this.state
                                                                .loginLoading
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
                                                        loading={
                                                            this.state
                                                                .loginLoading
                                                        }
                                                    />
                                                </Button>
                                            </GridItem>
                                        </Grid>
                                    );
                                })}
                                {oidc_provider.map((provider, i) => {
                                    const initiate_oidc_login_helper = () => {
                                        return this.initiate_oidc_login(
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
                                                    color='primary'
                                                    onClick={
                                                        initiate_oidc_login_helper
                                                    }
                                                    type='submit'
                                                    id='sad'
                                                >
                                                    <span
                                                        style={
                                                            !this.state
                                                                .loginLoading
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
                                                        loading={
                                                            this.state
                                                                .loginLoading
                                                        }
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
                                            checked={this.state.remember_me}
                                            onClick={this.handleToggleRememberMe()}
                                            checkedIcon={
                                                <Check
                                                    className={
                                                        classes.checkedIcon
                                                    }
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
                                            checked={this.state.trust_device}
                                            onClick={this.handleToggleTrustDevice()}
                                            checkedIcon={
                                                <Check
                                                    className={
                                                        classes.checkedIcon
                                                    }
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
                                            color='primary'
                                            onClick={this.initiate_login}
                                            type='submit'
                                            disabled={
                                                !this.state.loginPossible ||
                                                this.state.loginLoading
                                            }
                                        >
                                            <span
                                                style={
                                                    !this.state.loginLoading
                                                        ? {}
                                                        : { display: 'none' }
                                                }
                                            >
                                                Login
                                            </span>
                                            <BarLoader
                                                color={'#FFF'}
                                                height={17}
                                                width={37}
                                                loading={
                                                    this.state.loginLoading
                                                }
                                            />
                                        </Button>
                                    </GridItem>
                                </Grid>
                                <Grid container>{errors}</Grid>
                                <Grid container style={server_style}>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText={t('SERVER')}
                                            id='server'
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: this.state.server,
                                                onChange: this.onChangeServer,
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
        if (this.state.view === 'new_server') {
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
                                autoComplete='off'
                            >
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText={t('FINGERPRINT')}
                                            id='server_fingerprint'
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: this.state.server_info
                                                    .verify_key,
                                                disabled: true,
                                                multiline: true,
                                            }}
                                        />
                                        <SnackbarContent
                                            message={t(
                                                'IT_APPEARS_THAT_YOU_WANT_TO_CONNECT'
                                            )}
                                            close
                                            color='info'
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
                                            color='primary'
                                            onClick={this.approve_host}
                                            type='submit'
                                        >
                                            {t('APPROVE')}
                                        </Button>
                                        <Button
                                            color='transparent'
                                            onClick={this.cancel}
                                        >
                                            {t('CANCEL')}
                                        </Button>
                                    </GridItem>
                                </Grid>
                                <Grid container>{errors}</Grid>
                            </form>
                        }
                    />
                </div>
            );
        }
        if (this.state.view === 'webauthn') {
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
                                autoComplete='off'
                            >
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <SnackbarContent
                                            message={t(
                                                'SOLVE_THE_WEBAUTHN_CHALLENGE_EXPLAINED'
                                            )}
                                            close
                                            color='info'
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
                                            color='transparent'
                                            onClick={this.cancel}
                                        >
                                            {t('CANCEL')}
                                        </Button>
                                    </GridItem>
                                </Grid>
                                <Grid container>{errors}</Grid>
                            </form>
                        }
                    />
                </div>
            );
        }

        if (this.state.view === 'pick_second_factor') {
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
                                autoComplete='off'
                            >
                                <Grid container>
                                    {this.state.multifactors.indexOf(
                                        'google_authenticator_2fa'
                                    ) !== -1 && (
                                        <GridItem
                                            xs={12}
                                            sm={12}
                                            md={12}
                                            style={{ marginTop: '20px' }}
                                        >
                                            <Button
                                                color='primary'
                                                onClick={this.show_ga_2fa_form}
                                                type='submit'
                                                fullWidth
                                            >
                                                {t('GOOGLE_AUTHENTICATOR')}
                                            </Button>
                                        </GridItem>
                                    )}
                                    {this.state.multifactors.indexOf(
                                        'yubikey_otp_2fa'
                                    ) !== -1 && (
                                        <GridItem
                                            xs={12}
                                            sm={12}
                                            md={12}
                                            style={{ marginTop: '20px' }}
                                        >
                                            <Button
                                                color='primary'
                                                onClick={
                                                    this
                                                        .show_yubikey_otp_2fa_form
                                                }
                                                type='submit'
                                                fullWidth
                                            >
                                                {t('YUBIKEY')}
                                            </Button>
                                        </GridItem>
                                    )}
                                    {this.state.multifactors.indexOf(
                                        'webauthn_2fa'
                                    ) !== -1 && (
                                        <GridItem
                                            xs={12}
                                            sm={12}
                                            md={12}
                                            style={{ marginTop: '20px' }}
                                        >
                                            <Button
                                                color='primary'
                                                onClick={
                                                    this.show_webauthn_2fa_form
                                                }
                                                type='submit'
                                                fullWidth
                                            >
                                                {t('FIDO2_WEBAUTHN')}
                                            </Button>
                                        </GridItem>
                                    )}
                                    {this.state.multifactors.indexOf(
                                        'duo_2fa'
                                    ) !== -1 && (
                                        <GridItem
                                            xs={12}
                                            sm={12}
                                            md={12}
                                            style={{ marginTop: '20px' }}
                                        >
                                            <Button
                                                color='primary'
                                                onClick={this.show_duo_2fa_form}
                                                type='submit'
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
                                            color='transparent'
                                            onClick={this.cancel}
                                            fullWidth
                                        >
                                            {t('CANCEL')}
                                        </Button>
                                    </GridItem>
                                </Grid>
                                <Grid container>{errors}</Grid>
                            </form>
                        }
                    />
                </div>
            );
        }

        if (this.state.view === 'yubikey_otp') {
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
                                autoComplete='off'
                            >
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText={t('YUBIKEY')}
                                            id='yubikey_otp'
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: this.state.yubikey_otp,
                                                onChange:
                                                    this.onChangeYubikeyOTP,
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
                                            color='primary'
                                            onClick={this.verify_yubikey_otp}
                                            type='submit'
                                        >
                                            {t('SEND')}
                                        </Button>
                                        <Button
                                            color='transparent'
                                            onClick={this.cancel}
                                        >
                                            {t('CANCEL')}
                                        </Button>
                                    </GridItem>
                                </Grid>
                                <Grid container>{errors}</Grid>
                            </form>
                        }
                    />
                </div>
            );
        }

        if (this.state.view === 'google_authenticator') {
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
                                autoComplete='off'
                            >
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText={t(
                                                'GOOGLE_AUTHENTICATOR'
                                            )}
                                            id='google_authenticator'
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: this.state
                                                    .google_authenticator,
                                                onChange:
                                                    this
                                                        .onChangeGoogleAuthentication,
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
                                            color='primary'
                                            onClick={
                                                this.verify_google_authenticator
                                            }
                                            type='submit'
                                        >
                                            {t('SEND')}
                                        </Button>
                                        <Button
                                            color='transparent'
                                            onClick={this.cancel}
                                        >
                                            {t('CANCEL')}
                                        </Button>
                                    </GridItem>
                                </Grid>
                                <Grid container>{errors}</Grid>
                            </form>
                        }
                    />
                </div>
            );
        }
        if (this.state.view === 'ivalt') {
            return (
                <div className={classes.wrapper}>
                    <RegularCard
                        cardTitle={t('IVALT_AUTHENTICATION')}
                        cardSubtitle={t('VERIFY_IVALT_AUTHENTICATION')}
                        content={
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'nowrap',
                                    alignContent: 'center',
                                    justifyContent: 'center !important',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                }}
                            >
                                <img
                                    src={iValtLogo}
                                    alt='ivalt'
                                    style={{ width: 50 }}
                                />
                                <CircularProgress
                                    size={60}
                                    className={classes.progress}
                                    style={{ animation: 'unset', zIndex: 2 }}
                                />
                                <h2 style={{ textAlign: 'center' }}>
                                    {t('IVALT_AUTHENTICATION_REQUEST_SENT')}
                                </h2>
                                <p>
                                    {t(
                                        'IVALT_AUTHENTICATION_REQUEST_SENT_DESCRIPTION'
                                    )}
                                </p>
                                {this.state.timerActive ? (
                                    <div
                                        style={{
                                            marginTop: '20px',
                                            textAlign: 'center',
                                            color: 'red',
                                        }}
                                    >
                                        <p>
                                            Time remaining: {this.state.timer}{' '}
                                            seconds
                                        </p>
                                    </div>
                                ) : (
                                    <Button onClick={this.handleRetry}>
                                        Retry
                                    </Button>
                                )}
                            </div>
                        }
                    />
                </div>
            );
        }

        if (this.state.view === 'duo') {
            return (
                <div className={classes.wrapper}>
                    <RegularCard
                        cardTitle={t('DUO_AUTHENTICATION')}
                        cardSubtitle={t(
                            'PLEASE_APPROVE_ON_PHONE_OR_ENTER_CODE'
                        )}
                        content={
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                }}
                                autoComplete='off'
                            >
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText={t('DUO_CODE')}
                                            id='duo'
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: this.state.duo,
                                                onChange: this.onChangeDuo,
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
                                            color='primary'
                                            onClick={this.verify_duo}
                                            type='submit'
                                        >
                                            {t('SEND')}
                                        </Button>
                                        <Button
                                            color='transparent'
                                            onClick={this.cancel}
                                        >
                                            {t('CANCEL')}
                                        </Button>
                                    </GridItem>
                                </Grid>
                                <Grid container>{errors}</Grid>
                            </form>
                        }
                    />
                </div>
            );
        }

        if (this.state.view === 'ask_send_plain') {
            return (
                <div className={classes.wrapper}>
                    <RegularCard
                        cardTitle={t('SERVER_INFO')}
                        cardSubtitle={t(
                            'SERVER_ASKS_FOR_YOUR_PLAINTEXT_PASSWORD'
                        )}
                        content={
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                }}
                                autoComplete='off'
                            >
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <SnackbarContent
                                            color='warning'
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
                                            color='warning'
                                            onClick={this.approve_send_plain}
                                            type='submit'
                                        >
                                            {t('APPROVE_UNSAFE')}
                                        </Button>
                                        <Button
                                            color='success'
                                            onClick={this.disapprove_send_plain}
                                        >
                                            {t('DISAPPROVE_UNSAFE')}
                                        </Button>
                                    </GridItem>
                                </Grid>
                                <Grid container>{errors}</Grid>
                            </form>
                        }
                    />
                </div>
            );
        }
    }
}

LoginForm.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default compose(withTranslation(), withStyles(style))(LoginForm);
