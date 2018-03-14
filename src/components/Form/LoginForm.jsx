import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, Grid, Checkbox } from 'material-ui';
import { BarLoader } from 'react-spinners';
import { Check } from 'material-ui-icons';
import { Redirect } from 'react-router-dom';
import {
    RegularCard,
    Button,
    CustomInput,
    ItemGrid,
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

    render() {
        const { classes } = this.props;

        const errors = (
            <ItemGrid xs={8} sm={8} md={8} style={{ marginTop: '20px' }}>
                {this.state.errors.map((prop, index) => {
                    return (
                        <SnackbarContent
                            message={prop}
                            color="danger"
                            key={index}
                        />
                    );
                })}
            </ItemGrid>
        );

        if (this.state.loggedIn) {
            return <Redirect to="/dashboard" />;
        }

        if (this.state.view === 'default') {
            return (
                <div className={classes.wrapper}>
                    <RegularCard
                        cardTitle="Login"
                        cardSubtitle="Enter your username and password:"
                        content={
                            <form
                                onSubmit={e => {
                                    e.preventDefault();
                                }}
                                autoComplete="off"
                            >
                                <Grid container>
                                    <ItemGrid xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText="Username"
                                            id="username"
                                            formControlProps={{
                                                fullWidth: true
                                            }}
                                            inputProps={{
                                                value: this.state.username,
                                                onChange: this.onChangeUsername
                                            }}
                                        />
                                    </ItemGrid>
                                </Grid>
                                <Grid container>
                                    <ItemGrid xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText="Password"
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
                                    </ItemGrid>
                                </Grid>
                                <Grid container>
                                    <ItemGrid xs={12} sm={12} md={12}>
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
                                        Remember username and server
                                    </ItemGrid>
                                </Grid>
                                <Grid container>
                                    <ItemGrid xs={12} sm={12} md={12}>
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
                                        Trust device
                                    </ItemGrid>
                                </Grid>
                                <Grid container>
                                    <ItemGrid
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
                                    </ItemGrid>
                                    {errors}
                                </Grid>
                                <Grid container>
                                    <ItemGrid xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText="Server"
                                            id="server"
                                            formControlProps={{
                                                fullWidth: true
                                            }}
                                            inputProps={{
                                                value: this.state.server,
                                                onChange: this.onChangeServer
                                            }}
                                        />
                                    </ItemGrid>
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
                        cardTitle="New Server"
                        cardSubtitle="Verify the fingerprint and approve it."
                        content={
                            <form
                                onSubmit={e => {
                                    e.preventDefault();
                                }}
                                autoComplete="off"
                            >
                                <Grid container>
                                    <ItemGrid xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText="Server Fingerprint"
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
                                            message={
                                                'It appears, that you want to connect to this ' +
                                                'server for the first time Please verify that the fingerprint of the server ' +
                                                'is correct before approving.'
                                            }
                                            close
                                            color="info"
                                        />
                                    </ItemGrid>
                                </Grid>
                                <Grid container>
                                    <ItemGrid
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
                                    </ItemGrid>
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
                        cardTitle="Yubikey Authentication"
                        cardSubtitle="Please enter your yubikey below."
                        content={
                            <form
                                onSubmit={e => {
                                    e.preventDefault();
                                }}
                                autoComplete="off"
                            >
                                <Grid container>
                                    <ItemGrid xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText="Yubikey"
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
                                    </ItemGrid>
                                </Grid>
                                <Grid container>
                                    <ItemGrid
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
                                    </ItemGrid>
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
                        cardTitle="Google Authentication"
                        cardSubtitle="Please enter your Google authenticator code below."
                        content={
                            <form
                                onSubmit={e => {
                                    e.preventDefault();
                                }}
                                autoComplete="off"
                            >
                                <Grid container>
                                    <ItemGrid xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText="Google Authenticator"
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
                                    </ItemGrid>
                                </Grid>
                                <Grid container>
                                    <ItemGrid
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
                                    </ItemGrid>
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
                        cardTitle="Duo Authentication"
                        cardSubtitle="Please approve the request on your phone or enter a code below."
                        content={
                            <form
                                onSubmit={e => {
                                    e.preventDefault();
                                }}
                                autoComplete="off"
                            >
                                <Grid container>
                                    <ItemGrid xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText="Duo Code"
                                            id="duo"
                                            formControlProps={{
                                                fullWidth: true
                                            }}
                                            inputProps={{
                                                value: this.state.duo,
                                                onChange: this.onChangeDuo
                                            }}
                                        />
                                    </ItemGrid>
                                </Grid>
                                <Grid container>
                                    <ItemGrid
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
                                            Send
                                        </Button>
                                        <Button
                                            color="transparent"
                                            onClick={this.cancel}
                                        >
                                            Cancel
                                        </Button>
                                    </ItemGrid>
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
                        cardTitle="Server Info"
                        cardSubtitle="The server asks for your plaintext password."
                        content={
                            <form
                                onSubmit={e => {
                                    e.preventDefault();
                                }}
                                autoComplete="off"
                            >
                                <Grid container>
                                    <ItemGrid xs={12} sm={12} md={12}>
                                        <SnackbarContent
                                            color="warning"
                                            message={
                                                'Accepting this will send your plain password to the server and ' +
                                                'should only be allowed if you are using LDAP or similar authentication ' +
                                                'methods. You can decline this, but this might fail in an ' +
                                                'authentication failure.'
                                            }
                                        />
                                    </ItemGrid>
                                </Grid>
                                <Grid container>
                                    <ItemGrid
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
                                            Approve (unsafe)
                                        </Button>
                                        <Button
                                            color="success"
                                            onClick={this.disapprove_send_plain}
                                        >
                                            Disapprove (safe)
                                        </Button>
                                    </ItemGrid>
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

export default withStyles(style)(LoginForm);
