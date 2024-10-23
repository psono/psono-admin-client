import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import moment from 'moment';
import PropTypes from 'prop-types';

import { LDAPCard, GridItem } from '../../components';
import psono_server from '../../services/api-server';
import i18n from '../../i18n';
import notification from '../../services/notification';
import store from '../../services/store';

const Users = () => {
    const [ldapUsers, setLdapUsers] = useState([]);
    const [ldapGroups, setLdapGroups] = useState([]);

    const createGroupsNode = (ldap_group) => {
        ldap_group.groups = (
            <div>
                {ldap_group.groups.map((group, key) => (
                    <>
                        {key !== 0 ? ', ' : ''}
                        <a href={'/portal/group/' + group.id} key={key}>
                            {group.name}
                        </a>
                    </>
                ))}
            </div>
        );
    };

    const onSyncGroupsLdap = () => {
        psono_server
            .admin_ldap_group_sync(
                store.getState().user.token,
                store.getState().user.session_secret_key
            )
            .then(
                (response) => {
                    const { ldap_groups } = response.data;
                    ldap_groups.forEach(createGroupsNode);
                    setLdapGroups(ldap_groups);
                },
                (response) => {
                    const { non_field_errors } = response.data;
                    notification.error_send(non_field_errors[0]);
                }
            );
    };

    const loadLdapGroups = () => {
        psono_server
            .admin_ldap_group(
                store.getState().user.token,
                store.getState().user.session_secret_key
            )
            .then((response) => {
                const { ldap_groups } = response.data;
                ldap_groups.forEach(createGroupsNode);
                setLdapGroups(ldap_groups);
            });
    };

    const onDeleteLdapGroups = (selectedGroups) => {
        selectedGroups.forEach((group) => {
            psono_server
                .admin_delete_ldap_group(
                    store.getState().user.token,
                    store.getState().user.session_secret_key,
                    group.id
                )
                .then(() => {
                    loadLdapGroups();
                });
        });
    };

    useEffect(() => {
        psono_server
            .admin_ldap_user(
                store.getState().user.token,
                store.getState().user.session_secret_key
            )
            .then((response) => {
                const { ldap_users } = response.data;

                ldap_users.forEach((u) => {
                    u.create_date = u.create_date
                        ? moment(u.create_date).format('YYYY-MM-DD HH:mm:ss')
                        : i18n.t('NEVER');
                });
                setLdapUsers(ldap_users);
            });
        loadLdapGroups();
    }, []);

    return (
        <div>
            <Grid container>
                <GridItem xs={12} sm={12} md={12}>
                    <LDAPCard
                        ldap_users={ldapUsers}
                        ldap_groups={ldapGroups}
                        onSyncGroupsLdap={onSyncGroupsLdap}
                        onDeleteLdapGroups={onDeleteLdapGroups}
                    />
                </GridItem>
            </Grid>
        </div>
    );
};

export default Users;
