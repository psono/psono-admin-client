import React from 'react';
import PropTypes from 'prop-types';
import {
    withStyles, Grid
} from 'material-ui';
import {
    RegularCard, Button, CustomInput, ItemGrid
} from '../../components';

const style = {
    wrapper: {
        width: '340px',
        'z-index': '4',
    },
};

class LoginForm extends React.Component {
    render() {
        const { classes } = this.props;
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
                                            type: 'password'
                                        }}
                                    />
                                </ItemGrid>
                            </Grid>
                        </div>
                    }
                    footer={
                        <Button color="primary">Login</Button>
                    }
                />
            </div>
        );
    }
}

LoginForm.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(style)(LoginForm);
