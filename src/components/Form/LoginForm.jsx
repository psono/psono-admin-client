import React from 'react';
import PropTypes from 'prop-types';
import {
    withStyles, Grid
} from 'material-ui';
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
    }
};

class LoginForm extends React.Component {
    state = {
        username: '',
        password: '',
        errors: [],
        loggedIn: this.props.state.user.isLoggedIn,
    };

    render() {
        const { classes } = this.props;
        const login = () => {
            let errors = this.props.login(this.state.username, this.state.password);
            if (errors) {
                this.setState({errors})
            } else {
                this.setState({loggedIn: true});
            }
        };
        const onChangeUsername = (event) => {
            this.setState({username: event.target.value})
        };
        const onChangePassword = (event) => {
            this.setState({password: event.target.value})
        };

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
                                            onChange: onChangeUsername,
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
                                            onChange: onChangePassword,
                                            type: 'password',
                                        }}
                                    />
                                </ItemGrid>
                            </Grid>
                            <Grid container>
                                <ItemGrid xs={4} sm={4} md={4} style={{marginTop: '20px'}}>
                                    <Button color="primary" onClick={login}>Login</Button>
                                </ItemGrid>
                                {errors}
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
