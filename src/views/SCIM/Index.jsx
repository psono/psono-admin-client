import React from 'react';
import { withStyles, Grid } from '@material-ui/core';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { SCIMCard, GridItem } from '../../components';
import dashboardStyle from '../../assets/jss/material-dashboard-react/dashboardStyle';
import psono_server from '../../services/api-server';
import store from '../../services/store';

class Users extends React.Component {
    state = {
        redirect_to: '',
        scim_groups: [],
    };

    createGroupsNode(scim_group) {
        scim_group.groups = (
            <div>
                {scim_group.groups.map(function (group, key) {
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
        this.loadScimGroups();
    }

    loadScimGroups() {
        psono_server
            .admin_scim_group(
                this.props.state.user.token,
                this.props.state.user.session_secret_key
            )
            .then((response) => {
                const { scim_groups } = response.data;

                scim_groups.forEach((scim_group) => {
                    scim_group['name'] =
                        scim_group['display_name'] || scim_group['scim_name'];
                    this.createGroupsNode(scim_group);
                });

                this.setState({
                    scim_groups,
                });
            });
    }

    onDeleteScimGroups(selectedGroups) {
        selectedGroups.forEach((group) => {
            psono_server
                .admin_delete_scim_group(
                    store.getState().user.token,
                    store.getState().user.session_secret_key,
                    group.id
                )
                .then(() => {
                    this.loadScimGroups();
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
                        <SCIMCard
                            scim_groups={this.state.scim_groups}
                            onDeleteScimGroups={(groups) =>
                                this.onDeleteScimGroups(groups)
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
