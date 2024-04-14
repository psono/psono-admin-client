import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useHistory, useParams } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import { Grid, Checkbox } from '@material-ui/core';
import { CheckBox, CheckBoxOutlineBlank } from '@material-ui/icons';

import {
    RegularCard,
    CustomInput,
    GridItem,
    GroupCard,
    Button,
    SnackbarContent,
} from '../../components/index';
import psono_server from '../../services/api-server';
import customInputStyle from '../../assets/jss/material-dashboard-react/customInputStyle';
import helper from '../../services/helper';

const useStyles = makeStyles(customInputStyle);

const GroupEdit = (props) => {
    const classes = useStyles();
    const history = useHistory();
    const { t } = useTranslation();

    const params = useParams();
    const [errors, setErrors] = useState([]);
    const [msgs, setMsgs] = useState([]);
    const [mappedLdapGroupIndex, setMappedLdapGroupIndex] = useState({});
    const [mappedSamlGroupIndex, setMappedSamlGroupIndex] = useState({});
    const [mappedOidcGroupIndex, setMappedOidcGroupIndex] = useState({});
    const [mappedScimGroupIndex, setMappedScimGroupIndex] = useState({});
    const [group, setGroup] = useState(null);
    const [ldapGroups, setLdapGroups] = useState([]);
    const [samlGroups, setSamlGroups] = useState([]);
    const [oidcGroups, setOidcGroups] = useState([]);
    const [scimGroups, setScimGroups] = useState([]);

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
                    u.read_raw = u.read;
                    u.read = (
                        <Checkbox
                            checked={u.read_raw}
                            tabIndex={-1}
                            onClick={() => {
                                handleToggleShareRightRead(u);
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

                    u.write_raw = u.write;
                    u.write = (
                        <Checkbox
                            checked={u.write_raw}
                            tabIndex={-1}
                            onClick={() => {
                                handleToggleShareRightWrite(u);
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

                    u.grant_raw = u.grant;
                    u.grant = (
                        <Checkbox
                            checked={u.grant_raw}
                            tabIndex={-1}
                            onClick={() => {
                                handleToggleShareRightGrant(u);
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
                const mappedScimGroupIndex = {};
                if (group.hasOwnProperty('scim_groups')) {
                    group.scim_groups.forEach((scim_group) => {
                        mappedScimGroupIndex[scim_group.scim_group_id] = {
                            scim_group_id: scim_group.scim_group_id,
                            scim_group_map_id: scim_group.scim_group_map_id,
                            share_admin: scim_group.share_admin,
                            group_admin: scim_group.group_admin,
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
                    psono_server
                        .admin_scim_group(
                            props.state.user.token,
                            props.state.user.session_secret_key
                        )
                        .then((response) => {
                            const scimGroups = response.data.scim_groups;

                            scimGroups.forEach((scim_group) => {
                                if (
                                    mappedScimGroupIndex.hasOwnProperty(
                                        scim_group.id
                                    )
                                ) {
                                    return;
                                }
                                mappedScimGroupIndex[scim_group.id] = {
                                    scim_group_id: scim_group.id,
                                    scim_group_map_id: '',
                                    share_admin: false,
                                    group_admin: false,
                                };
                            });
                            setGroup(group);
                            setMappedScimGroupIndex(mappedScimGroupIndex);
                            setScimGroups(scimGroups);
                        });
                } else {
                    setGroup(group);
                    setMappedSamlGroupIndex(mappedSamlGroupIndex);
                    setMappedScimGroupIndex(mappedScimGroupIndex);
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

    const save = () => {
        setErrors([]);
        setMsgs([]);
        psono_server
            .admin_update_group(
                props.state.user.token,
                props.state.user.session_secret_key,
                group.id,
                group.name,
                group.forced_membership
            )
            .then(
                (result) => {
                    setMsgs(['SAVE_SUCCESS']);
                },
                (result) => {
                    if (result.data.hasOwnProperty('name')) {
                        setErrors(result.data.name);
                    } else if (result.data.hasOwnProperty('errors')) {
                        setErrors(result.data.errors);
                    } else {
                        setErrors([result.data]);
                    }
                }
            );
    };

    const handleToggleShareRight = (groupShareRightId, read, write, grant) => {
        psono_server
            .admin_update_group_share_right(
                props.state.user.token,
                props.state.user.session_secret_key,
                groupShareRightId,
                read,
                write,
                grant
            )
            .then((values) => {
                loadGroup();
            });
    };
    const handleToggleShareRightRead = (groupShareRight) => {
        return handleToggleShareRight(
            groupShareRight.id,
            !groupShareRight.read_raw,
            groupShareRight.write_raw,
            groupShareRight.grant_raw
        );
    };
    const handleToggleShareRightWrite = (groupShareRight) => {
        return handleToggleShareRight(
            groupShareRight.id,
            groupShareRight.read_raw,
            !groupShareRight.write_raw,
            groupShareRight.grant_raw
        );
    };
    const handleToggleShareRightGrant = (groupShareRight) => {
        return handleToggleShareRight(
            groupShareRight.id,
            groupShareRight.read_raw,
            groupShareRight.write_raw,
            !groupShareRight.grant_raw
        );
    };

    const handleToggleGroup = (membershipId, groupAdmin, shareAdmin) => {
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
        return handleToggleGroup(
            membership.id,
            !membership.admin_raw,
            membership.share_admin_raw
        );
    };
    const handleToggleShareAdmin = (membership) => {
        return handleToggleGroup(
            membership.id,
            membership.admin_raw,
            !membership.share_admin_raw
        );
    };

    const onDeleteMemberships = async (selected_memberships) => {
        const promiseResults = [];
        selected_memberships.forEach((membership) => {
            promiseResults.push(
                psono_server.admin_delete_membership(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    membership.id
                )
            );
        });
        await Promise.all(promiseResults);
        loadGroup();
    };

    const onDeleteGroupShareRights = async (selectedShareRights) => {
        const promiseResults = [];
        selectedShareRights.forEach((groupShareRight) => {
            promiseResults.push(
                psono_server.admin_delete_group_share_right(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    groupShareRight.id
                )
            );
        });
        await Promise.all(promiseResults);
        loadGroup();
    };

    const onCreateGroupShareRight = (selectedShareRights) => {
        history.push('/group/' + params.group_id + '/create-share-right');
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

    const handleToggleSCIM = (scimGroup) => {
        const isMapped =
            mappedScimGroupIndex.hasOwnProperty(scimGroup.id) &&
            mappedScimGroupIndex[scimGroup.id]['scim_group_map_id'];

        if (isMapped) {
            removeMappingSCIM(scimGroup);
        } else {
            addMappingSCIM(scimGroup);
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
                setMappedLdapGroupIndex({ ...mappedLdapGroupIndex });
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
                setMappedSamlGroupIndex({ ...mappedSamlGroupIndex });
            });
    };

    const addMappingSCIM = (scimGroup) => {
        psono_server
            .admin_scim_create_group_map(
                props.state.user.token,
                props.state.user.session_secret_key,
                group.id,
                scimGroup.id
            )
            .then((response) => {
                mappedScimGroupIndex[scimGroup.id]['scim_group_map_id'] =
                    response.data.id;
                setMappedScimGroupIndex({ ...mappedScimGroupIndex });
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
                setMappedOidcGroupIndex({ ...mappedOidcGroupIndex });
            });
    };

    const removeMappingLDAP = (ldapGroup) => {
        mappedLdapGroupIndex[ldapGroup.id]['ldap_group_map_id'] = '';
        setMappedLdapGroupIndex({ ...mappedLdapGroupIndex });
        psono_server.admin_ldap_delete_group_map(
            props.state.user.token,
            props.state.user.session_secret_key,
            group.id,
            ldapGroup.id
        );
    };

    const removeMappingSAML = (samlGroup) => {
        mappedSamlGroupIndex[samlGroup.id]['saml_group_map_id'] = '';
        setMappedSamlGroupIndex({ ...mappedSamlGroupIndex });
        psono_server.admin_saml_delete_group_map(
            props.state.user.token,
            props.state.user.session_secret_key,
            group.id,
            samlGroup.id
        );
    };

    const removeMappingSCIM = (scimGroup) => {
        mappedScimGroupIndex[scimGroup.id]['scim_group_map_id'] = '';
        setMappedScimGroupIndex({ ...mappedScimGroupIndex });
        psono_server.admin_scim_delete_group_map(
            props.state.user.token,
            props.state.user.session_secret_key,
            group.id,
            scimGroup.id
        );
    };

    const removeMappingOIDC = (oidcGroup) => {
        mappedOidcGroupIndex[oidcGroup.id]['oidc_group_map_id'] = '';
        setMappedOidcGroupIndex({ ...mappedOidcGroupIndex });
        psono_server.admin_oidc_delete_group_map(
            props.state.user.token,
            props.state.user.session_secret_key,
            group.id,
            oidcGroup.id
        );
    };

    const onForcedMembershipToggle = (event) => {
        setGroup({
            ...group,
            forced_membership: !group.forced_membership,
        });
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
                    setMappedLdapGroupIndex({ ...mappedLdapGroupIndex });
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
                    setMappedLdapGroupIndex({ ...mappedLdapGroupIndex });
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
                    setMappedSamlGroupIndex({ ...mappedSamlGroupIndex });
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
                    setMappedSamlGroupIndex({ ...mappedSamlGroupIndex });
                });
        }
    };

    const handleToggleAdminSCIM = (group, type) => {
        const isMapped =
            mappedScimGroupIndex.hasOwnProperty(group.id) &&
            mappedScimGroupIndex[group.id]['scim_group_map_id'];
        if (!isMapped) {
            return;
        }

        let group_admin = mappedScimGroupIndex[group.id]['group_admin'];
        let share_admin = mappedScimGroupIndex[group.id]['share_admin'];

        if (type === 'group') {
            psono_server
                .admin_scim_update_group_map(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    mappedScimGroupIndex[group.id]['scim_group_map_id'],
                    !group_admin,
                    share_admin
                )
                .then((response) => {
                    mappedScimGroupIndex[group.id]['group_admin'] =
                        !group_admin;
                    setMappedScimGroupIndex({ ...mappedScimGroupIndex });
                });
        } else {
            psono_server
                .admin_scim_update_group_map(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    mappedScimGroupIndex[group.id]['scim_group_map_id'],
                    group_admin,
                    !share_admin
                )
                .then((response) => {
                    mappedScimGroupIndex[group.id]['share_admin'] =
                        !share_admin;
                    setMappedScimGroupIndex({ ...mappedScimGroupIndex });
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
                    setMappedOidcGroupIndex({ ...mappedOidcGroupIndex });
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
                    setMappedOidcGroupIndex({ ...mappedOidcGroupIndex });
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
                        handleToggleAdminLDAP(ldap_group, 'group');
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
                        handleToggleAdminLDAP(ldap_group, 'share');
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
                        handleToggleAdminSAML(saml_group, 'group');
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
                        handleToggleAdminSAML(saml_group, 'share');
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
    if (scimGroups) {
        scimGroups.forEach((scim_group) => {
            scim_group.mapped_raw =
                mappedScimGroupIndex.hasOwnProperty(scim_group.id) &&
                mappedScimGroupIndex[scim_group.id]['scim_group_map_id'] !== '';
            scim_group.name = scim_group.display_name || scim_group.scim_name;
            scim_group.mapped = (
                <Checkbox
                    checked={scim_group.mapped_raw}
                    tabIndex={-1}
                    onClick={() => {
                        handleToggleSCIM(scim_group);
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
            scim_group.has_group_admin_raw =
                mappedScimGroupIndex.hasOwnProperty(scim_group.id) &&
                mappedScimGroupIndex[scim_group.id]['group_admin'];
            scim_group.has_group_admin = (
                <Checkbox
                    checked={scim_group.has_group_admin_raw}
                    tabIndex={-1}
                    onClick={() => {
                        handleToggleAdminSCIM(scim_group, 'group');
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
            scim_group.has_share_admin_raw =
                mappedScimGroupIndex.hasOwnProperty(scim_group.id) &&
                mappedScimGroupIndex[scim_group.id]['share_admin'];
            scim_group.has_share_admin = (
                <Checkbox
                    checked={scim_group.has_share_admin_raw}
                    tabIndex={-1}
                    onClick={() => {
                        handleToggleAdminSCIM(scim_group, 'share');
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
                        handleToggleAdminOIDC(oidc_group, 'group');
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
                        handleToggleAdminOIDC(oidc_group, 'share');
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
                                                    onChange: (event) => {
                                                        setGroup({
                                                            ...group,
                                                            name: event.target
                                                                .value,
                                                        });
                                                    },
                                                }}
                                            />
                                        </GridItem>
                                    </Grid>
                                    <Grid container>
                                        <GridItem xs={12} sm={12} md={6}>
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
                                        <GridItem xs={12} sm={12} md={6}>
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
                                    <Grid container>
                                        {group.is_managed && (
                                            <GridItem xs={12} sm={6} md={4}>
                                                <div
                                                    className={classes.checkbox}
                                                >
                                                    <Checkbox
                                                        tabIndex={1}
                                                        checked={
                                                            group.forced_membership
                                                        }
                                                        onClick={
                                                            onForcedMembershipToggle
                                                        }
                                                    />{' '}
                                                    {t('FORCED_MEMBERSHIP')}
                                                </div>
                                            </GridItem>
                                        )}
                                        <GridItem
                                            xs={8}
                                            sm={8}
                                            md={8}
                                            style={{ marginTop: '20px' }}
                                        >
                                            {errors.map((prop, index) => {
                                                return (
                                                    <SnackbarContent
                                                        message={t(prop)}
                                                        color="danger"
                                                        key={index}
                                                    />
                                                );
                                            })}
                                        </GridItem>
                                        <GridItem
                                            xs={8}
                                            sm={8}
                                            md={8}
                                            style={{ marginTop: '20px' }}
                                        >
                                            {msgs.map((prop, index) => {
                                                return (
                                                    <SnackbarContent
                                                        message={t(prop)}
                                                        color="info"
                                                        key={index}
                                                    />
                                                );
                                            })}
                                        </GridItem>
                                    </Grid>
                                </div>
                            }
                            footer={
                                <Button color="primary" onClick={save}>
                                    {t('SAVE')}
                                </Button>
                            }
                        />
                    </GridItem>
                </Grid>
                <Grid container>
                    <GridItem xs={12} sm={12} md={12}>
                        <GroupCard
                            memberships={group.memberships}
                            onDeleteMemberships={onDeleteMemberships}
                            onDeleteGroupShareRights={onDeleteGroupShareRights}
                            onCreateGroupShareRight={onCreateGroupShareRight}
                            shareRights={group.share_rights}
                            ldapGroups={ldapGroups}
                            samlGroups={samlGroups}
                            scimGroups={scimGroups}
                            oidcGroups={oidcGroups}
                            isManaged={group.is_managed}
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
