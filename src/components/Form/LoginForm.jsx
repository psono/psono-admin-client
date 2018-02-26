import React from 'react';
import PropTypes from 'prop-types';
import {
    withStyles, Grid, Checkbox
} from 'material-ui';
import { BarLoader } from 'react-spinners'
import { Check } from 'material-ui-icons';
import {
    Redirect
} from 'react-router-dom';
import {
    RegularCard, Button, CustomInput, ItemGrid, SnackbarContent
} from '../../components';

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
        color: '#9c27b0'
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
    };

    handleToggleRememberMe = () => () => {
        this.setState({ remember_me: !this.state.remember_me });
    };

    handleToggleTrustDevice = () => () => {
        this.setState({ trust_device: !this.state.trust_device });
    };
    manageButtonState = () => {

        if (this.state.username && this.state.password)  {
            this.setState({loginPossible: true});
        } else {
            this.setState({loginPossible: false});
        }
    };
    onChangeUsername = (event) => {
        this.setState({username: event.target.value});
        this.manageButtonState();
    };
    onChangePassword = (event) => {
        this.setState({password: event.target.value});
        this.manageButtonState();
    };
    onChangeServer = (event) => {
        this.setState({server: event.target.value});
        this.manageButtonState();
    };

    handle_multifactor = () => {
        let multifactors = this.state.multifactors;
        if (multifactors.length === 0) {
            this.props.activate_token().then(() => {
                this.setState({'loggedIn': true})
            });

        } else {
            // TODO handle multifactors
            console.log(multifactors);
        }
    };


    initiate_login = () => {
        this.setState({loginLoading: true});
        this.setState({errors: []});
        return this.props.initiate_login(this.state.username, this.state.server, this.state.remember_me, this.state.trust_device).then(
            (result) => {
                this.setState({server_info: result});
                if (result.status !== 'matched') {
                    this.setState({view: result.status});
                } else {
                    let password = this.state.password;
                    this.setState({password: ''});
                    return this.props.login(password, this.state.server_info).then(
                        (required_multifactors) => {
                            this.setState({multifactors: required_multifactors});
                            this.handle_multifactor()
                        },
                        (result) => {
                            this.setState({loginLoading: false});
                            if (result.hasOwnProperty('non_field_errors')) {
                                let errors = result.non_field_errors;
                                this.setState({errors});
                            } else {
                                console.log(result);
                                this.setState({errors: [result]});
                            }
                        },
                    );
                }
            },
            (result) => {
                if (result.hasOwnProperty('errors')) {
                    let errors = result.errors;
                    this.setState({errors});
                } else {
                    console.log(result);
                    this.setState({errors: [result]});
                }
            },
        ).catch((result) => {
            this.setState({loginLoading: false});
            return Promise.reject(result)
        });
    };

    approve_host = () => {
        this.props.approve_host(this.state.server_info.server_url, this.state.server_info.verify_key);
        let password = this.state.password;
        this.setState({password: ''});
        this.props.login(password, this.state.server_info).then(
            (required_multifactors) => {
                this.setState({multifactors: required_multifactors});
                this.handle_multifactor()
            },
            (result) => {
                this.setState({loginLoading: false});
                if (result.hasOwnProperty('non_field_errors')) {
                    let errors = result.non_field_errors;
                    this.setState({errors: errors});
                } else {
                    console.log(result);
                    this.setState({errors: [result]});
                }
            },
        );
        this.setState({password: ''});
    };

    cancel = () => {
        this.setState({
            view: 'default',
            password: ''
        });
        this.props.logout();
    };

    render() {
        const {classes} = this.props;


        const errors = (
            <ItemGrid xs={8} sm={8} md={8} style={{marginTop: '20px'}}>
                {
                    this.state.errors.map((prop, key) => {
                        return (
                            <SnackbarContent message={prop} close color="danger" key={key}/>
                        );
                    })
                }
            </ItemGrid>
        );

        if (this.state.loggedIn){
            return (<Redirect to="/dashboard"/>);
        }

        if (this.state.view === 'default') {
            return (
                <div className={classes.wrapper}>
                    <RegularCard
                        cardTitle="Login"
                        cardSubtitle="Enter your username and password:"
                        content={
                            <div>
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
                                                onChange: this.onChangeUsername,
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
                                                type: 'password',
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
                                            checkedIcon={<Check className={classes.checkedIcon}/>}
                                            icon={<Check className={classes.uncheckedIcon}/>}
                                            classes={{
                                                checked: classes.checked,
                                            }}
                                        /> Remember username and server
                                    </ItemGrid>
                                </Grid>
                                <Grid container>
                                    <ItemGrid xs={12} sm={12} md={12}>
                                        <Checkbox
                                            tabIndex={2}
                                            checked={this.state.trust_device}
                                            onClick={this.handleToggleTrustDevice()}
                                            checkedIcon={<Check className={classes.checkedIcon}/>}
                                            icon={<Check className={classes.uncheckedIcon}/>}
                                            classes={{
                                                checked: classes.checked,
                                            }}
                                        /> Trust device
                                    </ItemGrid>
                                </Grid>
                                <Grid container>
                                    <ItemGrid xs={4} sm={4} md={4} style={{marginTop: '20px'}}>
                                        <Button color="primary" onClick={this.initiate_login}
                                                disabled={!this.state.loginPossible || this.state.loginLoading}>
                                            <span style={!this.state.loginLoading ? {} : { display: 'none' }}>Login</span>
                                            <BarLoader color={'#FFF'} height={17} width={37} loading={this.state.loginLoading}  />
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
                            </div>
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
                            <div>
                                <Grid container>
                                    <ItemGrid xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText="Server Fingerprint"
                                            id="server_fingerprint"
                                            formControlProps={{
                                                fullWidth: true
                                            }}
                                            inputProps={{
                                                value: this.state.server_info.verify_key,
                                                disabled: true,
                                                multiline: true,
                                            }}
                                        />
                                        <SnackbarContent message={'It appears, that you want to connect to this ' +
                                        'server for the first time Please verify that the fingerprint of the server ' +
                                        'is correct before approving.'} close color="info"/>
                                    </ItemGrid>
                                </Grid>
                                <Grid container>
                                    <ItemGrid xs={12} sm={4} md={12} style={{marginTop: '20px'}}>
                                        <Button color="primary" onClick={this.approve_host} >Approve</Button>
                                        <Button color="transparent" onClick={this.cancel} >Cancel</Button>
                                    </ItemGrid>
                                </Grid>
                                <Grid container>
                                    {errors}
                                </Grid>
                            </div>
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

export default withStyles(style)(LoginForm);
