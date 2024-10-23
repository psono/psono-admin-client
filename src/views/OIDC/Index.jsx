import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';

import { OIDCCard, GridItem } from '../../components';
import psono_server from '../../services/api-server';
import store from '../../services/store';

const Users = () => {
    const [oidcGroups, setOidcGroups] = useState([]);

    const createGroupsNode = (oidc_group) => {
        oidc_group.groups = (
            <div>
                {oidc_group.groups.map((group, key) => (
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

    const loadOidcGroups = () => {
        psono_server
            .admin_oidc_group(
                store.getState().user.token,
                store.getState().user.session_secret_key
            )
            .then((response) => {
                const { oidc_groups } = response.data;

                oidc_groups.forEach((oidc_group) => {
                    oidc_group['name'] =
                        oidc_group['display_name'] || oidc_group['oidc_name'];
                    createGroupsNode(oidc_group);
                });

                setOidcGroups(oidc_groups);
            });
    };

    const onDeleteOidcGroups = (selectedGroups) => {
        selectedGroups.forEach((group) => {
            psono_server
                .admin_delete_oidc_group(
                    store.getState().user.token,
                    store.getState().user.session_secret_key,
                    group.id
                )
                .then(() => {
                    loadOidcGroups();
                });
        });
    };

    useEffect(() => {
        loadOidcGroups();
    }, []);

    return (
        <div>
            <Grid container>
                <GridItem xs={12} sm={12} md={12}>
                    <OIDCCard
                        oidc_groups={oidcGroups}
                        onDeleteOidcGroups={onDeleteOidcGroups}
                    />
                </GridItem>
            </Grid>
        </div>
    );
};

export default Users;
