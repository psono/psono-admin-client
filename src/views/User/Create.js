import React from 'react';
import { Grid, withStyles } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import { Redirect } from 'react-router-dom';

import {
    RegularCard,
    CustomInput,
    GridItem,
    Button,
    SnackbarContent
} from '../../components/index';
import psono_server from '../../services/api-server';
import customInputStyle from '../../assets/jss/material-dashboard-react/customInputStyle';

class User extends React.Component {
    state = {
        errors_list: [],
        errors_dict: {},
        redirect_to: '',
        username: '',
        email: '',
        password1: '',
        password2: '',
        createUserPossible: false
    };

    componentDidMount() {
        const is_ee_server = this.props.state.server.type === 'EE';

        if (!is_ee_server) {
            this.setState({
                redirect_to: '/dashboard'
            });
        }
    }

    isCreateUserPossible(username, email, password1, password2) {
        const usernameValid =
            username.length > 2 && username.indexOf('@') !== -1;
        const emailValid = email.length > 2 && email.indexOf('@') !== -1;
        const passwordValid = password1.length > 0 && password1 === password2;

        return usernameValid && emailValid && passwordValid;
    }

    onChangeUsername = event => {
        this.setState({
            username: event.target.value,
            createUserPossible: this.isCreateUserPossible(
                event.target.value,
                this.state.email,
                this.state.password1,
                this.state.password2
            )
        });
    };

    onChangeEmail = event => {
        this.setState({
            email: event.target.value,
            createUserPossible: this.isCreateUserPossible(
                this.state.username,
                event.target.value,
                this.state.password1,
                this.state.password2
            )
        });
    };

    onChangePassword1 = event => {
        this.setState({
            password1: event.target.value,
            createUserPossible: this.isCreateUserPossible(
                this.state.username,
                this.state.email,
                event.target.value,
                this.state.password2
            )
        });
    };

    onChangePassword2 = event => {
        this.setState({
            password2: event.target.value,
            createUserPossible: this.isCreateUserPossible(
                this.state.username,
                this.state.email,
                this.state.password1,
                event.target.value
            )
        });
    };

    createUser = () => {
        const onSuccess = data => {
            this.setState({
                redirect_to: '/user/' + data.data.id
            });
        };
        const onError = data => {
            this.setState({
                errors_dict: data.data
            });
        };

        psono_server
            .admin_create_user(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                this.state.username,
                this.state.password1,
                this.state.email
            )
            .then(onSuccess, onError);
    };

    render() {
        const { t } = this.props;
        if (this.state.redirect_to) {
            return <Redirect to={this.state.redirect_to} />;
        }
        const errors_dict = this.state.errors_dict;
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
                                                    errors_dict.hasOwnProperty(
                                                        'username'
                                                    )
                                                        ? t(
                                                              errors_dict[
                                                                  'username'
                                                              ]
                                                          )
                                                        : ''
                                                }
                                                formControlProps={{
                                                    fullWidth: true
                                                }}
                                                inputProps={{
                                                    value: this.state.username,
                                                    onChange: this
                                                        .onChangeUsername
                                                }}
                                                error={errors_dict.hasOwnProperty(
                                                    'username'
                                                )}
                                            />
                                        </GridItem>
                                        <GridItem xs={12} sm={12} md={6}>
                                            <CustomInput
                                                labelText={t('EMAIL')}
                                                id="email"
                                                helperText={
                                                    errors_dict.hasOwnProperty(
                                                        'email'
                                                    )
                                                        ? t(
                                                              errors_dict[
                                                                  'email'
                                                              ]
                                                          )
                                                        : ''
                                                }
                                                formControlProps={{
                                                    fullWidth: true
                                                }}
                                                inputProps={{
                                                    value: this.state.email,
                                                    onChange: this.onChangeEmail
                                                }}
                                                error={errors_dict.hasOwnProperty(
                                                    'email'
                                                )}
                                            />
                                        </GridItem>
                                        <GridItem xs={12} sm={12} md={6}>
                                            <CustomInput
                                                labelText={t('PASSWORD')}
                                                id="password1"
                                                helperText={
                                                    errors_dict.hasOwnProperty(
                                                        'password'
                                                    )
                                                        ? t(
                                                              errors_dict[
                                                                  'password'
                                                              ]
                                                          )
                                                        : ''
                                                }
                                                formControlProps={{
                                                    fullWidth: true
                                                }}
                                                inputProps={{
                                                    value: this.state.password1,
                                                    onChange: this
                                                        .onChangePassword1,
                                                    type: 'password'
                                                }}
                                                error={errors_dict.hasOwnProperty(
                                                    'password'
                                                )}
                                            />
                                        </GridItem>
                                        <GridItem xs={12} sm={12} md={6}>
                                            <CustomInput
                                                labelText={t('PASSWORD_REPEAT')}
                                                id="password2"
                                                helperText={
                                                    errors_dict.hasOwnProperty(
                                                        'password'
                                                    )
                                                        ? t(
                                                              errors_dict[
                                                                  'password'
                                                              ]
                                                          )
                                                        : ''
                                                }
                                                formControlProps={{
                                                    fullWidth: true
                                                }}
                                                inputProps={{
                                                    value: this.state.password2,
                                                    onChange: this
                                                        .onChangePassword2,
                                                    type: 'password'
                                                }}
                                                error={errors_dict.hasOwnProperty(
                                                    'password'
                                                )}
                                            />
                                        </GridItem>
                                    </Grid>
                                </div>
                            }
                            footer={
                                <div>
                                    <Button
                                        color="primary"
                                        onClick={this.createUser}
                                        disabled={
                                            !this.state.createUserPossible
                                        }
                                    >
                                        {t('CREATE_USER')}
                                    </Button>
                                    {errors_dict.hasOwnProperty(
                                        'non_field_errors'
                                    ) ? (
                                        <SnackbarContent
                                            message={t(
                                                errors_dict['non_field_errors']
                                            )}
                                            color="danger"
                                        />
                                    ) : (
                                        ''
                                    )}
                                </div>
                            }
                        />
                    </GridItem>
                </Grid>
            </div>
        );
    }
}

export default compose(withTranslation(), withStyles(customInputStyle))(User);
