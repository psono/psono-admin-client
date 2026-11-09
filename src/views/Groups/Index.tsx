import type { TableHandle } from '../../types/table';
import type { ApiRecord } from '../../types/api';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useHistory } from 'react-router-dom';

import { Grid, Tooltip } from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import InfoOutlined from '@mui/icons-material/InfoOutlined';

import {
    GridItem,
    CustomMaterialTable,
    RegularCard,
    SnackbarContent,
} from '../../components';
import psono_server from '../../services/api-server';
import store from '../../services/store';
import DeleteConfirmDialog from '../../components/Dialog/DeleteConfirmDialog';
import { hasCapabilityForTenantIds } from '../../services/authorization';
import { apiErrorCode, isApiError } from '../../services/api-error';

export interface GroupsViewProps {}
const GroupsView = (props: GroupsViewProps) => {
    const { t } = useTranslation();
    const groupTableRef = useRef<TableHandle | null>(null);
    const history = useHistory();
    const [deleteGroups, setDeleteGroups] = useState<ApiRecord[]>([]);
    const [confirmSharedDelete, setConfirmSharedDelete] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const server = store.getState().server;
    const isEeServer = server.type === 'EE';
    const authorization = store.getState().user.authorization;
    const canForGroup = (code: any, group: any) =>
        hasCapabilityForTenantIds(authorization, code, group.tenant_ids);

    const onEditGroup = (selectedGroups: any) => {
        history.push('/group/' + selectedGroups[0].id);
    };

    const onDeleteGroups = (
        selectedGroups: any,
        confirmSharedOwnership = false
    ) => {
        setDeleteError('');
        return Promise.all(
            selectedGroups.map((group: any) =>
                psono_server.admin_delete_group(
                    store.getState().user.token,
                    store.getState().user.session_secret_key,
                    group.id,
                    confirmSharedOwnership
                )
            )
        )
            .then(() => {
                groupTableRef.current && groupTableRef.current.onQueryChange();
            })
            .catch((error) => {
                if (
                    !confirmSharedOwnership &&
                    isApiError(error, 'SHARED_OWNERSHIP_CONFIRMATION_REQUIRED')
                ) {
                    setDeleteGroups(selectedGroups);
                    setConfirmSharedDelete(true);
                    return;
                }
                setDeleteError(apiErrorCode(error));
            });
    };

    const onCreateGroup = () => {
        history.push('/groups/create/');
    };

    const renderKeyHealth = (group: ApiRecord) => {
        if (
            typeof group.has_active_user_key_copies !== 'boolean' ||
            typeof group.admin_recovery_exists !== 'boolean'
        ) {
            return t('GROUP_KEY_HEALTH_NOT_REPORTED');
        }
        const hasUserCopies = group.has_active_user_key_copies;
        const hasAdminEscrow = group.admin_recovery_exists;
        const summary = hasUserCopies
            ? 'GROUP_USER_KEY_COPIES_AVAILABLE'
            : hasAdminEscrow
            ? 'GROUP_ADMIN_RECOVERY_AVAILABLE'
            : 'GROUP_NO_USER_COPIES_OR_ADMIN_ESCROW';
        const details = `${t('GROUP_ACTIVE_USER_KEY_COPIES')}: ${t(
            hasUserCopies ? 'YES' : 'NO'
        )}; ${t('GROUP_ADMINISTRATOR_ESCROW')}: ${t(
            hasAdminEscrow ? 'YES' : 'NO'
        )}. ${t('GROUP_KEY_HEALTH_INFO')}`;
        return (
            <Tooltip title={details}>
                <span>{t(summary)}</span>
            </Tooltip>
        );
    };

    const loadGroups = (query: any) => {
        const params: Record<string, string | number> = {
            page_size: query.pageSize,
            search: query.search,
            page: query.page,
        };
        if (query.orderBy) {
            if (query.orderDirection === 'asc') {
                params['ordering'] = query.orderBy.field;
            } else {
                params['ordering'] = '-' + query.orderBy.field;
            }
        }

        return psono_server
            .admin_group(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                undefined,
                params
            )
            .then((response) => {
                const { groups } = response.data;
                groups.forEach((g: any) => {
                    g.create_date = moment(g.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    g.is_managed = g.is_managed ? t('YES') : t('NO');
                });
                return {
                    data: groups,
                    page: query.page,
                    pageSize: query.pageSize,
                    totalCount: response.data.count,
                };
            });
    };

    return (
        <Grid container>
            <GridItem xs={12} sm={12} md={12}>
                <div>
                    {deleteGroups.length > 0 && (
                        <DeleteConfirmDialog
                            title={t('DELETE_GROUP_S')}
                            onConfirm={() => {
                                const groups = deleteGroups;
                                setDeleteGroups([]);
                                const confirm = confirmSharedDelete;
                                setConfirmSharedDelete(false);
                                onDeleteGroups(groups, confirm);
                            }}
                            onAbort={() => {
                                setDeleteGroups([]);
                                setConfirmSharedDelete(false);
                            }}
                        >
                            {t(
                                confirmSharedDelete
                                    ? 'DELETE_SHARED_GROUP_CONFIRM_DIALOG'
                                    : 'DELETE_GROUP_CONFIRM_DIALOG'
                            )}
                        </DeleteConfirmDialog>
                    )}
                    {deleteError && (
                        <SnackbarContent
                            message={t(deleteError)}
                            color="danger"
                        />
                    )}
                    {isEeServer &&
                        server.admin_recovery_public_key_configured ===
                            false && (
                            <SnackbarContent
                                message={t(
                                    'GROUP_ADMIN_RECOVERY_NOT_CONFIGURED'
                                )}
                                color="info"
                                icon={InfoOutlined}
                            />
                        )}
                    <RegularCard
                        cardTitle={t('GROUP_MANAGEMENT')}
                        cardSubtitle={t('GROUP_LIST_INFO')}
                        headerColor="green"
                        content={
                            <CustomMaterialTable
                                tableRef={groupTableRef}
                                columns={[
                                    { field: 'name', title: t('NAME') },
                                    {
                                        field: 'mapped',
                                        title: t('MAPPED'),
                                        customSort: (a: any, b: any) => {
                                            return a.mapped_raw - b.mapped_raw;
                                        },
                                    },
                                    {
                                        field: 'create_date',
                                        title: t('CREATED_AT'),
                                    },
                                    {
                                        field: 'member_count',
                                        title: t('MEMBERS'),
                                    },
                                    {
                                        field: 'is_managed',
                                        title: t('MANAGED'),
                                        sorting: false,
                                    },
                                    ...(isEeServer
                                        ? [
                                              {
                                                  field: 'key_health',
                                                  title: t('GROUP_KEY_HEALTH'),
                                                  sorting: false,
                                                  render: renderKeyHealth,
                                              },
                                          ]
                                        : []),
                                ]}
                                data={loadGroups}
                                title={''}
                                actions={[
                                    (data: any) => ({
                                        tooltip: canForGroup(
                                            'groups.update',
                                            data
                                        )
                                            ? t('EDIT_GROUP')
                                            : t('DETAILS'),

                                        icon: Edit,
                                        onClick: () => onEditGroup([data]),
                                    }),
                                    (data: any) => ({
                                        tooltip: t('DELETE_GROUP_S'),
                                        icon: Delete,

                                        hidden: !canForGroup(
                                            'groups.delete',
                                            data
                                        ),

                                        onClick: () => {
                                            setDeleteGroups([data]);
                                        },
                                    }),
                                    {
                                        tooltip: t('CREATE_GROUP'),
                                        isFreeAction: true,
                                        icon: Add,
                                        hidden:
                                            store.getState().server.type !==
                                                'EE' ||
                                            !authorization!.is_superuser,
                                        onClick: (evt: any) => onCreateGroup(),
                                    },
                                ].filter(Boolean)}
                            />
                        }
                    />
                </div>
            </GridItem>
        </Grid>
    );
};

export default GroupsView;
