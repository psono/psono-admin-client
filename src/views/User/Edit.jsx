import React from 'react';
import { Grid, Checkbox, withStyles } from 'material-ui';

import { RegularCard, CustomInput, ItemGrid, UserCard } from '../../components';
import psono_server from '../../services/api-server';
import { customInputStyle } from '../../variables/styles';
import helper from '../../services/helper';

class User extends React.Component {
    state = {};

    componentDidMount() {
        psono_server
            .admin_user(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                this.props.match.params.user_id
            )
            .then(response => {
                const user = response.data;

                user.sessions.forEach(u => {
                    u.active = u.active ? 'yes' : 'no';
                });

                user.duos.forEach(u => {
                    u.active = u.active ? 'yes' : 'no';
                });

                user.yubikey_otps.forEach(u => {
                    u.active = u.active ? 'yes' : 'no';
                });

                user.google_authenticators.forEach(u => {
                    u.active = u.active ? 'yes' : 'no';
                });

                user.memberships.forEach(u => {
                    u.accepted = u.accepted ? 'yes' : 'no';
                    u.admin = u.admin ? 'yes' : 'no';
                });

                this.setState({
                    user: user
                });
            });
    }

    onDeleteSessions(selected_sessions) {
        selected_sessions.forEach(session => {
            psono_server.admin_delete_session(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                session.id
            );
        });

        let { sessions } = this.state.user;
        selected_sessions.forEach(session => {
            helper.remove_from_array(sessions, session, function(a, b) {
                return a.id === b.id;
            });
        });

        this.setState({ sessions: sessions });
    }

    onDeleteMemberships(selected_memberships) {
        selected_memberships.forEach(membership => {
            psono_server.admin_delete_membership(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                membership.id
            );
        });

        let { memberships } = this.state.user;
        selected_memberships.forEach(membership => {
            helper.remove_from_array(memberships, membership, function(a, b) {
                return a.id === b.id;
            });
        });

        this.setState({ memberships: memberships });
    }

    onDeleteDuos(selected_duos) {
        selected_duos.forEach(duo => {
            psono_server.admin_delete_duo(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                duo.id
            );
        });

        let { duos } = this.state.user;
        selected_duos.forEach(duo => {
            helper.remove_from_array(duos, duo, function(a, b) {
                return a.id === b.id;
            });
        });

        this.setState({ duos: duos });
    }

    onDeleteYubikeyOtps(selected_yubikey_otps) {
        selected_yubikey_otps.forEach(yubikey_otp => {
            psono_server.admin_delete_yubikey_otp(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                yubikey_otp.id
            );
        });

        let { yubikey_otps } = this.state.user;
        selected_yubikey_otps.forEach(yubikey_otp => {
            helper.remove_from_array(yubikey_otps, yubikey_otp, function(a, b) {
                return a.id === b.id;
            });
        });

        this.setState({ yubikey_otps: yubikey_otps });
    }

    onDeleteGoogleAuthenticators(selected_google_authenticators) {
        selected_google_authenticators.forEach(google_authenticator => {
            psono_server.admin_delete_google_authenticator(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                google_authenticator.id
            );
        });

        let { google_authenticators } = this.state.user;
        selected_google_authenticators.forEach(google_authenticator => {
            helper.remove_from_array(
                google_authenticators,
                google_authenticator,
                function(a, b) {
                    return a.id === b.id;
                }
            );
        });

        this.setState({ google_authenticators: google_authenticators });
    }

    onDeleteRecoveryCodes(selected_recovery_codes) {
        selected_recovery_codes.forEach(recovery_code => {
            psono_server.admin_delete_recovery_code(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                recovery_code.id
            );
        });

        let { recovery_codes } = this.state.user;
        selected_recovery_codes.forEach(recovery_code => {
            helper.remove_from_array(recovery_codes, recovery_code, function(
                a,
                b
            ) {
                console.log(a);
                console.log(b);
                return a.id === b.id;
            });
        });

        this.setState({ recovery_codes: recovery_codes });
    }

    onDeleteEmergencyCodes(selected_emergency_codes) {
        selected_emergency_codes.forEach(emergency_code => {
            psono_server.admin_delete_emergency_code(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                emergency_code.id
            );
        });

        let { emergency_codes } = this.state.user;
        selected_emergency_codes.forEach(emergency_code => {
            helper.remove_from_array(emergency_codes, emergency_code, function(
                a,
                b
            ) {
                return a.id === b.id;
            });
        });

        this.setState({ emergency_codes: emergency_codes });
    }

