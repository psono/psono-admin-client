import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { Redirect } from 'react-router-dom';

import { SAMLCard, GridItem } from '../../components';
import psono_server from '../../services/api-server';
import notification from '../../services/notification';
import store from '../../services/store';
import { hasGlobalCapability } from '../../services/authorization';

const SAML = (props) => {
    const [redirectTo, setRedirectTo] = useState('');
    const [samlGroups, setSamlGroups] = useState([]);
    const canManageIdentityProviders = hasGlobalCapability(
        store.getState().user.authorization,
        'identity_providers.manage'
    );

    const createGroupsNode = (saml_group) => {
        saml_group.tenant_names = (saml_group.tenants || [])
            .map((tenant) => tenant.name)
            .join(', ');
        saml_group.groups = (
            <div>
                {saml_group.groups.map((group, key) => (
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

    const loadSamlGroups = () => {
        return psono_server
            .admin_saml_group(
                store.getState().user.token,
                store.getState().user.session_secret_key
            )
            .then((response) => {
                const { saml_groups } = response.data;

                saml_groups.forEach((saml_group) => {
                    saml_group['name'] =
                        saml_group['display_name'] || saml_group['saml_name'];
                    createGroupsNode(saml_group);
                });

                setSamlGroups(saml_groups);
            });
    };

    const onUpdateSamlGroupTenants = (group, tenantIds) =>
        psono_server
            .admin_update_saml_group_tenants(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                group.id,
                tenantIds
            )
            .then(loadSamlGroups);

    const onSyncGroupsSaml = () =>
        psono_server
            .admin_saml_group_sync(
                store.getState().user.token,
                store.getState().user.session_secret_key
            )
            .then(loadSamlGroups)
            .catch((response) => {
                notification.errorSend(
                    response?.data?.non_field_errors?.[0] ||
                        response?.errors?.[0] ||
                        (typeof response === 'string' ? response : 'ERROR')
                );
            });

    const onDeleteSamlGroups = (selectedGroups) => {
        selectedGroups.forEach((group) => {
            psono_server
                .admin_delete_saml_group(
                    store.getState().user.token,
                    store.getState().user.session_secret_key,
                    group.id
                )
                .then(() => {
                    loadSamlGroups();
                });
        });
    };

    useEffect(() => {
        loadSamlGroups();
    }, []);

    if (redirectTo) {
        return <Redirect to={redirectTo} />;
    }

    return (
        <div>
            <Grid container>
                <GridItem xs={12} sm={12} md={12}>
                    <SAMLCard
                        saml_groups={samlGroups}
                        onSyncGroupsSaml={onSyncGroupsSaml}
                        onDeleteSamlGroups={onDeleteSamlGroups}
                        onUpdateSamlGroupTenants={onUpdateSamlGroupTenants}
                        canManageIdentityProviders={canManageIdentityProviders}
                    />
                </GridItem>
            </Grid>
        </div>
    );
};

export default SAML;
