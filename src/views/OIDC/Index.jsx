import React from 'react';
import { withStyles, Grid } from '@material-ui/core';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { OIDCCard, GridItem } from '../../components';
import dashboardStyle from '../../assets/jss/material-dashboard-react/dashboardStyle';
import psono_server from '../../services/api-server';
import store from '../../services/store';

class Users extends React.Component {
    state = {
        redirect_to: '',
        oidc_groups: [],
    };

    createGroupsNode(oidc_group) {
        oidc_group.groups = (
            <div>
                {oidc_group.groups.map(function (group, key) {
                    return (
                        <>
                            {key !== 0 ? ', ' : ''}
                            <a href={'/portal/group/' + group.id} key={key}>
                                {group.name}
                            </a>
                        </>
                    );
                })}
            </div>
        );
    }

    componentDidMount() {
        this.loadOidcGroups();
    }

    loadOidcGroups() {
        psono_server
            .admin_oidc_group(
                this.props.state.user.token,
                this.props.state.user.session_secret_key
            )
            .then((response) => {
                const { oidc_groups } = response.data;

                oidc_groups.forEach((oidc_group) => {
                    oidc_group['name'] =
                        oidc_group['display_name'] || oidc_group['oidc_name'];
                    this.createGroupsNode(oidc_group);
                });

                this.setState({
                    oidc_groups,
                });
            });
    }

    onDeleteOidcGroups(selectedGroups) {
        selectedGroups.forEach((group) => {
            psono_server
                .admin_delete_oidc_group(
                    store.getState().user.token,
                    store.getState().user.session_secret_key,
                    group.id
                )
                .then(() => {
                    this.loadOidcGroups();
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
                        <OIDCCard
                            oidc_groups={this.state.oidc_groups}
                            onDeleteOidcGroups={(groups) =>
                                this.onDeleteOidcGroups(groups)
                            }
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
