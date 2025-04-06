import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { Redirect } from 'react-router-dom';

import { SAMLCard, GridItem } from '../../components';
import psono_server from '../../services/api-server';
import notification from '../../services/notification';
import store from '../../services/store';

const SAML = (props) => {
    const [redirectTo, setRedirectTo] = useState('');
    const [samlGroups, setSamlGroups] = useState([]);

    const createGroupsNode = (saml_group) => {
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
        psono_server
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

    const onSyncGroupsSaml = () => {
        psono_server
            .admin_saml_group_sync(
                store.getState().user.token,
                store.getState().user.session_secret_key
            )
            .then(
                () => {
                    loadSamlGroups();
                },
                (response) => {
                    const { non_field_errors } = response.data;
                    notification.errorSend(non_field_errors[0]);
                }
            );
    };

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
                    />
                </GridItem>
            </Grid>
        </div>
    );
};

export default SAML;
