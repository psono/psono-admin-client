import React, { useEffect, useState } from 'react';
import {
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
} from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';

import {
    Button,
    CustomInput,
    CustomMaterialTable,
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
        response.data.name ||
        response.data.errors ||
        response.data;
    return Array.isArray(value) ? value[0] : String(value);
};

const TenantEdit = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const { tenant_id: tenantId } = useParams();
    const [tenant, setTenant] = useState({
        name: '',
        description: '',
        is_active: true,
        users: [],
        groups: [],
    });
    const [memberOptions, setMemberOptions] = useState([]);
    const [memberSearch, setMemberSearch] = useState('');
    const [membersLoading, setMembersLoading] = useState(false);
    const [membershipType, setMembershipType] = useState(null);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const credentials = () => [
        store.getState().user.token,
        store.getState().user.session_secret_key,
    ];

    const loadTenant = () => {
        if (!tenantId) return Promise.resolve();
        return psonoServer
            .admin_tenant(...credentials(), tenantId)
            .then((response) => setTenant(response.data));
    };

    useEffect(() => {
        loadTenant();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantId]);

    useEffect(() => {
        if (!membershipType) return undefined;

        let active = true;
        setMembersLoading(true);
        const timer = setTimeout(() => {
            const params = { page_size: 5, page: 0, search: memberSearch };
            const request =
                membershipType === 'user'
                    ? psonoServer.admin_user(
                          ...credentials(),
                          undefined,
                          params
                      )
                    : psonoServer.admin_group(
                          ...credentials(),
                          undefined,
                          params
                      );

            request.then(
                (response) => {
                    if (!active) return;
                    setMemberOptions(
                        membershipType === 'user'
                            ? response.data.users
                            : response.data.groups
                    );
                    setMembersLoading(false);
                },
                (response) => {
                    if (!active) return;
                    setMemberOptions([]);
                    setMembersLoading(false);
                    setError(responseError(response));
                }
            );
        }, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [membershipType, memberSearch]);

    const save = () => {
        setError('');
        setSaved(false);
        const data = {
            name: tenant.name,
            description: tenant.description,
            is_active: tenant.is_active,
        };
        const request = tenantId
            ? psonoServer.admin_update_tenant(...credentials(), tenantId, data)
            : psonoServer.admin_create_tenant(...credentials(), data);
        request.then(
            (response) => {
                if (!tenantId) {
                    history.replace('/tenant/' + response.data.id);
                    return;
                }
                setTenant({ ...tenant, ...response.data });
                setSaved(true);
            },
            (response) => setError(responseError(response))
        );
    };

    const changeMembership = (method, data, onSuccess) => {
        setError('');
        psonoServer
            .admin_tenant_membership(...credentials(), method, {
                tenant_id: tenantId,
                ...data,
            })
            .then(
                () => {
                    loadTenant();
                    if (onSuccess) onSuccess();
                },
                (response) => setError(responseError(response))
            );
    };

    const currentMembers =
        membershipType === 'user' ? tenant.users : tenant.groups;
    const availableMembers = memberOptions.filter(
        (option) => !currentMembers.some((member) => member.id === option.id)
    );

    const openMembershipDialog = (type) => {
        setError('');
        setMemberOptions([]);
        setMemberSearch('');
        setSelectedMemberId('');
        setMembershipType(type);
    };

    const addMembership = () => {
        const field = membershipType === 'user' ? 'user_id' : 'group_id';
        changeMembership('POST', { [field]: selectedMemberId }, () => {
            setMembershipType(null);
            setSelectedMemberId('');
        });
    };

    return (
        <Grid container>
            {membershipType && (
                <Dialog
                    open
                    fullWidth
                    maxWidth="sm"
                    onClose={() => setMembershipType(null)}
                >
                    <DialogTitle>
                        {t(
                            membershipType === 'user' ? 'ADD_USER' : 'ADD_GROUP'
                        )}
                    </DialogTitle>
                    <DialogContent>
                        <Autocomplete
                            autoHighlight
                            filterOptions={(options) => options}
                            inputValue={memberSearch}
                            loading={membersLoading}
                            options={availableMembers}
                            getOptionLabel={(member) =>
                                membershipType === 'user'
                                    ? member.username
                                    : member.name
                            }
                            getOptionSelected={(option, value) =>
                                option.id === value.id
                            }
                            value={
                                availableMembers.find(
                                    (member) => member.id === selectedMemberId
                                ) || null
                            }
                            onChange={(event, member) =>
                                setSelectedMemberId(member ? member.id : '')
                            }
                            onInputChange={(event, value, reason) => {
                                if (reason === 'input' || reason === 'clear') {
                                    setMemberSearch(value);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    margin="normal"
                                    label={t(
                                        membershipType === 'user'
                                            ? 'USER'
                                            : 'GROUP'
                                    )}
                                    inputProps={{
                                        ...params.inputProps,
                                        autoComplete: 'new-password',
                                    }}
                                />
                            )}
                        />
                        {error && (
                            <SnackbarContent
                                message={t(error)}
                                color="danger"
                            />
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setMembershipType(null)}>
                            {t('ABORT')}
                        </Button>
                        <Button
                            color="primary"
                            disabled={!selectedMemberId}
                            onClick={addMembership}
                        >
                            {t(
                                membershipType === 'user'
                                    ? 'ADD_USER'
                                    : 'ADD_GROUP'
                            )}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
            <GridItem xs={12} sm={12} md={12}>
                <RegularCard
                    cardTitle={t(tenantId ? 'EDIT_TENANT' : 'CREATE_TENANT')}
                    cardSubtitle={t('TENANT_DETAILS_INFO')}
                    content={
                        <Grid container>
                            <GridItem xs={12} sm={12} md={6}>
                                <CustomInput
                                    labelText={t('NAME')}
                                    id="tenant-name"
                                    formControlProps={{ fullWidth: true }}
                                    inputProps={{
                                        value: tenant.name,
                                        onChange: (event) =>
                                            setTenant({
                                                ...tenant,
                                                name: event.target.value,
                                            }),
                                    }}
                                />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={6}>
                                <CustomInput
                                    labelText={t('DESCRIPTION')}
                                    id="tenant-description"
                                    formControlProps={{ fullWidth: true }}
                                    inputProps={{
                                        value: tenant.description,
                                        onChange: (event) =>
                                            setTenant({
                                                ...tenant,
                                                description: event.target.value,
                                            }),
                                    }}
                                />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={12}>
                                <Checkbox
                                    checked={tenant.is_active}
                                    onChange={() =>
                                        setTenant({
                                            ...tenant,
                                            is_active: !tenant.is_active,
                                        })
                                    }
                                />
                                {t('ACTIVE')}
                            </GridItem>
                        </Grid>
                    }
                    footer={
                        <div>
                            <Button
                                color="primary"
                                disabled={!tenant.name}
                                onClick={save}
                            >
                                {t(tenantId ? 'SAVE' : 'CREATE')}
                            </Button>
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
            {tenantId && (
                <GridItem xs={12} sm={12} md={6}>
                    <RegularCard
                        cardTitle={t('TENANT_USERS')}
                        content={
                            <CustomMaterialTable
                                title=""
                                columns={[
                                    {
                                        field: 'username',
                                        title: t('USERNAME'),
                                    },
                                ]}
                                data={tenant.users}
                                actions={[
                                    {
                                        tooltip: t('REMOVE'),
                                        icon: Delete,
                                        onClick: (event, user) =>
                                            changeMembership('DELETE', {
                                                user_id: user.id,
                                            }),
                                    },
                                    {
                                        tooltip: t('ADD_USER'),
                                        icon: Add,
                                        isFreeAction: true,
                                        onClick: () =>
                                            openMembershipDialog('user'),
                                    },
                                ]}
                            />
                        }
                    />
                </GridItem>
            )}
            {tenantId && (
                <GridItem xs={12} sm={12} md={6}>
                    <RegularCard
                        cardTitle={t('TENANT_GROUPS')}
                        content={
                            <CustomMaterialTable
                                title=""
                                columns={[
                                    {
                                        field: 'name',
                                        title: t('NAME'),
                                    },
                                ]}
                                data={tenant.groups}
                                actions={[
                                    {
                                        tooltip: t('REMOVE'),
                                        icon: Delete,
                                        onClick: (event, group) =>
                                            changeMembership('DELETE', {
                                                group_id: group.id,
                                            }),
                                    },
                                    {
                                        tooltip: t('ADD_GROUP'),
                                        icon: Add,
                                        isFreeAction: true,
                                        onClick: () =>
                                            openMembershipDialog('group'),
                                    },
                                ]}
                            />
                        }
                    />
                </GridItem>
            )}
        </Grid>
    );
};

export default TenantEdit;
