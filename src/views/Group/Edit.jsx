import React from 'react';
import { Grid, withStyles, Checkbox } from 'material-ui';
import { Check } from 'material-ui-icons';

import {
    RegularCard,
    CustomInput,
    ItemGrid,
    GroupCard
} from '../../components/index';
import psono_server from '../../services/api-server';
import { customInputStyle } from '../../variables/styles';
import helper from '../../services/helper';

class User extends React.Component {
    state = {};

    componentDidMount() {
        psono_server
            .admin_group(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                this.props.match.params.group_id
            )
            .then(response => {
                const group = response.data;

                group.memberships.forEach(u => {
                    u.accepted = u.accepted ? 'yes' : 'no';
                    u.admin = u.admin ? 'yes' : 'no';
                });

                const mapped_group_index = {};
                if (group.hasOwnProperty('ldap_groups')) {
                    group.ldap_groups.forEach(ldap_group => {
                        mapped_group_index[ldap_group.ldap_group_id] = {
                            ldap_group_id: ldap_group.ldap_group_id,
                            ldap_group_map_id: ldap_group.ldap_group_map_id,
                            share_admin: ldap_group.share_admin,
                            group_admin: ldap_group.group_admin
                        };
                    });
                }

                if (
                    this.props.state.server.authentication_methods.indexOf(
                        'LDAP'
                    ) !== -1 &&
                    group.is_managed
                ) {
                    psono_server
                        .admin_ldap_group(
                            this.props.state.user.token,
                            this.props.state.user.session_secret_key
                        )
                        .then(response => {
                            const ldap_groups = response.data.ldap_groups;

                            ldap_groups.forEach(ldap_group => {
                                if (
                                    mapped_group_index.hasOwnProperty(
                                        ldap_group.id
                                    )
                                ) {
                                    return;
                                }
                                mapped_group_index[ldap_group.id] = {
                                    ldap_group_id: ldap_group.id,
                                    ldap_group_map_id: '',
                                    share_admin: false,
                                    group_admin: false
                                };
                            });

                            this.setState({
                                group: group,
                                mapped_group_index: mapped_group_index,
                                ldap_groups: ldap_groups
                            });
                        });
                } else {
                    this.setState({
                        group: group,
                        mapped_group_index: mapped_group_index
                    });
                }
            });
    }

    onDeleteMemberships(selected_memberships) {
        selected_memberships.forEach(membership => {
            psono_server.admin_delete_membership(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                membership.id
            );
        });

        let { memberships } = this.state.group;
        selected_memberships.forEach(membership => {
            helper.remove_from_array(memberships, membership, function(a, b) {
                return a.id === b.id;
            });
        });

        this.setState({ group: this.state.group });
    }
    handleToggle(group) {
        const { mapped_group_index } = this.state;
        const is_mapped =
            mapped_group_index.hasOwnProperty(group.id) &&
            mapped_group_index[group.id]['ldap_group_map_id'];
        if (is_mapped) {
            this.removeMapping(group);
        } else {
            this.addMapping(group);
        }
    }

    addMapping(group) {
        psono_server
            .admin_ldap_create_group_map(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                this.state.group.id,
                group.id
            )
            .then(response => {
                const { mapped_group_index } = this.state;
                mapped_group_index[group.id]['ldap_group_map_id'] =
                    response.data.id;
                this.setState({
                    mapped_group_index
                });
            });
    }

