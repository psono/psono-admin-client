import React from 'react';
import { withStyles, Grid } from '@material-ui/core';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { SAMLCard, GridItem } from '../../components';
import dashboardStyle from '../../assets/jss/material-dashboard-react/dashboardStyle';
import psono_server from '../../services/api-server';
import notification from '../../services/notification';

class Users extends React.Component {
    state = {
        redirect_to: '',
        saml_groups: [],
    };

    createGroupsNode(saml_group) {
        saml_group.groups = (
            <div>
                {saml_group.groups.map(function (group, key) {
                    return (
                        <a href={'/portal/group/' + group.id} key={key}>
                            {group.name}
                        </a>
                    );
                })}
            </div>
        );
    }

    componentDidMount() {
        this.loadSamlGroups();
    }

    loadSamlGroups() {
        psono_server
            .admin_saml_group(
                this.props.state.user.token,
                this.props.state.user.session_secret_key
            )
            .then((response) => {
                const { saml_groups } = response.data;

                saml_groups.forEach((saml_group) => {
                    saml_group['name'] =
                        saml_group['display_name'] || saml_group['saml_name'];
                    this.createGroupsNode(saml_group);
                });

                this.setState({
                    saml_groups,
                });
            });
    }

    onSyncGroupsSaml() {
        psono_server
            .admin_saml_group_sync(
                this.props.state.user.token,
                this.props.state.user.session_secret_key
            )
            .then(
                (response) => {
                    this.loadSamlGroups();
                },
                (response) => {
                    const { non_field_errors } = response.data;
                    notification.error_send(non_field_errors[0]);
                }
            );
    }

    render() {
        if (this.state.redirect_to) {
            return <Redirect to={this.state.redirect_to} />;
        }
        return (
            <div>
                <Grid container>
                    <GridItem xs={12} sm={12} md={12}>
                        <SAMLCard
                            saml_groups={this.state.saml_groups}
                            onSyncGroupsSaml={() => this.onSyncGroupsSaml()}
                        />
                    </GridItem>
                </Grid>
            </div>
        );
    }
}

Users.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(dashboardStyle)(Users);
