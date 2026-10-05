import type { ApiRecord } from '../../types/api';
import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';

import { SCIMCard, GridItem } from '../../components';
import psono_server from '../../services/api-server';
import store from '../../services/store';
import { hasGlobalCapability } from '../../services/authorization';

const Users = () => {
    const [scimGroups, setScimGroups] = useState<ApiRecord[]>([]);
    const canManageIdentityProviders = hasGlobalCapability(
        store.getState().user.authorization,
        'identity_providers.manage'
    );

    const createGroupsNode = (scim_group: any) => {
        scim_group.tenant_names = (scim_group.tenants || [])
            .map((tenant: any) => tenant.name)
            .join(', ');
        scim_group.groups = (
            <div>
                {scim_group.groups.map((group: any, key: any) => (
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

    const loadScimGroups = () => {
        return psono_server
            .admin_scim_group(
                store.getState().user.token,
                store.getState().user.session_secret_key
            )
            .then((response) => {
                const { scim_groups } = response.data;
                scim_groups.forEach(createGroupsNode);
                setScimGroups(
                    scim_groups.map((scim_group: any) => ({
                        ...scim_group,
                        name: scim_group.display_name || scim_group.scim_name,
                    }))
                );
            });
    };

    const onUpdateScimGroupTenants = (group: any, tenantIds: any) =>
        psono_server
            .admin_update_scim_group_tenants(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                group.id,
                tenantIds
            )
            .then(loadScimGroups);

    const onDeleteScimGroups = (selectedGroups: any) => {
        selectedGroups.forEach((group: any) => {
            psono_server
                .admin_delete_scim_group(
                    store.getState().user.token,
                    store.getState().user.session_secret_key,
                    group.id
                )
                .then(() => {
                    loadScimGroups();
                });
        });
    };

    useEffect(() => {
        loadScimGroups();
    }, []);

    return (
        <div>
            <Grid container>
                <GridItem xs={12} sm={12} md={12}>
                    <SCIMCard
                        scim_groups={scimGroups}
                        onDeleteScimGroups={onDeleteScimGroups}
                        onUpdateScimGroupTenants={onUpdateScimGroupTenants}
                        canManageIdentityProviders={canManageIdentityProviders}
                    />
                </GridItem>
            </Grid>
        </div>
    );
};

export default Users;
