import React from 'react';
import { withStyles, Grid } from 'material-ui';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { LDAPCard, ItemGrid } from '../../components';
import { dashboardStyle } from '../../variables/styles';
import psono_server from '../../services/api-server';
import helper from '../../services/helper';

class Users extends React.Component {
    state = {
        redirect_to: '',
        ldap_users: [],
        ldap_groups: []
    };

    onImportUsers(selected_ldap_users) {
        console.log(selected_ldap_users);
        selected_ldap_users.forEach(ldap_user => {
            psono_server.admin_ldap_import_user(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                ldap_user.id
            );
        });

        let { ldap_users } = this.state;
        selected_ldap_users.forEach(ldap_user => {
            helper.remove_from_array(ldap_users, ldap_user, function(a, b) {
                return a.id === b.id;
            });
        });

        this.setState({ ldap_users: ldap_users });
    }

    createGroupsNode(ldap_group) {
        ldap_group.groups = (
            <div>
                {ldap_group.groups.map(function(group, key) {
                    return (
                        <a href={'/portal/group/' + group.id} key={key}>
                            {group.name}
                        </a>
                    );
                })}
            </div>
        );
    }

    onSyncGroupsLdap() {
        psono_server
            .admin_ldap_group_sync(
                this.props.state.user.token,
                this.props.state.user.session_secret_key
            )
            .then(response => {
                const { ldap_groups } = response.data;
                ldap_groups.forEach(ldap_group => {
                    this.createGroupsNode(ldap_group);
                });
                this.setState({
                    ldap_groups
                });
            });
    }

    componentDidMount() {
        psono_server
            .admin_ldap_user(
                this.props.state.user.token,
                this.props.state.user.session_secret_key
            )
            .then(response => {
                const { ldap_users } = response.data;

                ldap_users.forEach(u => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                });
                this.setState({
                    ldap_users
                });
            });
        psono_server
            .admin_ldap_group(
                this.props.state.user.token,
                this.props.state.user.session_secret_key
            )
            .then(response => {
                const { ldap_groups } = response.data;

                ldap_groups.forEach(ldap_group => {
                    this.createGroupsNode(ldap_group);
                });

                this.setState({
                    ldap_groups
                });
            });
    }

    render() {
        if (this.state.redirect_to) {
            return <Redirect to={this.state.redirect_to} />;
        }
        return (
            <div>
                <Grid container>
                    <ItemGrid xs={12} sm={12} md={12}>
                        <LDAPCard
                            ldap_users={this.state.ldap_users}
                            ldap_groups={this.state.ldap_groups}
                            onImportUsers={selected_ldap_users =>
                                this.onImportUsers(selected_ldap_users)
                            }
                            onSyncGroupsLdap={() => this.onSyncGroupsLdap()}
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
