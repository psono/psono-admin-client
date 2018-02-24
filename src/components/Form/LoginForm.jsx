import React from 'react';
import PropTypes from 'prop-types';
import {
    withStyles, Grid, Checkbox
} from 'material-ui';
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
        username: this.props.state.user.username,
        password: '',
        server: this.props.state.user.server,
        remember_me: this.props.state.user.remember_me,
        trust_device: this.props.state.user.trust_device,
        loginPossible: false,
        errors: [],
        loggedIn: this.props.state.user.isLoggedIn,
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
        this.setState({password: event.target.value})
        this.manageButtonState();
    };
    onChangeServer = (event) => {
        this.setState({server: event.target.value})
        this.manageButtonState();
    };
    login = () => {
        let errors = this.props.login(this.state.username, this.state.password, this.state.server, this.state.remember_me, this.state.trust_device);
        if (errors) {
            this.setState({errors})
        } else {
            this.setState({loggedIn: true});
        }
    };

    render() {
        const { classes } = this.props;


        const errors = (
            <ItemGrid xs={8} sm={8} md={8} style={{marginTop: '20px'}}>
                {
                    this.state.errors.map((prop,key) => {
                        return (
                            <SnackbarContent message={prop} close color="danger" key={key}/>
                        );
                    })
                }
            </ItemGrid>
        );

        if(this.state.loggedIn)
            return ( <Redirect to="/dashboard"/> )

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
                                    <Button color="primary" onClick={this.login} disabled={!this.state.loginPossible}>Login</Button>
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
}

LoginForm.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(LoginForm);
