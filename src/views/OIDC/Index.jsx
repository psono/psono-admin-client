import React from 'react';
import { withStyles, Grid } from '@material-ui/core';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { OIDCCard, GridItem } from '../../components';
import dashboardStyle from '../../assets/jss/material-dashboard-react/dashboardStyle';
import psono_server from '../../services/api-server';

class Users extends React.Component {
    state = {
        redirect_to: '',
        oidc_groups: []
    };

    createGroupsNode(oidc_group) {
        oidc_group.groups = (
            <div>
                {oidc_group.groups.map(function(group, key) {
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
        psono_server
            .admin_oidc_group(
                this.props.state.user.token,
                this.props.state.user.session_secret_key
            )
            .then(response => {
                const { oidc_groups } = response.data;

                oidc_groups.forEach(oidc_group => {
                    this.createGroupsNode(oidc_group);
                });

                this.setState({
                    oidc_groups
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
                        <OIDCCard oidc_groups={this.state.oidc_groups} />
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
