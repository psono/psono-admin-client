import React from 'react';
import { Grid, withStyles, Checkbox } from 'material-ui';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import moment from 'moment';
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
        const { t } = this.props;
        psono_server
            .admin_group(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                this.props.match.params.group_id
            )
            .then(response => {
                const group = response.data;

                group.memberships.forEach(u => {
                    u.accepted = u.accepted ? t('YES') : t('NO');
                    u.admin = u.admin ? t('YES') : t('NO');
                    u.share_admin = u.share_admin ? t('YES') : t('NO');
                });

                const mapped_ldap_group_index = {};
                if (group.hasOwnProperty('ldap_groups')) {
                    group.ldap_groups.forEach(ldap_group => {
                        mapped_ldap_group_index[ldap_group.ldap_group_id] = {
                            ldap_group_id: ldap_group.ldap_group_id,
                            ldap_group_map_id: ldap_group.ldap_group_map_id,
                            share_admin: ldap_group.share_admin,
                            group_admin: ldap_group.group_admin
                        };
                    });
                }

                const mapped_saml_group_index = {};
                if (group.hasOwnProperty('saml_groups')) {
                    group.saml_groups.forEach(saml_group => {
                        mapped_saml_group_index[saml_group.saml_group_id] = {
                            saml_group_id: saml_group.saml_group_id,
                            saml_group_map_id: saml_group.saml_group_map_id,
                            share_admin: saml_group.share_admin,
                            group_admin: saml_group.group_admin
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
                                    mapped_ldap_group_index.hasOwnProperty(
                                        ldap_group.id
                                    )
                                ) {
                                    return;
                                }
                                mapped_ldap_group_index[ldap_group.id] = {
                                    ldap_group_id: ldap_group.id,
                                    ldap_group_map_id: '',
                                    share_admin: false,
                                    group_admin: false
                                };
                            });

                            this.setState({
                                group: group,
                                mapped_ldap_group_index: mapped_ldap_group_index,
                                ldap_groups: ldap_groups
                            });
                        });
                } else {
                    this.setState({
                        group: group,
                        mapped_ldap_group_index: mapped_ldap_group_index
                    });
                }

                if (
                    this.props.state.server.authentication_methods.indexOf(
                        'SAML'
                    ) !== -1 &&
                    group.is_managed
                ) {
                    psono_server
                        .admin_saml_group(
                            this.props.state.user.token,
                            this.props.state.user.session_secret_key
                        )
                        .then(response => {
                            const saml_groups = response.data.saml_groups;

                            saml_groups.forEach(saml_group => {
                                if (
                                    mapped_saml_group_index.hasOwnProperty(
                                        saml_group.id
                                    )
                                ) {
                                    return;
                                }
                                mapped_saml_group_index[saml_group.id] = {
                                    saml_group_id: saml_group.id,
                                    saml_group_map_id: '',
                                    share_admin: false,
                                    group_admin: false
                                };
                            });

                            this.setState({
                                group: group,
                                mapped_saml_group_index: mapped_saml_group_index,
                                saml_groups: saml_groups
                            });
                        });
                } else {
                    this.setState({
                        group: group,
                        mapped_saml_group_index: mapped_saml_group_index
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

    handleToggleLDAP(group) {
        const { mapped_ldap_group_index } = this.state;
        const is_mapped =
            mapped_ldap_group_index.hasOwnProperty(group.id) &&
            mapped_ldap_group_index[group.id]['ldap_group_map_id'];

        if (is_mapped) {
            this.removeMappingLDAP(group);
        } else {
            this.addMappingLDAP(group);
        }
    }

    handleToggleSAML(group) {
        const { mapped_saml_group_index } = this.state;
        const is_mapped =
            mapped_saml_group_index.hasOwnProperty(group.id) &&
            mapped_saml_group_index[group.id]['saml_group_map_id'];

        if (is_mapped) {
            this.removeMappingSAML(group);
        } else {
            this.addMappingSAML(group);
        }
    }

    addMappingLDAP(group) {
        psono_server
            .admin_ldap_create_group_map(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                this.state.group.id,
                group.id
            )
            .then(response => {
                const { mapped_ldap_group_index } = this.state;
                mapped_ldap_group_index[group.id]['ldap_group_map_id'] =
                    response.data.id;
                this.setState({
                    mapped_ldap_group_index
                });
            });
    }

    addMappingSAML(group) {
        psono_server
            .admin_saml_create_group_map(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                this.state.group.id,
                group.id
            )
            .then(response => {
                const { mapped_saml_group_index } = this.state;
                mapped_saml_group_index[group.id]['saml_group_map_id'] =
                    response.data.id;
                this.setState({
                    mapped_saml_group_index
                });
            });
    }

    removeMappingLDAP(group) {
        const { mapped_ldap_group_index } = this.state;
        mapped_ldap_group_index[group.id]['ldap_group_map_id'] = '';
        this.setState({
            mapped_ldap_group_index
        });
        psono_server.admin_ldap_delete_group_map(
            this.props.state.user.token,
            this.props.state.user.session_secret_key,
            this.state.group.id,
            group.id
        );
    }

    removeMappingSAML(group) {
        const { mapped_saml_group_index } = this.state;
        mapped_saml_group_index[group.id]['saml_group_map_id'] = '';
        this.setState({
            mapped_saml_group_index
        });
        psono_server.admin_saml_delete_group_map(
            this.props.state.user.token,
            this.props.state.user.session_secret_key,
            this.state.group.id,
            group.id
        );
    }

    handleToggleAdminLDAP(group, type) {
        const { mapped_ldap_group_index } = this.state;
        const is_mapped =
            mapped_ldap_group_index.hasOwnProperty(group.id) &&
            mapped_ldap_group_index[group.id]['ldap_group_map_id'];
        if (!is_mapped) {
            return;
        }

        let group_admin = mapped_ldap_group_index[group.id]['group_admin'];
        let share_admin = mapped_ldap_group_index[group.id]['share_admin'];

        if (type === 'group') {
            psono_server
                .admin_ldap_update_group_map(
                    this.props.state.user.token,
                    this.props.state.user.session_secret_key,
                    mapped_ldap_group_index[group.id]['ldap_group_map_id'],
                    !group_admin,
                    share_admin
                )
                .then(response => {
                    const { mapped_ldap_group_index } = this.state;
                    mapped_ldap_group_index[group.id][
                        'group_admin'
                    ] = !group_admin;
                    this.setState({
                        mapped_ldap_group_index
                    });
                });
        } else {
            psono_server
                .admin_ldap_update_group_map(
                    this.props.state.user.token,
                    this.props.state.user.session_secret_key,
                    mapped_ldap_group_index[group.id]['ldap_group_map_id'],
                    group_admin,
                    !share_admin
                )
                .then(response => {
                    const { mapped_ldap_group_index } = this.state;
                    mapped_ldap_group_index[group.id][
                        'share_admin'
                    ] = !share_admin;
                    this.setState({
                        mapped_ldap_group_index
                    });
                });
        }
    }

    handleToggleAdminSAML(group, type) {
        const { mapped_saml_group_index } = this.state;
        const is_mapped =
            mapped_saml_group_index.hasOwnProperty(group.id) &&
            mapped_saml_group_index[group.id]['saml_group_map_id'];
        if (!is_mapped) {
            return;
        }

        let group_admin = mapped_saml_group_index[group.id]['group_admin'];
        let share_admin = mapped_saml_group_index[group.id]['share_admin'];

        if (type === 'group') {
            psono_server
                .admin_saml_update_group_map(
                    this.props.state.user.token,
                    this.props.state.user.session_secret_key,
                    mapped_saml_group_index[group.id]['saml_group_map_id'],
                    !group_admin,
                    share_admin
                )
                .then(response => {
                    const { mapped_saml_group_index } = this.state;
                    mapped_saml_group_index[group.id][
                        'group_admin'
                    ] = !group_admin;
                    this.setState({
                        mapped_saml_group_index
                    });
                });
        } else {
            psono_server
                .admin_saml_update_group_map(
                    this.props.state.user.token,
                    this.props.state.user.session_secret_key,
                    mapped_saml_group_index[group.id]['saml_group_map_id'],
                    group_admin,
                    !share_admin
                )
                .then(response => {
                    const { mapped_saml_group_index } = this.state;
                    mapped_saml_group_index[group.id][
                        'share_admin'
                    ] = !share_admin;
                    this.setState({
                        mapped_saml_group_index
                    });
                });
        }
    }

    render() {
        const {
            group,
            ldap_groups,
            mapped_ldap_group_index,
            saml_groups,
            mapped_saml_group_index
        } = this.state;
        const { classes, t } = this.props;
        if (ldap_groups) {
            ldap_groups.forEach(ldap_group => {
                ldap_group.mapped = (
                    <Checkbox
                        checked={
                            mapped_ldap_group_index.hasOwnProperty(
                                ldap_group.id
                            ) &&
                            mapped_ldap_group_index[ldap_group.id][
                                'ldap_group_map_id'
                            ]
                        }
                        tabIndex={-1}
                        onClick={() => {
                            this.handleToggleLDAP(ldap_group);
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
                            mapped_ldap_group_index.hasOwnProperty(
                                ldap_group.id
                            ) &&
                            mapped_ldap_group_index[ldap_group.id][
                                'group_admin'
                            ]
                        }
                        tabIndex={-1}
                        onClick={() => {
                            this.handleToggleAdminLDAP(
                                ldap_group,
                                'group',
                                'LDAP'
                            );
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
                            mapped_ldap_group_index.hasOwnProperty(
                                ldap_group.id
                            ) &&
                            mapped_ldap_group_index[ldap_group.id][
                                'share_admin'
                            ]
                        }
                        tabIndex={-1}
                        onClick={() => {
                            this.handleToggleAdminLDAP(
                                ldap_group,
                                'share',
                                'LDAP'
                            );
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
        if (saml_groups) {
            saml_groups.forEach(saml_group => {
                saml_group.mapped = (
                    <Checkbox
                        checked={
                            mapped_saml_group_index.hasOwnProperty(
                                saml_group.id
                            ) &&
                            mapped_saml_group_index[saml_group.id][
                                'saml_group_map_id'
                            ]
                        }
                        tabIndex={-1}
                        onClick={() => {
                            this.handleToggleSAML(saml_group);
                        }}
                        checkedIcon={<Check className={classes.checkedIcon} />}
                        icon={<Check className={classes.uncheckedIcon} />}
                        classes={{
                            checked: classes.checked
                        }}
                    />
                );
                saml_group.has_group_admin = (
                    <Checkbox
                        checked={
                            mapped_saml_group_index.hasOwnProperty(
                                saml_group.id
                            ) &&
                            mapped_saml_group_index[saml_group.id][
                                'group_admin'
                            ]
                        }
                        tabIndex={-1}
                        onClick={() => {
                            this.handleToggleAdminSAML(
                                saml_group,
                                'group',
                                'SAML'
                            );
                        }}
                        checkedIcon={<Check className={classes.checkedIcon} />}
                        icon={<Check className={classes.uncheckedIcon} />}
                        classes={{
                            checked: classes.checked
                        }}
                    />
                );
                saml_group.has_share_admin = (
                    <Checkbox
                        checked={
                            mapped_saml_group_index.hasOwnProperty(
                                saml_group.id
                            ) &&
                            mapped_saml_group_index[saml_group.id][
                                'share_admin'
                            ]
                        }
                        tabIndex={-1}
                        onClick={() => {
                            this.handleToggleAdminSAML(
                                saml_group,
                                'share',
                                'SAML'
                            );
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
                                cardTitle={t('EDIT_GROUP')}
                                cardSubtitle={t('UPDATE_GROUP_DETAILS')}
                                content={
                                    <div>
                                        <Grid container>
                                            <ItemGrid xs={12} sm={12} md={12}>
                                                <CustomInput
                                                    labelText={t('NAME')}
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
                                                    labelText={t('PUBLIC_KEY')}
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
                                                    labelText={t(
                                                        'CREATION_DATE'
                                                    )}
                                                    id="create_date"
                                                    formControlProps={{
                                                        fullWidth: true
                                                    }}
                                                    inputProps={{
                                                        value: moment(
                                                            group.create_date
                                                        ).format(
                                                            'YYYY-MM-DD HH:mm:ss'
                                                        ),
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
                                saml_groups={saml_groups}
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

export default compose(withTranslation(), withStyles(customInputStyle))(User);
