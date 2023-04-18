import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import moment from 'moment';

import { makeStyles } from '@material-ui/core/styles';
import { Grid, Checkbox } from '@material-ui/core';
import { CheckBox, CheckBoxOutlineBlank } from '@material-ui/icons';

import {
    RegularCard,
    CustomInput,
    GridItem,
    GroupCard,
} from '../../components/index';
import psono_server from '../../services/api-server';
import customInputStyle from '../../assets/jss/material-dashboard-react/customInputStyle';
import helper from '../../services/helper';

const useStyles = makeStyles(customInputStyle);

const GroupEdit = (props) => {
    const classes = useStyles();
    const { t } = useTranslation();

    const params = useParams();
    const [mappedLdapGroupIndex, setMappedLdapGroupIndex] = useState({});
    const [mappedSamlGroupIndex, setMappedSamlGroupIndex] = useState({});
    const [mappedOidcGroupIndex, setMappedOidcGroupIndex] = useState({});
    const [group, setGroup] = useState(null);
    const [ldapGroups, setLdapGroups] = useState([]);
    const [samlGroups, setSamlGroups] = useState([]);
    const [oidcGroups, setOidcGroups] = useState([]);

    React.useEffect(() => {
        loadGroup();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function loadGroup() {
        psono_server
            .admin_group(
                props.state.user.token,
                props.state.user.session_secret_key,
                params.group_id
            )
            .then((response) => {
                const group = response.data;

                group.share_rights.forEach((u) => {
                    u.read = u.read ? t('YES') : t('NO');
                    u.write = u.write ? t('YES') : t('NO');
                    u.grant = u.grant ? t('YES') : t('NO');
                });

                group.memberships.forEach((u) => {
                    u.accepted = u.accepted ? t('YES') : t('NO');

                    u.admin_raw = u.admin;
                    u.admin = (
                        <Checkbox
                            checked={u.admin_raw}
                            tabIndex={-1}
                            onClick={() => {
                                handleToggleGroupAdmin(u);
                            }}
                            checkedIcon={
                                <CheckBox className={classes.checkedIcon} />
                            }
                            icon={
                                <CheckBoxOutlineBlank
                                    className={classes.uncheckedIcon}
                                />
                            }
                            classes={{
                                checked: classes.checked,
                            }}
                        />
                    );

                    u.share_admin_raw = u.share_admin;
                    u.share_admin = (
                        <Checkbox
                            checked={u.share_admin_raw}
                            tabIndex={-1}
                            onClick={() => {
                                handleToggleShareAdmin(u);
                            }}
                            checkedIcon={
                                <CheckBox className={classes.checkedIcon} />
                            }
                            icon={
                                <CheckBoxOutlineBlank
                                    className={classes.uncheckedIcon}
                                />
                            }
                            classes={{
                                checked: classes.checked,
                            }}
                        />
                    );
                });

                const mappedLdapGroupIndex = {};
                if (group.hasOwnProperty('ldap_groups')) {
                    group.ldap_groups.forEach((ldap_group) => {
                        mappedLdapGroupIndex[ldap_group.ldap_group_id] = {
                            ldap_group_id: ldap_group.ldap_group_id,
                            ldap_group_map_id: ldap_group.ldap_group_map_id,
                            share_admin: ldap_group.share_admin,
                            group_admin: ldap_group.group_admin,
                        };
                    });
                }

                const mappedSamlGroupIndex = {};
                if (group.hasOwnProperty('saml_groups')) {
                    group.saml_groups.forEach((saml_group) => {
                        mappedSamlGroupIndex[saml_group.saml_group_id] = {
                            saml_group_id: saml_group.saml_group_id,
                            saml_group_map_id: saml_group.saml_group_map_id,
                            share_admin: saml_group.share_admin,
                            group_admin: saml_group.group_admin,
                        };
                    });
                }
                const mappedOidcGroupIndex = {};
                if (group.hasOwnProperty('oidc_groups')) {
                    group.oidc_groups.forEach((oidc_group) => {
                        mappedOidcGroupIndex[oidc_group.oidc_group_id] = {
                            oidc_group_id: oidc_group.oidc_group_id,
                            oidc_group_map_id: oidc_group.oidc_group_map_id,
                            share_admin: oidc_group.share_admin,
                            group_admin: oidc_group.group_admin,
                        };
                    });
                }

                if (
                    props.state.server.authentication_methods.indexOf(
                        'LDAP'
                    ) !== -1 &&
                    group.is_managed
                ) {
                    psono_server
                        .admin_ldap_group(
                            props.state.user.token,
                            props.state.user.session_secret_key
                        )
                        .then((response) => {
                            const ldapGroups = response.data.ldap_groups;

                            ldapGroups.forEach((ldap_group) => {
                                if (
                                    mappedLdapGroupIndex.hasOwnProperty(
                                        ldap_group.id
                                    )
                                ) {
                                    return;
                                }
                                mappedLdapGroupIndex[ldap_group.id] = {
                                    ldap_group_id: ldap_group.id,
                                    ldap_group_map_id: '',
                                    share_admin: false,
                                    group_admin: false,
                                };
                            });
                            setGroup(group);
                            setMappedLdapGroupIndex(mappedLdapGroupIndex);
                            setLdapGroups(ldapGroups);
                        });
                } else {
                    setGroup(group);
                    setMappedLdapGroupIndex(mappedLdapGroupIndex);
                }

                if (
                    props.state.server.authentication_methods.indexOf(
                        'SAML'
                    ) !== -1 &&
                    group.is_managed
                ) {
                    psono_server
                        .admin_saml_group(
                            props.state.user.token,
                            props.state.user.session_secret_key
                        )
                        .then((response) => {
                            const samlGroups = response.data.saml_groups;

                            samlGroups.forEach((saml_group) => {
                                if (
                                    mappedSamlGroupIndex.hasOwnProperty(
                                        saml_group.id
                                    )
                                ) {
                                    return;
                                }
                                mappedSamlGroupIndex[saml_group.id] = {
                                    saml_group_id: saml_group.id,
                                    saml_group_map_id: '',
                                    share_admin: false,
                                    group_admin: false,
                                };
                            });
                            setGroup(group);
                            setMappedSamlGroupIndex(mappedSamlGroupIndex);
                            setSamlGroups(samlGroups);
                        });
                } else {
                    setGroup(group);
                    setMappedSamlGroupIndex(mappedSamlGroupIndex);
                }

                if (
                    props.state.server.authentication_methods.indexOf(
                        'OIDC'
                    ) !== -1 &&
                    group.is_managed
                ) {
                    psono_server
                        .admin_oidc_group(
                            props.state.user.token,
                            props.state.user.session_secret_key
                        )
                        .then((response) => {
                            const oidcGroups = response.data.oidc_groups;

                            oidcGroups.forEach((oidc_group) => {
                                if (
                                    mappedOidcGroupIndex.hasOwnProperty(
                                        oidc_group.id
                                    )
                                ) {
                                    return;
                                }
                                mappedOidcGroupIndex[oidc_group.id] = {
                                    oidc_group_id: oidc_group.id,
                                    oidc_group_map_id: '',
                                    share_admin: false,
                                    group_admin: false,
                                };
                            });

                            setGroup(group);
                            setMappedOidcGroupIndex(mappedOidcGroupIndex);
                            setOidcGroups(oidcGroups);
                        });
                } else {
                    setGroup(group);
                    setMappedOidcGroupIndex(mappedOidcGroupIndex);
                }
            });
    }

    const handleToggle = (membershipId, groupAdmin, shareAdmin) => {
        psono_server
            .admin_update_membership(
                props.state.user.token,
                props.state.user.session_secret_key,
                membershipId,
                groupAdmin,
                shareAdmin
            )
            .then((values) => {
                loadGroup();
            });
    };
    const handleToggleGroupAdmin = (membership) => {
        return handleToggle(
            membership.id,
            !membership.admin_raw,
            membership.share_admin_raw
        );
    };
    const handleToggleShareAdmin = (membership) => {
        return handleToggle(
            membership.id,
            membership.admin_raw,
            !membership.share_admin_raw
        );
    };

    const onDeleteMemberships = (selected_memberships) => {
        selected_memberships.forEach((membership) => {
            psono_server.admin_delete_membership(
                props.state.user.token,
                props.state.user.session_secret_key,
                membership.id
            );
        });

        let { memberships } = group;
        selected_memberships.forEach((membership) => {
            helper.remove_from_array(memberships, membership, function (a, b) {
                return a.id === b.id;
            });
        });
        setGroup(group);
    };

    const handleToggleLDAP = (ldapGroup) => {
        const isMapped =
            mappedLdapGroupIndex.hasOwnProperty(ldapGroup.id) &&
            mappedLdapGroupIndex[ldapGroup.id]['ldap_group_map_id'];

        if (isMapped) {
            removeMappingLDAP(ldapGroup);
        } else {
            addMappingLDAP(ldapGroup);
        }
    };

    const handleToggleSAML = (samlGroup) => {
        const isMapped =
            mappedSamlGroupIndex.hasOwnProperty(samlGroup.id) &&
            mappedSamlGroupIndex[samlGroup.id]['saml_group_map_id'];

        if (isMapped) {
            removeMappingSAML(samlGroup);
        } else {
            addMappingSAML(samlGroup);
        }
    };

    const handleToggleOIDC = (oidcGroup) => {
        const isMapped =
            mappedOidcGroupIndex.hasOwnProperty(oidcGroup.id) &&
            mappedOidcGroupIndex[oidcGroup.id]['oidc_group_map_id'];

        if (isMapped) {
            removeMappingOIDC(oidcGroup);
        } else {
            addMappingOIDC(oidcGroup);
        }
    };

    const addMappingLDAP = (ldapGroup) => {
        psono_server
            .admin_ldap_create_group_map(
                props.state.user.token,
                props.state.user.session_secret_key,
                group.id,
                ldapGroup.id
            )
            .then((response) => {
                mappedLdapGroupIndex[ldapGroup.id]['ldap_group_map_id'] =
                    response.data.id;
                setMappedLdapGroupIndex(mappedLdapGroupIndex);
            });
    };

    const addMappingSAML = (samlGroup) => {
        psono_server
            .admin_saml_create_group_map(
                props.state.user.token,
                props.state.user.session_secret_key,
                group.id,
                samlGroup.id
            )
            .then((response) => {
                mappedSamlGroupIndex[samlGroup.id]['saml_group_map_id'] =
                    response.data.id;
                setMappedSamlGroupIndex(mappedSamlGroupIndex);
            });
    };

    const addMappingOIDC = (oidcGroup) => {
        psono_server
            .admin_oidc_create_group_map(
                props.state.user.token,
                props.state.user.session_secret_key,
                group.id,
                oidcGroup.id
            )
            .then((response) => {
                mappedOidcGroupIndex[oidcGroup.id]['oidc_group_map_id'] =
                    response.data.id;
                setMappedOidcGroupIndex(mappedOidcGroupIndex);
            });
    };

    const removeMappingLDAP = (ldapGroup) => {
        mappedLdapGroupIndex[ldapGroup.id]['ldap_group_map_id'] = '';
        setMappedLdapGroupIndex(mappedLdapGroupIndex);
        psono_server.admin_ldap_delete_group_map(
            props.state.user.token,
            props.state.user.session_secret_key,
            group.id,
            ldapGroup.id
        );
    };

    const removeMappingSAML = (samlGroup) => {
        mappedSamlGroupIndex[samlGroup.id]['saml_group_map_id'] = '';
        setMappedSamlGroupIndex(mappedSamlGroupIndex);
        psono_server.admin_saml_delete_group_map(
            props.state.user.token,
            props.state.user.session_secret_key,
            group.id,
            samlGroup.id
        );
    };

    const removeMappingOIDC = (oidcGroup) => {
        mappedOidcGroupIndex[oidcGroup.id]['oidc_group_map_id'] = '';
        setMappedOidcGroupIndex(mappedOidcGroupIndex);
        psono_server.admin_oidc_delete_group_map(
            props.state.user.token,
            props.state.user.session_secret_key,
            group.id,
            oidcGroup.id
        );
    };

    const handleToggleAdminLDAP = (group, type) => {
        const isMapped =
            mappedLdapGroupIndex.hasOwnProperty(group.id) &&
            mappedLdapGroupIndex[group.id]['ldap_group_map_id'];
        if (!isMapped) {
            return;
        }

        let group_admin = mappedLdapGroupIndex[group.id]['group_admin'];
        let share_admin = mappedLdapGroupIndex[group.id]['share_admin'];

        if (type === 'group') {
            psono_server
                .admin_ldap_update_group_map(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    mappedLdapGroupIndex[group.id]['ldap_group_map_id'],
                    !group_admin,
                    share_admin
                )
                .then((response) => {
                    mappedLdapGroupIndex[group.id]['group_admin'] =
                        !group_admin;
                    setMappedLdapGroupIndex(mappedLdapGroupIndex);
                });
        } else {
            psono_server
                .admin_ldap_update_group_map(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    mappedLdapGroupIndex[group.id]['ldap_group_map_id'],
                    group_admin,
                    !share_admin
                )
                .then((response) => {
                    mappedLdapGroupIndex[group.id]['share_admin'] =
                        !share_admin;
                    setMappedLdapGroupIndex(mappedLdapGroupIndex);
                });
        }
    };

    const handleToggleAdminSAML = (group, type) => {
        const isMapped =
            mappedSamlGroupIndex.hasOwnProperty(group.id) &&
            mappedSamlGroupIndex[group.id]['saml_group_map_id'];
        if (!isMapped) {
            return;
        }

        let group_admin = mappedSamlGroupIndex[group.id]['group_admin'];
        let share_admin = mappedSamlGroupIndex[group.id]['share_admin'];

        if (type === 'group') {
            psono_server
                .admin_saml_update_group_map(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    mappedSamlGroupIndex[group.id]['saml_group_map_id'],
                    !group_admin,
                    share_admin
                )
                .then((response) => {
                    mappedSamlGroupIndex[group.id]['group_admin'] =
                        !group_admin;
                    setMappedSamlGroupIndex(mappedSamlGroupIndex);
                });
        } else {
            psono_server
                .admin_saml_update_group_map(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    mappedSamlGroupIndex[group.id]['saml_group_map_id'],
                    group_admin,
                    !share_admin
                )
                .then((response) => {
                    mappedSamlGroupIndex[group.id]['share_admin'] =
                        !share_admin;
                    setMappedSamlGroupIndex(mappedSamlGroupIndex);
                });
        }
    };

    const handleToggleAdminOIDC = (group, type) => {
        const isMapped =
            mappedOidcGroupIndex.hasOwnProperty(group.id) &&
            mappedOidcGroupIndex[group.id]['oidc_group_map_id'];
        if (!isMapped) {
            return;
        }

        let group_admin = mappedOidcGroupIndex[group.id]['group_admin'];
        let share_admin = mappedOidcGroupIndex[group.id]['share_admin'];

        if (type === 'group') {
            psono_server
                .admin_oidc_update_group_map(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    mappedOidcGroupIndex[group.id]['oidc_group_map_id'],
                    !group_admin,
                    share_admin
                )
                .then((response) => {
                    mappedOidcGroupIndex[group.id]['group_admin'] =
                        !group_admin;
                    setMappedOidcGroupIndex(mappedOidcGroupIndex);
                });
        } else {
            psono_server
                .admin_oidc_update_group_map(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    mappedOidcGroupIndex[group.id]['oidc_group_map_id'],
                    group_admin,
                    !share_admin
                )
                .then((response) => {
                    mappedOidcGroupIndex[group.id]['share_admin'] =
                        !share_admin;
                    setMappedOidcGroupIndex(mappedOidcGroupIndex);
                });
        }
    };

    if (ldapGroups) {
        ldapGroups.forEach((ldap_group) => {
            ldap_group.mapped_raw =
                mappedLdapGroupIndex.hasOwnProperty(ldap_group.id) &&
                mappedLdapGroupIndex[ldap_group.id]['ldap_group_map_id'] !== '';
            ldap_group.mapped = (
                <Checkbox
                    checked={ldap_group.mapped_raw}
                    tabIndex={-1}
                    onClick={() => {
                        handleToggleLDAP(ldap_group);
                    }}
                    checkedIcon={<CheckBox className={classes.checkedIcon} />}
                    icon={
                        <CheckBoxOutlineBlank
                            className={classes.uncheckedIcon}
                        />
                    }
                    classes={{
                        checked: classes.checked,
                    }}
                />
            );
            ldap_group.has_group_admin_raw =
                mappedLdapGroupIndex.hasOwnProperty(ldap_group.id) &&
                mappedLdapGroupIndex[ldap_group.id]['group_admin'];
            ldap_group.has_group_admin = (
                <Checkbox
                    checked={ldap_group.has_group_admin_raw}
                    tabIndex={-1}
                    onClick={() => {
                        handleToggleAdminLDAP(ldap_group, 'group', 'LDAP');
                    }}
                    checkedIcon={<CheckBox className={classes.checkedIcon} />}
                    icon={
                        <CheckBoxOutlineBlank
                            className={classes.uncheckedIcon}
                        />
                    }
                    classes={{
                        checked: classes.checked,
                    }}
                />
            );
            ldap_group.has_share_admin_raw =
                mappedLdapGroupIndex.hasOwnProperty(ldap_group.id) &&
                mappedLdapGroupIndex[ldap_group.id]['share_admin'];
            ldap_group.has_share_admin = (
                <Checkbox
                    checked={ldap_group.has_share_admin_raw}
                    tabIndex={-1}
                    onClick={() => {
                        handleToggleAdminLDAP(ldap_group, 'share', 'LDAP');
                    }}
                    checkedIcon={<CheckBox className={classes.checkedIcon} />}
                    icon={
                        <CheckBoxOutlineBlank
                            className={classes.uncheckedIcon}
                        />
                    }
                    classes={{
                        checked: classes.checked,
                    }}
                />
            );
        });
    }
    if (samlGroups) {
        samlGroups.forEach((saml_group) => {
            saml_group.mapped_raw =
                mappedSamlGroupIndex.hasOwnProperty(saml_group.id) &&
                mappedSamlGroupIndex[saml_group.id]['saml_group_map_id'] !== '';
            saml_group.name = saml_group.display_name || saml_group.saml_name;
            saml_group.mapped = (
                <Checkbox
                    checked={saml_group.mapped_raw}
                    tabIndex={-1}
                    onClick={() => {
                        handleToggleSAML(saml_group);
                    }}
                    checkedIcon={<CheckBox className={classes.checkedIcon} />}
                    icon={
                        <CheckBoxOutlineBlank
                            className={classes.uncheckedIcon}
                        />
                    }
                    classes={{
                        checked: classes.checked,
                    }}
                />
            );
            saml_group.has_group_admin_raw =
                mappedSamlGroupIndex.hasOwnProperty(saml_group.id) &&
                mappedSamlGroupIndex[saml_group.id]['group_admin'];
            saml_group.has_group_admin = (
                <Checkbox
                    checked={saml_group.has_group_admin_raw}
                    tabIndex={-1}
                    onClick={() => {
                        handleToggleAdminSAML(saml_group, 'group', 'SAML');
                    }}
                    checkedIcon={<CheckBox className={classes.checkedIcon} />}
                    icon={
                        <CheckBoxOutlineBlank
                            className={classes.uncheckedIcon}
                        />
                    }
                    classes={{
                        checked: classes.checked,
                    }}
                />
            );
            saml_group.has_share_admin_raw =
                mappedSamlGroupIndex.hasOwnProperty(saml_group.id) &&
                mappedSamlGroupIndex[saml_group.id]['share_admin'];
            saml_group.has_share_admin = (
                <Checkbox
                    checked={saml_group.has_share_admin_raw}
                    tabIndex={-1}
                    onClick={() => {
                        handleToggleAdminSAML(saml_group, 'share', 'SAML');
                    }}
                    checkedIcon={<CheckBox className={classes.checkedIcon} />}
                    icon={
                        <CheckBoxOutlineBlank
                            className={classes.uncheckedIcon}
                        />
                    }
                    classes={{
                        checked: classes.checked,
                    }}
                />
            );
        });
    }
    if (oidcGroups) {
        oidcGroups.forEach((oidc_group) => {
            oidc_group.mapped_raw =
                mappedOidcGroupIndex.hasOwnProperty(oidc_group.id) &&
                mappedOidcGroupIndex[oidc_group.id]['oidc_group_map_id'] !== '';
            oidc_group.name = oidc_group.display_name || oidc_group.oidc_name;
            oidc_group.mapped = (
                <Checkbox
                    checked={oidc_group.mapped_raw}
                    tabIndex={-1}
                    onClick={() => {
                        handleToggleOIDC(oidc_group);
                    }}
                    checkedIcon={<CheckBox className={classes.checkedIcon} />}
                    icon={
                        <CheckBoxOutlineBlank
                            className={classes.uncheckedIcon}
                        />
                    }
                    classes={{
                        checked: classes.checked,
                    }}
                />
            );
            oidc_group.has_group_admin_raw =
                mappedOidcGroupIndex.hasOwnProperty(oidc_group.id) &&
                mappedOidcGroupIndex[oidc_group.id]['group_admin'];
            oidc_group.has_group_admin = (
                <Checkbox
                    checked={oidc_group.has_group_admin_raw}
                    tabIndex={-1}
                    onClick={() => {
                        handleToggleAdminOIDC(oidc_group, 'group', 'OIDC');
                    }}
                    checkedIcon={<CheckBox className={classes.checkedIcon} />}
                    icon={
                        <CheckBoxOutlineBlank
                            className={classes.uncheckedIcon}
                        />
                    }
                    classes={{
                        checked: classes.checked,
                    }}
                />
            );
            oidc_group.has_share_admin_raw =
                mappedOidcGroupIndex.hasOwnProperty(oidc_group.id) &&
                mappedOidcGroupIndex[oidc_group.id]['share_admin'];
            oidc_group.has_share_admin = (
                <Checkbox
                    checked={oidc_group.has_share_admin_raw}
                    tabIndex={-1}
                    onClick={() => {
                        handleToggleAdminOIDC(oidc_group, 'share', 'OIDC');
                    }}
                    checkedIcon={<CheckBox className={classes.checkedIcon} />}
                    icon={
                        <CheckBoxOutlineBlank
                            className={classes.uncheckedIcon}
                        />
                    }
                    classes={{
                        checked: classes.checked,
                    }}
                />
            );
        });
    }

    if (group) {
        return (
            <div>
                <Grid container>
                    <GridItem xs={12} sm={12} md={12}>
                        <RegularCard
                            cardTitle={t('EDIT_GROUP')}
                            cardSubtitle={t('UPDATE_GROUP_DETAILS')}
                            content={
                                <div>
                                    <Grid container>
                                        <GridItem xs={12} sm={12} md={12}>
                                            <CustomInput
                                                labelText={t('NAME')}
                                                id="name"
                                                formControlProps={{
                                                    fullWidth: true,
                                                }}
                                                inputProps={{
                                                    value: group.name,
                                                    disabled: true,
                                                    readOnly: true,
                                                }}
                                            />
                                        </GridItem>
                                    </Grid>
                                    <Grid container>
                                        <GridItem xs={12} sm={12} md={12}>
                                            <CustomInput
                                                labelText={t('PUBLIC_KEY')}
                                                id="public_key"
                                                formControlProps={{
                                                    fullWidth: true,
                                                }}
                                                inputProps={{
                                                    value: group.public_key,
                                                    disabled: true,
                                                    readOnly: true,
                                                }}
                                            />
                                        </GridItem>
                                    </Grid>
                                    <Grid container>
                                        <GridItem xs={12} sm={12} md={4}>
                                            <CustomInput
                                                labelText={t('CREATION_DATE')}
                                                id="create_date"
                                                formControlProps={{
                                                    fullWidth: true,
                                                }}
                                                inputProps={{
                                                    value: moment(
                                                        group.create_date
                                                    ).format(
                                                        'YYYY-MM-DD HH:mm:ss'
                                                    ),
                                                    disabled: true,
                                                    readOnly: true,
                                                }}
                                            />
                                        </GridItem>
                                    </Grid>
                                </div>
                            }
                            // footer={
                            //     <Button color="primary">Update User</Button>
                            // }
                        />
                    </GridItem>
                </Grid>
                <Grid container>
                    <GridItem xs={12} sm={12} md={12}>
                        <GroupCard
                            memberships={group.memberships}
                            onDeleteMemberships={onDeleteMemberships}
                            shareRights={group.share_rights}
                            ldapGroups={ldapGroups}
                            samlGroups={samlGroups}
                            oidcGroups={oidcGroups}
                        />
                    </GridItem>
                </Grid>
            </div>
        );
    } else {
        return null;
    }
};

export default GroupEdit;
