import React, { useEffect, useState } from 'react';
import {
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import Person from '@material-ui/icons/Person';
import Security from '@material-ui/icons/Security';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import {
    Button,
    CustomMaterialTable,
    GridItem,
    SnackbarContent,
} from '../../components';
import CustomTabs from '../../components/CustomTabs/CustomTabs';
import DeleteConfirmDialog from '../../components/Dialog/DeleteConfirmDialog';
import psonoServer from '../../services/api-server';
import store from '../../services/store';
import { roleAllowsTenantScope } from '../../services/authorization';

const emptyAssignment = {
    id: null,
    role_id: '',
    user_id: '',
    is_global: true,
    tenant_ids: [],
    tenants: [],
};

const responseError = (response) => {
    if (!response || !response.data) return 'ERROR';
    const value = response.data.non_field_errors || response.data;
    return Array.isArray(value) ? value[0] : String(value);
};

const AdministrativeRoles = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const [roles, setRoles] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [tenantOptions, setTenantOptions] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [tenantSearch, setTenantSearch] = useState('');
    const [usersLoading, setUsersLoading] = useState(false);
    const [tenantsLoading, setTenantsLoading] = useState(false);
    const [capabilities, setCapabilities] = useState([]);
    const [assignment, setAssignment] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [error, setError] = useState('');
    const credentials = () => [
        store.getState().user.token,
        store.getState().user.session_secret_key,
    ];

    const loadData = () =>
        Promise.all([
            psonoServer.admin_administrative_role(...credentials()),
            psonoServer.admin_administrative_role_assignment(...credentials()),
            psonoServer.admin_capability(...credentials()),
        ]).then(
            ([rolesResponse, assignmentsResponse, capabilitiesResponse]) => {
                setRoles(rolesResponse.data.roles);
                setAssignments(assignmentsResponse.data.assignments);
                setCapabilities(capabilitiesResponse.data.capabilities);
            }
        );

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const saveAssignment = () => {
        setError('');
        const data = {
            role_id: assignment.role_id,
            user_id: assignment.user_id,
            is_global: assignment.is_global,
            tenant_ids: assignment.is_global ? [] : assignment.tenant_ids,
        };
        const request = assignment.id
            ? psonoServer.admin_update_administrative_role_assignment(
                  ...credentials(),
                  assignment.id,
                  data
              )
            : psonoServer.admin_create_administrative_role_assignment(
                  ...credentials(),
                  data
              );
        request.then(
            () => {
                setAssignment(null);
                loadData();
            },
            (response) => setError(responseError(response))
        );
    };

    const deleteItem = () => {
        const request =
            pendingDelete.type === 'role'
                ? psonoServer.admin_delete_administrative_role(
                      ...credentials(),
                      pendingDelete.item.id
                  )
                : psonoServer.admin_delete_administrative_role_assignment(
                      ...credentials(),
                      pendingDelete.item.id
                  );
        request.then(loadData, (response) => setError(responseError(response)));
        setPendingDelete(null);
    };

    const openAssignmentDialog = (item) => {
        const nextAssignment = {
            ...(item || emptyAssignment),
            tenants: item && item.tenants ? item.tenants : [],
        };
        setError('');
        setUserOptions(
            nextAssignment.user_id
                ? [
                      {
                          id: nextAssignment.user_id,
                          username: nextAssignment.username,
                      },
                  ]
                : []
        );
        setTenantOptions(nextAssignment.tenants);
        setUserSearch(nextAssignment.username || '');
        setTenantSearch('');
        setAssignment(nextAssignment);
    };

    const roleRows = roles.map((role) => ({
        ...role,
        active_label: role.is_active ? t('YES') : t('NO'),
        capability_count: role.is_full_access
            ? t('FULL_ACCESS')
            : role.capabilities.length,
    }));
    const assignmentRows = assignments.map((item) => ({
        ...item,
        scope: item.is_global
            ? t('GLOBAL')
            : item.tenants.map((tenant) => tenant.name).join(', '),
    }));
    const allowsTenantScope = (roleId) => {
        const role = roles.find((item) => item.id === roleId);
        return roleAllowsTenantScope(role, capabilities);
    };
    const selectedRoleAllowsTenantScope = assignment
        ? allowsTenantScope(assignment.role_id)
        : false;
    const assignmentOpen = Boolean(assignment);
    const selectedUser =
        assignment && assignment.user_id
            ? userOptions.find((user) => user.id === assignment.user_id) || {
                  id: assignment.user_id,
                  username: assignment.username,
              }
            : null;
    const selectableUsers = selectedUser
        ? [
              selectedUser,
              ...userOptions.filter((user) => user.id !== selectedUser.id),
          ]
        : userOptions;
    const knownTenants = assignment
        ? [...assignment.tenants, ...tenantOptions]
        : tenantOptions;
    const selectedTenants = assignment
        ? assignment.tenant_ids
              .map((tenantId) =>
                  knownTenants.find((tenant) => tenant.id === tenantId)
              )
              .filter(Boolean)
        : [];
    const selectableTenants = [
        ...selectedTenants,
        ...tenantOptions.filter(
            (tenant) =>
                !selectedTenants.some((selected) => selected.id === tenant.id)
        ),
    ];

    useEffect(() => {
        if (!assignmentOpen) return undefined;

        let active = true;
        setUsersLoading(true);
        const timer = setTimeout(() => {
            psonoServer
                .admin_user(...credentials(), undefined, {
                    page_size: 5,
                    page: 0,
                    search: userSearch,
                })
                .then(
                    (response) => {
                        if (!active) return;
                        setUserOptions(response.data.users);
                        setUsersLoading(false);
                    },
                    (response) => {
                        if (!active) return;
                        setUserOptions([]);
                        setUsersLoading(false);
                        setError(responseError(response));
                    }
                );
        }, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignmentOpen, userSearch]);

    useEffect(() => {
        if (
            !assignmentOpen ||
            !selectedRoleAllowsTenantScope ||
            assignment.is_global
        ) {
            return undefined;
        }

        let active = true;
        setTenantsLoading(true);
        const timer = setTimeout(() => {
            psonoServer
                .admin_tenant(...credentials(), undefined, {
                    page_size: 5,
                    page: 0,
                    search: tenantSearch,
                })
                .then(
                    (response) => {
                        if (!active) return;
                        setTenantOptions(response.data.tenants);
                        setTenantsLoading(false);
                    },
                    (response) => {
                        if (!active) return;
                        setTenantOptions([]);
                        setTenantsLoading(false);
                        setError(responseError(response));
                    }
                );
        }, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        assignmentOpen,
        selectedRoleAllowsTenantScope,
        assignment && assignment.is_global,
        tenantSearch,
    ]);

    return (
        <Grid container>
            <GridItem xs={12} sm={12} md={12}>
                {pendingDelete && (
                    <DeleteConfirmDialog
                        title={t('CONFIRM_DELETE')}
                        onConfirm={deleteItem}
                        onAbort={() => setPendingDelete(null)}
                    >
                        {t('ADMINISTRATIVE_DELETE_CONFIRM')}
                    </DeleteConfirmDialog>
                )}
                {assignment && (
                    <Dialog
                        open
                        fullWidth
                        maxWidth="sm"
                        onClose={() => setAssignment(null)}
                    >
                        <DialogTitle>
                            {t(
                                assignment.id
                                    ? 'EDIT_ROLE_ASSIGNMENT'
                                    : 'CREATE_ROLE_ASSIGNMENT'
                            )}
                        </DialogTitle>
                        <DialogContent>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>{t('ROLE')}</InputLabel>
                                <Select
                                    value={assignment.role_id}
                                    onChange={(event) => {
                                        const roleId = event.target.value;
                                        const roleCanUseTenantScope =
                                            allowsTenantScope(roleId);
                                        setAssignment({
                                            ...assignment,
                                            role_id: roleId,
                                            is_global: roleCanUseTenantScope
                                                ? assignment.is_global
                                                : true,
                                            tenant_ids: roleCanUseTenantScope
                                                ? assignment.tenant_ids
                                                : [],
                                            tenants: roleCanUseTenantScope
                                                ? assignment.tenants
                                                : [],
                                        });
                                    }}
                                >
                                    {roles
                                        .filter((role) => role.is_active)
                                        .map((role) => (
                                            <MenuItem
                                                key={role.id}
                                                value={role.id}
                                            >
                                                {role.name}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                            <Autocomplete
                                autoHighlight
                                filterOptions={(options) => options}
                                inputValue={userSearch}
                                loading={usersLoading}
                                options={selectableUsers}
                                getOptionLabel={(user) => user.username}
                                getOptionSelected={(option, value) =>
                                    option.id === value.id
                                }
                                value={selectedUser}
                                onChange={(event, user) => {
                                    setUserSearch(user ? user.username : '');
                                    setAssignment({
                                        ...assignment,
                                        user_id: user ? user.id : '',
                                        username: user ? user.username : '',
                                    });
                                }}
                                onInputChange={(event, value, reason) => {
                                    if (
                                        reason === 'input' ||
                                        reason === 'clear'
                                    ) {
                                        setUserSearch(value);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        margin="normal"
                                        label={t('USER')}
                                        inputProps={{
                                            ...params.inputProps,
                                            autoComplete: 'new-password',
                                        }}
                                    />
                                )}
                            />
                            <div>
                                <Checkbox
                                    checked={assignment.is_global}
                                    disabled={!selectedRoleAllowsTenantScope}
                                    onChange={() =>
                                        setAssignment({
                                            ...assignment,
                                            is_global: !assignment.is_global,
                                            tenant_ids: [],
                                            tenants: [],
                                        })
                                    }
                                />
                                {t('GLOBAL_SCOPE')}
                            </div>
                            {selectedRoleAllowsTenantScope &&
                                !assignment.is_global && (
                                    <Autocomplete
                                        multiple
                                        autoHighlight
                                        filterSelectedOptions
                                        limitTags={5}
                                        filterOptions={(options) => options}
                                        inputValue={tenantSearch}
                                        loading={tenantsLoading}
                                        options={selectableTenants.filter(
                                            (tenant) =>
                                                tenant.is_active !== false ||
                                                selectedTenants.some(
                                                    (selected) =>
                                                        selected.id ===
                                                        tenant.id
                                                )
                                        )}
                                        getOptionLabel={(tenant) => tenant.name}
                                        getOptionSelected={(option, value) =>
                                            option.id === value.id
                                        }
                                        value={selectedTenants}
                                        onChange={(event, nextTenants) => {
                                            setTenantSearch('');
                                            setAssignment({
                                                ...assignment,
                                                tenant_ids: nextTenants.map(
                                                    (tenant) => tenant.id
                                                ),
                                                tenants: nextTenants,
                                            });
                                        }}
                                        onInputChange={(
                                            event,
                                            value,
                                            reason
                                        ) => {
                                            if (
                                                reason === 'input' ||
                                                reason === 'clear'
                                            ) {
                                                setTenantSearch(value);
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                margin="normal"
                                                label={t('TENANTS')}
                                                inputProps={{
                                                    ...params.inputProps,
                                                    autoComplete:
                                                        'new-password',
                                                }}
                                            />
                                        )}
                                    />
                                )}
                            {error && (
                                <SnackbarContent
                                    message={t(error)}
                                    color="danger"
                                />
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setAssignment(null)}>
                                {t('ABORT')}
                            </Button>
                            <Button
                                color="primary"
                                disabled={
                                    !assignment.role_id ||
                                    !assignment.user_id ||
                                    (!assignment.is_global &&
                                        assignment.tenant_ids.length === 0) ||
                                    (!selectedRoleAllowsTenantScope &&
                                        !assignment.is_global)
                                }
                                onClick={saveAssignment}
                            >
                                {t('SAVE')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
                <CustomTabs
                    title={t('ADMINISTRATIVE_ROLE_MANAGEMENT')}
                    headerColor="primary"
                    tabs={[
                        {
                            tabName: t('ROLES'),
                            tabIcon: Security,
                            tabContent: (
                                <CustomMaterialTable
                                    title=""
                                    columns={[
                                        {
                                            field: 'name',
                                            title: t('NAME'),
                                        },
                                        {
                                            field: 'description',
                                            title: t('DESCRIPTION'),
                                        },
                                        {
                                            field: 'active_label',
                                            title: t('ACTIVE'),
                                        },
                                        {
                                            field: 'capability_count',
                                            title: t('CAPABILITIES'),
                                        },
                                    ]}
                                    data={roleRows}
                                    actions={[
                                        {
                                            tooltip: t(
                                                'EDIT_ADMINISTRATIVE_ROLE'
                                            ),
                                            icon: Edit,
                                            onClick: (event, role) =>
                                                history.push(
                                                    '/administrative-role/' +
                                                        role.id
                                                ),
                                        },
                                        (role) => ({
                                            tooltip: t('DELETE'),
                                            icon: Delete,
                                            hidden: role.is_system,
                                            onClick: (event) =>
                                                setPendingDelete({
                                                    type: 'role',
                                                    item: role,
                                                }),
                                        }),
                                        {
                                            tooltip: t(
                                                'CREATE_ADMINISTRATIVE_ROLE'
                                            ),
                                            icon: Add,
                                            isFreeAction: true,
                                            onClick: () =>
                                                history.push(
                                                    '/administrative-roles/create'
                                                ),
                                        },
                                    ]}
                                />
                            ),
                        },
                        {
                            tabName: t('ROLE_ASSIGNMENTS'),
                            tabIcon: Person,
                            tabContent: (
                                <CustomMaterialTable
                                    title=""
                                    columns={[
                                        {
                                            field: 'username',
                                            title: t('USER'),
                                        },
                                        {
                                            field: 'role_name',
                                            title: t('ROLE'),
                                        },
                                        {
                                            field: 'scope',
                                            title: t('SCOPE'),
                                        },
                                    ]}
                                    data={assignmentRows}
                                    actions={[
                                        {
                                            tooltip: t('EDIT_ROLE_ASSIGNMENT'),
                                            icon: Edit,
                                            onClick: (event, item) =>
                                                openAssignmentDialog(item),
                                        },
                                        {
                                            tooltip: t('DELETE'),
                                            icon: Delete,
                                            onClick: (event, item) =>
                                                setPendingDelete({
                                                    type: 'assignment',
                                                    item,
                                                }),
                                        },
                                        {
                                            tooltip: t(
                                                'CREATE_ROLE_ASSIGNMENT'
                                            ),
                                            icon: Add,
                                            isFreeAction: true,
                                            onClick: () =>
                                                openAssignmentDialog(),
                                        },
                                    ]}
                                />
                            ),
                        },
                    ]}
                />
                {error && !assignment && (
                    <SnackbarContent message={t(error)} color="danger" />
                )}
            </GridItem>
        </Grid>
    );
};

export default AdministrativeRoles;