    removeMapping(group) {
        const { mapped_group_index } = this.state;
        mapped_group_index[group.id]['ldap_group_map_id'] = '';
        this.setState({
            mapped_group_index
        });
        psono_server.admin_ldap_delete_group_map(
            this.props.state.user.token,
            this.props.state.user.session_secret_key,
            this.state.group.id,
            group.id
        );
    }
    handleToggleAdmin(group, type) {
        const { mapped_group_index } = this.state;
        const is_mapped =
            mapped_group_index.hasOwnProperty(group.id) &&
            mapped_group_index[group.id]['ldap_group_map_id'];
        if (!is_mapped) {
            return;
        }

        let group_admin = mapped_group_index[group.id]['group_admin'];
        let share_admin = mapped_group_index[group.id]['share_admin'];

        if (type === 'group') {
            psono_server
                .admin_ldap_update_group_map(
                    this.props.state.user.token,
                    this.props.state.user.session_secret_key,
                    mapped_group_index[group.id]['ldap_group_map_id'],
                    !group_admin,
                    share_admin
                )
                .then(response => {
                    const { mapped_group_index } = this.state;
                    mapped_group_index[group.id]['group_admin'] = !group_admin;
                    this.setState({
                        mapped_group_index
                    });
                });
        } else {
            psono_server
                .admin_ldap_update_group_map(
                    this.props.state.user.token,
                    this.props.state.user.session_secret_key,
                    mapped_group_index[group.id]['ldap_group_map_id'],
                    group_admin,
                    !share_admin
                )
                .then(response => {
                    const { mapped_group_index } = this.state;
                    mapped_group_index[group.id]['share_admin'] = !share_admin;
                    this.setState({
                        mapped_group_index
                    });
                });
        }
    }

    render() {
        const { group, ldap_groups, mapped_group_index } = this.state;
        const { classes } = this.props;
        if (ldap_groups) {
            ldap_groups.forEach(ldap_group => {
                ldap_group.mapped = (
                    <Checkbox
                        checked={
                            mapped_group_index.hasOwnProperty(ldap_group.id) &&
                            mapped_group_index[ldap_group.id][
                                'ldap_group_map_id'
                            ]
                        }
                        tabIndex={-1}
                        onClick={() => {
                            this.handleToggle(ldap_group);
                        }}
                        checkedIcon={<Check className={classes.checkedIcon} />}
                        icon={<Check className={classes.uncheckedIcon} />}
                        classes={{
                            checked: classes.checked
                        }}
                    />
                );
                ldap_group.has_group_admin = (
                    <Checkbox
                        checked={
                            mapped_group_index.hasOwnProperty(ldap_group.id) &&
                            mapped_group_index[ldap_group.id]['group_admin']
                        }
                        tabIndex={-1}
                        onClick={() => {
                            this.handleToggleAdmin(ldap_group, 'group');
                        }}
                        checkedIcon={<Check className={classes.checkedIcon} />}
                        icon={<Check className={classes.uncheckedIcon} />}
                        classes={{
                            checked: classes.checked
                        }}
                    />
                );
                ldap_group.has_share_admin = (
                    <Checkbox
                        checked={
                            mapped_group_index.hasOwnProperty(ldap_group.id) &&
                            mapped_group_index[ldap_group.id]['share_admin']
                        }
                        tabIndex={-1}
                        onClick={() => {
                            this.handleToggleAdmin(ldap_group, 'share');
                        }}
                        checkedIcon={<Check className={classes.checkedIcon} />}
                        icon={<Check className={classes.uncheckedIcon} />}
                        classes={{
                            checked: classes.checked
                        }}
                    />
                );
            });
        }

        if (group) {
            return (
                <div>
                    <Grid container>
                        <ItemGrid xs={12} sm={12} md={12}>
                            <RegularCard
                                cardTitle="Edit Group"
                                cardSubtitle="Update the group details"
                                content={
                                    <div>
                                        <Grid container>
                                            <ItemGrid xs={12} sm={12} md={12}>
                                                <CustomInput
                                                    labelText="Name"
                                                    id="name"
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    inputProps={{
                                                        value: group.name,
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
                                                        value: group.public_key,
                                                        disabled: true,
                                                        readOnly: true
                                                    }}
                                                />
                                            </ItemGrid>
                                        </Grid>
                                        <Grid container>
                                            <ItemGrid xs={12} sm={12} md={4}>
                                                <CustomInput
                                                    labelText="Creation Date"
                                                    id="create_date"
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    inputProps={{
                                                        value:
                                                            group.create_date,
                                                        disabled: true,
                                                        readOnly: true
                                                    }}
                                                />
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
                            <GroupCard
                                memberships={group.memberships}
                                onDeleteMemberships={selected_memberships =>
                                    this.onDeleteMemberships(
                                        selected_memberships
                                    )
                                }
                                ldap_groups={ldap_groups}
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
