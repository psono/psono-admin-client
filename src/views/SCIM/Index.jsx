import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';

import { SCIMCard, GridItem } from '../../components';
import psono_server from '../../services/api-server';
import store from '../../services/store';

const Users = () => {
    const [scimGroups, setScimGroups] = useState([]);

    const createGroupsNode = (scim_group) => {
        scim_group.groups = (
            <div>
                {scim_group.groups.map((group, key) => (
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
        psono_server
            .admin_scim_group(
                store.getState().user.token,
                store.getState().user.session_secret_key
            )
            .then((response) => {
                const { scim_groups } = response.data;
                scim_groups.forEach(createGroupsNode);
                setScimGroups(
                    scim_groups.map((scim_group) => ({
                        ...scim_group,
                        name: scim_group.display_name || scim_group.scim_name,
                    }))
                );
            });
    };

    const onDeleteScimGroups = (selectedGroups) => {
        selectedGroups.forEach((group) => {
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
                    />
                </GridItem>
            </Grid>
        </div>
    );
};

export default Users;
