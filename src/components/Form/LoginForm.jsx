import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, Grid, Checkbox } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import { BarLoader } from 'react-spinners';
import { Check } from '@material-ui/icons';
import { Redirect } from 'react-router-dom';
import {
    RegularCard,
    Button,
    CustomInput,
    GridItem,
    SnackbarContent
} from '../../components';

import helper from '../../services/helper';

const style = {
    wrapper: {
        width: '340px',
        'z-index': '4'
    },
    '@media (min-width: 960px)': {
        wrapper: {
            width: '540px'
        }
    },
    checked: {
        color: '#9c27b0'
    },
    checkedIcon: {
        width: '20px',
        height: '20px',
        border: '1px solid rgba(0, 0, 0, .54)',
        borderRadius: '3px'
    },
    uncheckedIcon: {
        width: '0px',
        height: '0px',
        padding: '10px',
        border: '1px solid rgba(0, 0, 0, .54)',
        borderRadius: '3px'
    }
};

class LoginForm extends React.Component {
    state = {
        view: 'default',
        username: this.props.state.user.username,
        password: '',
        server: this.props.state.server.url,
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
        duo_request: false
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
    onChangeYubikeyOTP = event => {
        this.setState({ yubikey_otp: event.target.value });
    };
    onChangeDuo = event => {
        this.setState({ duo: event.target.value });
    };
    onChangeGoogleAuthentication = event => {
        this.setState({ google_authenticator: event.target.value });
    };
    onChangeUsername = event => {
        this.setState({ username: event.target.value });
        this.manageButtonState();
    };
    onChangePassword = event => {
        this.setState({ password: event.target.value });
        this.manageButtonState();
    };
    onChangeServer = event => {
        this.setState({ server: event.target.value });
        this.manageButtonState();
    };

    requirement_check_mfa = () => {
        let multifactors = this.state.multifactors;
        if (multifactors.length === 0) {
            this.props.activate_token().then(() => {
                this.setState({
                    loggedIn: true,
                    loginLoading: false
                });
            });
        } else {
            this.setState({
                loginLoading: false
            });
            this.handle_mfa();
        }
    };

    verify_yubikey_otp = () => {
        let multifactors = this.state.multifactors;

        this.props.yubikey_otp_verify(this.state.yubikey_otp).then(
            () => {
                helper.remove_from_array(multifactors, 'yubikey_otp_2fa');
                this.setState({ multifactors: multifactors });
                this.requirement_check_mfa();
            },
            errors => {
                this.setState({ errors });
            }
        );
    };

    verify_google_authenticator = () => {
        let multifactors = this.state.multifactors;

        this.props.ga_verify(this.state.google_authenticator).then(
            () => {
                helper.remove_from_array(
                    multifactors,
                    'google_authenticator_2fa'
                );
                this.setState({ multifactors: multifactors });
                this.requirement_check_mfa();
            },
            errors => {
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
                helper.remove_from_array(multifactors, 'duo_2fa');
                this.setState({ multifactors: multifactors });
                this.requirement_check_mfa();
            },
            errors => {
                this.setState({ errors });
            }
        );
    };

    handle_mfa = () => {
        let multifactors = this.state.multifactors;
        if (multifactors.indexOf('yubikey_otp_2fa') !== -1) {
            this.setState({
                view: 'yubikey_otp',
                loginLoading: false
            });
        } else if (multifactors.indexOf('google_authenticator_2fa') !== -1) {
            this.setState({
                view: 'google_authenticator',
                loginLoading: false
            });
        } else if (multifactors.indexOf('duo_2fa') !== -1) {
            this.setState({
                view: 'duo',
                loginLoading: false
            });
            this.verify_duo();
        } else {
            this.setState({
                view: 'default',
                errors: [
                    'Unknown multi-factor authentication requested by server.'
                ],
                loginLoading: false
            });
            this.logout();
        }
    };

    has_ldap_auth = server_check => {
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

    next_login_step = send_plain => {
        let password = this.state.password;
        this.setState({ password: '' });

        return this.props
            .login(password, this.state.server_info, send_plain)
            .then(
                required_multifactors => {
                    this.setState({
                        multifactors: required_multifactors
                    });
                    this.requirement_check_mfa();
                },
                result => {
                    this.setState({ loginLoading: false });
                    if (result.hasOwnProperty('non_field_errors')) {
                        let errors = result.non_field_errors;
                        this.setState({
                            view: 'default',
                            errors
                        });
                    } else {
                        this.setState({
                            view: 'default',
                            errors: [result]
                        });
                    }
                }
            );
    };

    initiate_login = () => {
        this.setState({ loginLoading: true });
        this.setState({ errors: [] });
        return this.props
            .initiate_login(
                this.state.username,
                this.state.server,
                this.state.remember_me,
                this.state.trust_device
            )
            .then(
                result => {
                    this.setState({ server_info: result });
                    this.props.actions.set_server_info(result.info);
                    if (result.status !== 'matched') {
                        this.setState({ view: result.status });
                    } else if (this.has_ldap_auth(result)) {
                        this.setState({
                            view: 'ask_send_plain',
                            loginLoading: false
                        });
                    } else {
                        return this.next_login_step(false);
                    }
                },
                result => {
                    if (result.hasOwnProperty('errors')) {
                        let errors = result.errors;
                        this.setState({ errors, loginLoading: false });
                    } else {
                        this.setState({
                            errors: [result],
                            loginLoading: false
                        });
                    }
                }
            )
            .catch(result => {
                this.setState({ loginLoading: false });
                return Promise.reject(result);
            });
    };

    initiate_saml_login = provider_id => {
        this.setState({ loginLoading: true });
        this.setState({ errors: [] });
        return this.props
            .initiate_saml_login(
                this.state.server,
                this.state.remember_me,
                this.state.trust_device
            )
            .then(
                result => {
                    this.setState({ server_info: result });
                    this.props.actions.set_server_info(result.info);
                    if (result.status !== 'matched') {
                        this.setState({ view: result.status });
                    } else {
                        this.props
                            .get_saml_redirect_url(provider_id)
                            .then(result => {
                                window.location = result.saml_redirect_url;
                            });
                    }
                },
                result => {
                    if (result.hasOwnProperty('errors')) {
                        let errors = result.errors;
                        this.setState({ errors, loginLoading: false });
                    } else {
                        this.setState({
                            errors: [result],
                            loginLoading: false
                        });
                    }
                }
            )
            .catch(result => {
                this.setState({ loginLoading: false });
                return Promise.reject(result);
            });
    };

    approve_host = () => {
        this.props.approve_host(
            this.state.server_info.server_url,
            this.state.server_info.verify_key
        );
        let password = this.state.password;
        this.setState({ password: '' });
        this.props.login(password, this.state.server_info).then(
            required_multifactors => {
                this.setState({ multifactors: required_multifactors });
                this.requirement_check_mfa();
            },
            result => {
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
    };

    cancel = () => {
        this.setState({
            view: 'default',
            password: '',
            errors: []
        });
        this.props.logout();
    };

    componentDidMount() {
        this.props.get_config().then(admin_client_config => {
            this.setState({
                server:
                    this.state.server ||
                    admin_client_config.backend_servers[0].url,
                admin_client_config: admin_client_config
            });

            if (this.props.location.pathname.startsWith('/saml/token/')) {
                const saml_token_id = this.props.location.pathname.replace(
                    '/saml/token/',
                    ''
                );
                this.props.saml_login(saml_token_id).then(
                    required_multifactors => {
                        this.setState({
                            multifactors: required_multifactors
                        });
                        this.requirement_check_mfa();
                    },
                    result => {
                        this.setState({ loginLoading: false });
                        if (result.hasOwnProperty('non_field_errors')) {
                            let errors = result.non_field_errors;
                            this.setState({
                                view: 'default',
                                errors
                            });
                        } else {
                            this.setState({
                                view: 'default',
                                errors: [result]
                            });
                        }
                    }
                );
            }
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
                            color="danger"
                            key={index}
                        />
                    );
                })}
            </GridItem>
        );

        if (this.state.loggedIn) {
            return <Redirect to="/dashboard" />;
        }

        if (this.state.view === 'default') {
            const saml_provider =
                this.state.admin_client_config.saml_provider || [];
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
                        cardSubtitle={
                            t('ENTER_YOUR_USERNAME_AND_PASSWORD') + ':'
                        }
                        content={
                            <form
                                onSubmit={e => {
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
                                                fullWidth: true
                                            }}
                                            inputProps={{
                                                value: this.state.username,
                                                onChange: this.onChangeUsername
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
                                                fullWidth: true
                                            }}
                                            inputProps={{
                                                value: this.state.password,
                                                onChange: this.onChangePassword,
                                                type: 'password'
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
                                                    color="primary"
                                                    onClick={
                                                        initiate_saml_login_helper
                                                    }
                                                    type="submit"
                                                    id="sad"
                                                >
                                                    <span
                                                        style={
                                                            !this.state
                                                                .loginLoading
                                                                ? {}
                                                                : {
                                                                      display:
                                                                          'none'
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
                                                checked: classes.checked
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
                                                checked: classes.checked
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
                                            onClick={this.initiate_login}
                                            type="submit"
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
                                            id="server"
                                            formControlProps={{
                                                fullWidth: true
                                            }}
                                            inputProps={{
                                                value: this.state.server,
                                                onChange: this.onChangeServer
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
                                onSubmit={e => {
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
                                                fullWidth: true
                                            }}
                                            inputProps={{
                                                value: this.state.server_info
                                                    .verify_key,
                                                disabled: true,
                                                multiline: true
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
                                            onClick={this.approve_host}
                                            type="submit"
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            color="transparent"
                                            onClick={this.cancel}
                                        >
                                            Cancel
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
                                onSubmit={e => {
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
                                                fullWidth: true
                                            }}
                                            inputProps={{
                                                value: this.state.yubikey_otp,
                                                onChange: this
                                                    .onChangeYubikeyOTP
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
                                            onClick={this.verify_yubikey_otp}
                                            type="submit"
                                        >
                                            Send
                                        </Button>
                                        <Button
                                            color="transparent"
                                            onClick={this.cancel}
                                        >
                                            Cancel
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
                                onSubmit={e => {
                                    e.preventDefault();
                                }}
                                autoComplete="off"
                            >
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText={t(
                                                'GOOGLE_AUTHENTICATOR'
                                            )}
                                            id="google_authenticator"
                                            formControlProps={{
                                                fullWidth: true
                                            }}
                                            inputProps={{
                                                value: this.state
                                                    .google_authenticator,
                                                onChange: this
                                                    .onChangeGoogleAuthentication
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
                                            onClick={
                                                this.verify_google_authenticator
                                            }
                                            type="submit"
                                        >
                                            Send
                                        </Button>
                                        <Button
                                            color="transparent"
                                            onClick={this.cancel}
                                        >
                                            Cancel
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
                                onSubmit={e => {
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
                                                fullWidth: true
                                            }}
                                            inputProps={{
                                                value: this.state.duo,
                                                onChange: this.onChangeDuo
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
                                            onClick={this.verify_duo}
                                            type="submit"
                                        >
                                            {t('SEND')}
                                        </Button>
                                        <Button
                                            color="transparent"
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
                                onSubmit={e => {
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
                                            onClick={this.approve_send_plain}
                                            type="submit"
                                        >
                                            {t('APPROVE_UNSAFE')}
                                        </Button>
                                        <Button
                                            color="success"
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
    classes: PropTypes.object.isRequired
};

export default compose(withTranslation(), withStyles(style))(LoginForm);
