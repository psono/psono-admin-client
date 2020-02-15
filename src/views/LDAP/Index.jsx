import React from 'react';
import { withStyles, Grid } from '@material-ui/core';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { LDAPCard, GridItem } from '../../components';
import dashboardStyle from '../../assets/jss/material-dashboard-react/dashboardStyle';
import psono_server from '../../services/api-server';

class Users extends React.Component {
    state = {
        redirect_to: '',
        ldap_users: [],
        ldap_groups: []
    };

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
                    <GridItem xs={12} sm={12} md={12}>
                        <LDAPCard
                            ldap_users={this.state.ldap_users}
                            ldap_groups={this.state.ldap_groups}
                            onSyncGroupsLdap={() => this.onSyncGroupsLdap()}
                        />
                    </GridItem>
                </Grid>
            </div>
        );
    }
}

Users.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(dashboardStyle)(Users);
