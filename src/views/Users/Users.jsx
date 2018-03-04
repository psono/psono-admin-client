import React from 'react';
import { withStyles, Grid } from 'material-ui';
import PropTypes from 'prop-types';

import { UsersCard, ItemGrid } from '../../components';
import { dashboardStyle } from '../../variables/styles';
import psono_server from '../../services/api-server';
import helper from '../../services/helper';

class Users extends React.Component {
    state = {
        users: [],
        sessions: []
    };

    onDeleteUsers(user_ids) {
        user_ids.forEach(user_id => {
            psono_server.admin_delete_user(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                user_id
            );
        });

        let { users } = this.state;
        user_ids.forEach(user_id => {
            helper.remove_from_array(users, user_id, function(a, b) {
                return a.id === b;
            });
        });

        this.setState({ users: users });
    }

    update_users(user_ids, is_active) {
        let { users } = this.state;
        user_ids.forEach(user_id => {
            psono_server.admin_update_user(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                user_id,
                is_active
            );

            users.forEach(user => {
                if (user.id === user_id) {
                    user.is_active = is_active ? 'yes' : 'no';
                }
            });
        });

        this.setState({ users: users });
    }

    onActivateUsers(user_ids) {
        return this.update_users(user_ids, true);
    }

    onDeactivateUsers(user_ids) {
        return this.update_users(user_ids, false);
    }

    onDeleteSessions(session_ids) {
        session_ids.forEach(session_id => {
            psono_server.admin_delete_session(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                session_id
            );
        });

        let { sessions } = this.state;
        session_ids.forEach(session_id => {
            helper.remove_from_array(sessions, session_id, function(a, b) {
                return a.id === b;
            });
        });

        this.setState({ sessions: sessions });
    }

    componentDidMount() {
        psono_server
            .admin_user(
                this.props.state.user.token,
                this.props.state.user.session_secret_key
            )
            .then(response => {
                const { users } = response.data;

                users.forEach(u => {
                    u.is_active = u.is_active ? 'yes' : 'no';
                    u.is_email_active = u.is_email_active ? 'yes' : 'no';
                    u.yubikey_2fa = u.yubikey_2fa ? 'yes' : 'no';
                    u.ga_2fa = u.ga_2fa ? 'yes' : 'no';
                    u.duo_2fa = u.duo_2fa ? 'yes' : 'no';
                });

                this.setState({
                    users
                });
            });
        psono_server
            .admin_session(
                this.props.state.user.token,
                this.props.state.user.session_secret_key
            )
            .then(response => {
                const { sessions } = response.data;

                sessions.forEach(u => {
                    u.active = u.active ? 'yes' : 'no';
                });

                this.setState({
                    sessions
                });
            });
    }

    render() {
        return (
            <div>
                <Grid container>
                    <ItemGrid xs={12} sm={12} md={12}>
                        <UsersCard
                            users={this.state.users}
                            sessions={this.state.sessions}
                            onDeleteUsers={user_ids =>
                                this.onDeleteUsers(user_ids)
                            }
                            onActivate={user_ids =>
                                this.onActivateUsers(user_ids)
                            }
                            onDeactivate={user_ids =>
                                this.onDeactivateUsers(user_ids)
                            }
                            onDeleteSessions={session_ids =>
                                this.onDeleteSessions(session_ids)
                            }
                        />
                    </ItemGrid>
                </Grid>
            </div>
        );
    }
}

Users.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(dashboardStyle)(Users);
