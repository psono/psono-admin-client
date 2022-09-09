import React from 'react';
import { Grid, Checkbox, withStyles } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import moment from 'moment';

import {
    Button,
    RegularCard,
    CustomInput,
    GridItem,
    UserCard,
    SnackbarContent,
} from '../../components';
import psono_server from '../../services/api-server';
import customInputStyle from '../../assets/jss/material-dashboard-react/customInputStyle';
import helper from '../../services/helper';

class User extends React.Component {
    state = {
        errors: [],
        msgs: [],
    };

    componentDidMount() {
        const { t } = this.props;
        psono_server
            .admin_user(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                this.props.match.params.user_id
            )
            .then((response) => {
                const user = response.data;

                user.sessions.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.valid_till = moment(u.valid_till).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.active =
                        u.active && moment(u.valid_till) > moment()
                            ? t('YES')
                            : t('NO');
                    u.completely_activated = u.active ? t('YES') : t('NO');
                });

                user.duos.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.active = u.active ? t('YES') : t('NO');
                });

                user.yubikey_otps.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.active = u.active ? t('YES') : t('NO');
                });

                user.google_authenticators.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.active = u.active ? t('YES') : t('NO');
                });

                user.memberships.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.accepted = u.accepted ? t('YES') : t('NO');
                    u.admin = u.admin ? t('YES') : t('NO');
                });

                user.recovery_codes.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                });

                user.emergency_codes.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                });

                user.share_rights.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                });

                this.setState({
                    user: user,
                });
            });
    }

    onDeleteSessions(selected_sessions) {
        selected_sessions.forEach((session) => {
            psono_server.admin_delete_session(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                session.id
            );
        });

        let { sessions } = this.state.user;
        selected_sessions.forEach((session) => {
            helper.remove_from_array(sessions, session, function (a, b) {
                return a.id === b.id;
            });
        });

        this.setState({ sessions: sessions });
    }

    onDeleteMemberships(selected_memberships) {
        selected_memberships.forEach((membership) => {
            psono_server.admin_delete_membership(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                membership.id
            );
        });

        let { memberships } = this.state.user;
        selected_memberships.forEach((membership) => {
            helper.remove_from_array(memberships, membership, function (a, b) {
                return a.id === b.id;
            });
        });

        this.setState({ memberships: memberships });
    }

    onDeleteDuos(selected_duos) {
        selected_duos.forEach((duo) => {
            psono_server.admin_delete_duo(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                duo.id
            );
        });

        let { duos } = this.state.user;
        selected_duos.forEach((duo) => {
            helper.remove_from_array(duos, duo, function (a, b) {
                return a.id === b.id;
            });
        });

        this.setState({ duos: duos });
    }

    onDeleteYubikeyOtps(selected_yubikey_otps) {
        selected_yubikey_otps.forEach((yubikey_otp) => {
            psono_server.admin_delete_yubikey_otp(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                yubikey_otp.id
            );
        });

        let { yubikey_otps } = this.state.user;
        selected_yubikey_otps.forEach((yubikey_otp) => {
            helper.remove_from_array(
                yubikey_otps,
                yubikey_otp,
                function (a, b) {
                    return a.id === b.id;
                }
            );
        });

        this.setState({ yubikey_otps: yubikey_otps });
    }

    onDeleteGoogleAuthenticators(selected_google_authenticators) {
        selected_google_authenticators.forEach((google_authenticator) => {
            psono_server.admin_delete_google_authenticator(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                google_authenticator.id
            );
        });

        let { google_authenticators } = this.state.user;
        selected_google_authenticators.forEach((google_authenticator) => {
            helper.remove_from_array(
                google_authenticators,
                google_authenticator,
                function (a, b) {
                    return a.id === b.id;
                }
            );
        });

        this.setState({ google_authenticators: google_authenticators });
    }

    onDeleteRecoveryCodes(selected_recovery_codes) {
        selected_recovery_codes.forEach((recovery_code) => {
            psono_server.admin_delete_recovery_code(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                recovery_code.id
            );
        });

        let { recovery_codes } = this.state.user;
        selected_recovery_codes.forEach((recovery_code) => {
            helper.remove_from_array(
                recovery_codes,
                recovery_code,
                function (a, b) {
                    return a.id === b.id;
                }
            );
        });

        this.setState({ recovery_codes: recovery_codes });
    }

    onDeleteEmergencyCodes(selected_emergency_codes) {
        selected_emergency_codes.forEach((emergency_code) => {
            psono_server.admin_delete_emergency_code(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                emergency_code.id
            );
        });

        let { emergency_codes } = this.state.user;
        selected_emergency_codes.forEach((emergency_code) => {
            helper.remove_from_array(
                emergency_codes,
                emergency_code,
                function (a, b) {
                    return a.id === b.id;
                }
            );
        });

        this.setState({ emergency_codes: emergency_codes });
    }

    onChangeEmailChange = (event) => {
        let { user } = this.state;
        user.email = event.target.value;
        this.setState({
            user,
        });
    };

    onIsActiveToggle = (event) => {
        let { user } = this.state;
        user.is_active = !user.is_active;
        this.setState({
            user,
        });
    };

    onIsEmailActiveToggle = (event) => {
        let { user } = this.state;
        user.is_email_active = !user.is_email_active;
        this.setState({
            user,
        });
    };

    onIsSuperuserToggle = (event) => {
        let { user } = this.state;
        user.is_superuser = !user.is_superuser;
        this.setState({
            user,
        });
    };

    save = () => {
        this.setState({
            errors: [],
            msgs: [],
        });
        let { user } = this.state;
        psono_server
            .admin_update_user(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                user.id,
                user.email,
                user.is_active,
                user.is_email_active,
                user.is_superuser
            )
            .then(
                (result) => {
                    let msgs = ['SAVE_SUCCESS'];
                    this.setState({ msgs });
                },
                (result) => {
                    if (result.data.hasOwnProperty('email')) {
                        let errors = result.data.email;
                        this.setState({ errors });
                    } else if (result.data.hasOwnProperty('errors')) {
                        let errors = result.data.errors;
                        this.setState({ errors });
                    } else {
                        this.setState({
                            errors: [result.data],
                        });
                    }
                }
            );
    };

    render() {
        const { classes, t } = this.props;
        const user = this.state.user;

        if (!user) {
            return null;
        }

        if (user.authentication === 'AUTHKEY') {
            this.authentication = 'Normal';
        } else if (user.authentication === 'LDAP') {
            this.authentication = 'LDAP';
        } else if (user.authentication === 'SAML') {
            this.authentication = 'SAML';
        } else {
            this.authentication = 'UNKNOWN';
        }
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
        const msgs = (
            <GridItem xs={8} sm={8} md={8} style={{ marginTop: '20px' }}>
                {this.state.msgs.map((prop, index) => {
                    return (
                        <SnackbarContent
                            message={t(prop)}
                            color="info"
                            key={index}
                        />
                    );
                })}
            </GridItem>
        );

        return (
            <div>
                <Grid container>
                    <GridItem xs={12} sm={12} md={12}>
                        <RegularCard
                            cardTitle={t('EDIT_USER')}
                            cardSubtitle={t('UPDATE_USER_DETAILS')}
                            content={
                                <div>
                                    <Grid container>
                                        <GridItem xs={12} sm={12} md={7}>
                                            <CustomInput
                                                labelText={t('USERNAME')}
                                                id="username"
                                                formControlProps={{
                                                    fullWidth: true,
                                                }}
                                                inputProps={{
                                                    value: user.username,
                                                    disabled: true,
                                                    readOnly: true,
                                                }}
                                            />
                                        </GridItem>
                                        <GridItem xs={12} sm={12} md={5}>
                                            <CustomInput
                                                labelText={t('AUTHENTICATION')}
                                                id="authentication"
                                                formControlProps={{
                                                    fullWidth: true,
                                                }}
                                                inputProps={{
                                                    value: this.authentication,
                                                    disabled: true,
                                                    readOnly: true,
                                                }}
                                            />
                                        </GridItem>
                                    </Grid>
                                    <Grid container>
                                        <GridItem xs={12} sm={12} md={12}>
                                            <CustomInput
                                                labelText={t('PUBLIC_KEY')}
                                                id="public_key"
                                                formControlProps={{
                                                    fullWidth: true,
                                                }}
                                                inputProps={{
                                                    value: user.public_key,
                                                    disabled: true,
                                                    readOnly: true,
                                                }}
                                            />
                                        </GridItem>
                                    </Grid>
                                    <Grid container>
                                        <GridItem xs={12} sm={12} md={4}>
                                            <CustomInput
                                                labelText={t(
                                                    'REGISTRATION_DATE'
                                                )}
                                                id="create_date"
                                                formControlProps={{
                                                    fullWidth: true,
                                                }}
                                                inputProps={{
                                                    value: moment(
                                                        user.create_date
                                                    ).format(
                                                        'YYYY-MM-DD HH:mm:ss'
                                                    ),
                                                    disabled: true,
                                                    readOnly: true,
                                                }}
                                            />
                                        </GridItem>
                                        <GridItem xs={12} sm={12} md={8}>
                                            <CustomInput
                                                labelText={t('EMAIL')}
                                                id="email"
                                                formControlProps={{
                                                    fullWidth: true,
                                                }}
                                                inputProps={{
                                                    value: user.email,
                                                    onChange:
                                                        this
                                                            .onChangeEmailChange,
                                                }}
                                            />
                                        </GridItem>
                                    </Grid>
                                    <Grid container>
                                        <GridItem xs={12} sm={6} md={4}>
                                            <div className={classes.checkbox}>
                                                <Checkbox
                                                    tabIndex={1}
                                                    checked={user.is_active}
                                                    onClick={() => {
                                                        this.onIsActiveToggle();
                                                    }}
                                                />{' '}
                                                {t('ACTIVE')}
                                            </div>
                                        </GridItem>
                                        <GridItem xs={12} sm={6} md={4}>
                                            <div className={classes.checkbox}>
                                                <Checkbox
                                                    tabIndex={1}
                                                    checked={
                                                        user.is_email_active
                                                    }
                                                    onClick={() => {
                                                        this.onIsEmailActiveToggle();
                                                    }}
                                                />{' '}
                                                {t('EMAIL_VERIFIED')}
                                            </div>
                                        </GridItem>
                                        <GridItem xs={12} sm={6} md={4}>
                                            <div className={classes.checkbox}>
                                                <Checkbox
                                                    tabIndex={1}
                                                    checked={user.is_superuser}
                                                    onClick={() => {
                                                        this.onIsSuperuserToggle();
                                                    }}
                                                />{' '}
                                                {t('SUPERUSER')}
                                            </div>
                                        </GridItem>
                                        {errors}
                                        {msgs}
                                    </Grid>
                                </div>
                            }
                            footer={
                                <Button color="primary" onClick={this.save}>
                                    {t('SAVE')}
                                </Button>
                            }
                        />
                    </GridItem>
                </Grid>
                <Grid container>
                    <GridItem xs={12} sm={12} md={12}>
                        <UserCard
                            sessions={user.sessions}
                            memberships={user.memberships}
                            duos={user.duos}
                            google_authenticators={user.google_authenticators}
                            yubikey_otps={user.yubikey_otps}
                            recovery_codes={user.recovery_codes}
                            emergency_codes={user.emergency_codes}
                            onDeleteSessions={(selected_sessions) =>
                                this.onDeleteSessions(selected_sessions)
                            }
                            onDeleteMemberships={(selected_memberships) =>
                                this.onDeleteMemberships(selected_memberships)
                            }
                            onDeleteDuos={(selected_duos) =>
                                this.onDeleteDuos(selected_duos)
                            }
                            onDeleteYubikeyOtps={(selected_yubikey_otps) =>
                                this.onDeleteYubikeyOtps(selected_yubikey_otps)
                            }
                            onDeleteGoogleAuthenticators={(
                                selected_google_authenticators
                            ) =>
                                this.onDeleteGoogleAuthenticators(
                                    selected_google_authenticators
                                )
                            }
                            onDeleteRecoveryCodes={(selected_recovery_codes) =>
                                this.onDeleteRecoveryCodes(
                                    selected_recovery_codes
                                )
                            }
                            onDeleteEmergencyCodes={(
                                selected_emergency_codes
                            ) =>
                                this.onDeleteEmergencyCodes(
                                    selected_emergency_codes
                                )
                            }
                        />
                    </GridItem>
                </Grid>
            </div>
        );
    }
}

export default compose(withTranslation(), withStyles(customInputStyle))(User);
