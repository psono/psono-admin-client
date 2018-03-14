import React from 'react';
import { Grid, Checkbox, withStyles } from 'material-ui';
import { Check } from 'material-ui-icons';

import { RegularCard, CustomInput, ItemGrid, UserCard } from '../../components';
import psono_server from '../../services/api-server';
import { customInputStyle } from '../../variables/styles';

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

                this.setState({
                    user: user
                });
            });
    }

    render() {
        const { classes } = this.props;
        const user = this.state.user;

        if (user) {
            console.log(user);

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
                                                            checked:
                                                                classes.checked
                                                        }}
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
                                                            checked:
                                                                classes.checked
                                                        }}
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
                                                            checked:
                                                                classes.checked
                                                        }}
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
                                groups={user.groups}
                                duos={user.duos}
                                google_authenticators={
                                    user.google_authenticators
                                }
                                yubikey_otps={user.yubikey_otps}
                                recovery_codes={user.recovery_codes}
                                onDeleteSessions={session_ids =>
                                    this.onDeleteSessions(session_ids)
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
