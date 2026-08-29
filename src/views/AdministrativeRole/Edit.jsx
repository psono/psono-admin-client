import React, { useEffect, useState } from 'react';
import { Checkbox, Grid, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';

import {
    Button,
    CustomInput,
    GridItem,
    RegularCard,
    SnackbarContent,
} from '../../components';
import psonoServer from '../../services/api-server';
import store from '../../services/store';

const responseError = (response) => {
    if (!response || !response.data) return 'ERROR';
    const value =
        response.data.non_field_errors ||
        response.data.capabilities ||
        response.data.name ||
        response.data;
    return Array.isArray(value) ? value[0] : String(value);
};

const AdministrativeRoleEdit = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const { role_id: roleId } = useParams();
    const [role, setRole] = useState({
        name: '',
        description: '',
        is_active: true,
        capabilities: [],
    });
    const [capabilities, setCapabilities] = useState([]);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const credentials = () => [
        store.getState().user.token,
        store.getState().user.session_secret_key,
    ];

    useEffect(() => {
        const requests = [psonoServer.admin_capability(...credentials())];
        if (roleId) {
            requests.push(
                psonoServer.admin_administrative_role(...credentials(), roleId)
            );
        }
        Promise.all(requests).then((responses) => {
            setCapabilities(responses[0].data.capabilities);
            if (responses[1]) setRole(responses[1].data);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleId]);

    const toggleCapability = (code) => {
        const selected = role.capabilities.includes(code);
        setRole({
            ...role,
            capabilities: selected
                ? role.capabilities.filter((item) => item !== code)
                : role.capabilities.concat(code),
        });
    };

    const save = () => {
        setError('');
        setSaved(false);
        const data = {
            name: role.name,
            description: role.description,
            is_active: role.is_active,
            capabilities: role.capabilities,
        };
        const request = roleId
            ? psonoServer.admin_update_administrative_role(
                  ...credentials(),
                  roleId,
                  data
              )
            : psonoServer.admin_create_administrative_role(
                  ...credentials(),
                  data
              );
        request.then(
            (response) => {
                if (!roleId) {
                    history.replace('/administrative-role/' + response.data.id);
                    return;
                }
                setRole({ ...role, ...response.data });
                setSaved(true);
            },
            (response) => setError(responseError(response))
        );
    };

    const categories = capabilities.reduce((result, capability) => {
        if (!result[capability.category]) result[capability.category] = [];
        result[capability.category].push(capability);
        return result;
    }, {});
    const immutable = Boolean(role.is_system);
    const hasTenantAssignments = Boolean(
        role.assignments &&
            role.assignments.some((assignment) => !assignment.is_global)
    );

    return (
        <Grid container>
            <GridItem xs={12} sm={12} md={12}>
                <RegularCard
                    cardTitle={t(
                        roleId
                            ? 'EDIT_ADMINISTRATIVE_ROLE'
                            : 'CREATE_ADMINISTRATIVE_ROLE'
                    )}
                    cardSubtitle={t('ADMINISTRATIVE_ROLE_DETAILS_INFO')}
                    content={
                        <Grid container>
                            {immutable && (
                                <GridItem xs={12} sm={12} md={12}>
                                    <SnackbarContent
                                        color="info"
                                        message={t('SYSTEM_ROLE_IMMUTABLE')}
                                    />
                                </GridItem>
                            )}
                            <GridItem xs={12} sm={12} md={6}>
                                <CustomInput
                                    labelText={t('NAME')}
                                    id="role-name"
                                    formControlProps={{ fullWidth: true }}
                                    inputProps={{
                                        value: role.name,
                                        disabled: immutable,
                                        onChange: (event) =>
                                            setRole({
                                                ...role,
                                                name: event.target.value,
                                            }),
                                    }}
                                />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={6}>
                                <CustomInput
                                    labelText={t('DESCRIPTION')}
                                    id="role-description"
                                    formControlProps={{ fullWidth: true }}
                                    inputProps={{
                                        value: role.description,
                                        disabled: immutable,
                                        onChange: (event) =>
                                            setRole({
                                                ...role,
                                                description: event.target.value,
                                            }),
                                    }}
                                />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={12}>
                                <Checkbox
                                    checked={role.is_active}
                                    disabled={immutable}
                                    onChange={() =>
                                        setRole({
                                            ...role,
                                            is_active: !role.is_active,
                                        })
                                    }
                                />
                                {t('ACTIVE')}
                            </GridItem>
                            {role.is_full_access && (
                                <GridItem xs={12} sm={12} md={12}>
                                    <Typography color="textSecondary">
                                        {t('ROLE_HAS_FULL_ACCESS')}
                                    </Typography>
                                </GridItem>
                            )}
                            {Object.keys(categories).map((category) => (
                                <GridItem xs={12} sm={6} md={4} key={category}>
                                    <Typography variant="subtitle1">
                                        {category}
                                    </Typography>
                                    {categories[category].map((capability) => (
                                        <div key={capability.code}>
                                            <Checkbox
                                                checked={
                                                    role.is_full_access ||
                                                    role.capabilities.includes(
                                                        capability.code
                                                    )
                                                }
                                                disabled={
                                                    immutable ||
                                                    role.is_full_access ||
                                                    (hasTenantAssignments &&
                                                        !capability.tenant_scopeable &&
                                                        !role.capabilities.includes(
                                                            capability.code
                                                        ))
                                                }
                                                onChange={() =>
                                                    toggleCapability(
                                                        capability.code
                                                    )
                                                }
                                            />
                                            <span
                                                title={t(
                                                    capability.description
                                                )}
                                            >
                                                {capability.code}
                                            </span>
                                        </div>
                                    ))}
                                </GridItem>
                            ))}
                        </Grid>
                    }
                    footer={
                        <div>
                            {!immutable && (
                                <Button
                                    color="primary"
                                    disabled={!role.name}
                                    onClick={save}
                                >
                                    {t(roleId ? 'SAVE' : 'CREATE')}
                                </Button>
                            )}
                            {saved && (
                                <SnackbarContent
                                    message={t('SAVE_SUCCESS')}
                                    color="success"
                                />
                            )}
                            {error && (
                                <SnackbarContent
                                    message={t(error)}
                                    color="danger"
                                />
                            )}
                        </div>
                    }
                />
            </GridItem>
        </Grid>
    );
};

export default AdministrativeRoleEdit;