    render() {
        const { classes } = this.props;
        const user = this.state.user;

        if (user) {
            if (user.authentication === 'AUTHKEY') {
                this.authentication = 'Normal';
            } else if (user.authentication === 'LDAP') {
                this.authentication = 'LDAP';
            } else {
                this.authentication = 'UNKNOWN';
            }

            return (
                <div>
                    <Grid container>
                        <ItemGrid xs={12} sm={12} md={12}>
                            <RegularCard
                                cardTitle="Edit User"
                                cardSubtitle="Update the user details"
                                content={
                                    <div>
                                        <Grid container>
                                            <ItemGrid xs={12} sm={12} md={7}>
                                                <CustomInput
                                                    labelText="Username"
                                                    id="username"
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    inputProps={{
                                                        value: user.username,
                                                        disabled: true,
                                                        readOnly: true
                                                    }}
                                                />
                                            </ItemGrid>
                                            <ItemGrid xs={12} sm={12} md={5}>
                                                <CustomInput
                                                    labelText="Authentication"
                                                    id="authentication"
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    inputProps={{
                                                        value: this
                                                            .authentication,
                                                        disabled: true,
                                                        readOnly: true
                                                    }}
                                                />
                                            </ItemGrid>
                                        </Grid>
                                        <Grid container>
                                            <ItemGrid xs={12} sm={12} md={12}>
                                                <CustomInput
                                                    labelText="Public Key"
                                                    id="public_key"
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    inputProps={{
                                                        value: user.public_key,
                                                        disabled: true,
                                                        readOnly: true
                                                    }}
                                                />
                                            </ItemGrid>
                                        </Grid>
                                        <Grid container>
                                            <ItemGrid xs={12} sm={12} md={4}>
                                                <CustomInput
                                                    labelText="Registration Date"
                                                    id="create_date"
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    inputProps={{
                                                        value: user.create_date,
                                                        disabled: true,
                                                        readOnly: true
                                                    }}
                                                />
                                            </ItemGrid>
                                        </Grid>
                                        <Grid container>
                                            <ItemGrid xs={12} sm={6} md={4}>
                                                <div
                                                    className={classes.checkbox}
                                                >
                                                    <Checkbox
                                                        tabIndex={1}
                                                        checked={user.is_active}
                                                        disabled
                                                    />{' '}
                                                    Active
                                                </div>
                                            </ItemGrid>
                                            <ItemGrid xs={12} sm={6} md={4}>
                                                <div
                                                    className={classes.checkbox}
                                                >
                                                    <Checkbox
                                                        tabIndex={1}
                                                        checked={
                                                            user.is_email_active
                                                        }
                                                        disabled
                                                    />{' '}
                                                    Email Verified
                                                </div>
                                            </ItemGrid>
                                            <ItemGrid xs={12} sm={6} md={4}>
                                                <div
                                                    className={classes.checkbox}
                                                >
                                                    <Checkbox
                                                        tabIndex={1}
                                                        checked={
                                                            user.is_superuser
                                                        }
                                                        disabled
                                                    />{' '}
                                                    Superuser
                                                </div>
                                            </ItemGrid>
                                        </Grid>
                                    </div>
                                }
                                // footer={
                                //     <Button color="primary">Update User</Button>
                                // }
                            />
                        </ItemGrid>
                    </Grid>
                    <Grid container>
                        <ItemGrid xs={12} sm={12} md={12}>
                            <UserCard
                                sessions={user.sessions}
                                memberships={user.memberships}
                                duos={user.duos}
                                google_authenticators={
                                    user.google_authenticators
                                }
                                yubikey_otps={user.yubikey_otps}
                                recovery_codes={user.recovery_codes}
                                emergency_codes={user.emergency_codes}
                                onDeleteSessions={selected_sessions =>
                                    this.onDeleteSessions(selected_sessions)
                                }
                                onDeleteMemberships={selected_memberships =>
                                    this.onDeleteMemberships(
                                        selected_memberships
                                    )
                                }
                                onDeleteDuos={selected_duos =>
                                    this.onDeleteDuos(selected_duos)
                                }
                                onDeleteYubikeyOtps={selected_yubikey_otps =>
                                    this.onDeleteYubikeyOtps(
                                        selected_yubikey_otps
                                    )
                                }
                                onDeleteGoogleAuthenticators={selected_google_authenticators =>
                                    this.onDeleteGoogleAuthenticators(
                                        selected_google_authenticators
                                    )
                                }
                                onDeleteRecoveryCodes={selected_recovery_codes =>
                                    this.onDeleteRecoveryCodes(
                                        selected_recovery_codes
                                    )
                                }
                                onDeleteEmergencyCodes={selected_emergency_codes =>
                                    this.onDeleteEmergencyCodes(
                                        selected_emergency_codes
                                    )
                                }
                            />
                        </ItemGrid>
                    </Grid>
                </div>
            );
        } else {
            return null;
        }
    }
}

export default withStyles(customInputStyle)(User);
