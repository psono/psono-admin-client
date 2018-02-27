import React from 'react';
import {
    withStyles, Grid
} from 'material-ui';
import PropTypes from 'prop-types';

import {
    UsersCard, ItemGrid
} from '../../components';

import { dashboardStyle } from '../../variables/styles';

import psono_server from '../../services/api-server'

class Users extends React.Component{
    state = {
        users: [],
        sessions: []
    };


    componentDidMount(){

        psono_server.admin_user(this.props.state.user.token, this.props.state.user.session_secret_key).then(
            (response) => {

                const { users } = response.data;

                users.forEach(function(u) {
                    u.is_active = u.is_active ? 'yes': 'no';
                    u.is_email_active = u.is_email_active ? 'yes': 'no';
                    u.yubikey_2fa = u.yubikey_2fa ? 'yes': 'no';
                    u.ga_2fa = u.ga_2fa ? 'yes': 'no';
                    u.duo_2fa = u.duo_2fa ? 'yes': 'no';
                });

                this.setState({
                    users
                });
            }
        );
        psono_server.admin_session(this.props.state.user.token, this.props.state.user.session_secret_key).then(
            (response) => {

                console.log(response.data);

                const { sessions } = response.data;

                sessions.forEach(function(u) {
                    u.active = u.active ? 'yes': 'no';
                });

                this.setState({
                    sessions
                });
            }
        );
    }


    render(){
        return (
            <div>
                <Grid container>
                    <ItemGrid xs={12} sm={12} md={12}>
                        <UsersCard
                            users={this.state.users}
                            sessions={this.state.sessions}
                        />
                    </ItemGrid>
                </Grid>
            </div>
        );
    }
}

Users.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(dashboardStyle)(Users);
