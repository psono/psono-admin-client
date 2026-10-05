import type { ApiRecord } from '../../types/api';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { withStyles } from '@mui/styles';
import { Group } from '@mui/icons-material';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';

import CustomTabs from '../../components/CustomTabs/CustomTabs';
import { CustomMaterialTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';
import DeleteConfirmDialog from '../Dialog/DeleteConfirmDialog';
import TenantMultiSelectDialog from '../Dialog/TenantMultiSelectDialog';

export interface SCIMCardProps {
    scim_groups?: any;
    onDeleteScimGroups: (...args: any[]) => any;
    onUpdateScimGroupTenants: (...args: any[]) => any;
    canManageIdentityProviders?: boolean;
}
const SCIMCard = ({
    scim_groups,
    onDeleteScimGroups,
    onUpdateScimGroupTenants,
    canManageIdentityProviders,
}: SCIMCardProps) => {
    const { t } = useTranslation();
    const [deleteScimGroups, setDeleteScimGroups] = useState<ApiRecord[]>([]);
    const [editScimGroup, setEditScimGroup] = useState<ApiRecord | null>(null);

    return (
        <>
            {canManageIdentityProviders && editScimGroup && (
                <TenantMultiSelectDialog
                    group={editScimGroup}
                    onSave={(tenantIds) =>
                        onUpdateScimGroupTenants(editScimGroup, tenantIds)
                    }
                    onAbort={() => setEditScimGroup(null)}
                />
            )}
            {deleteScimGroups.length > 0 && (
                <DeleteConfirmDialog
                    title={t('DELETE_SCIM_GROUP_S')}
                    onConfirm={() => {
                        onDeleteScimGroups(deleteScimGroups);
                        setDeleteScimGroups([]);
                    }}
                    onAbort={() => {
                        setDeleteScimGroups([]);
                    }}
                >
                    {t('DELETE_SCIM_GROUP_CONFIRM_DIALOG')}
                </DeleteConfirmDialog>
            )}
            <CustomTabs
                title={t('SCIM_MANAGEMENT')}
                headerColor="primary"
                tabs={[
                    {
                        tabName: t('GROUPS'),
                        tabIcon: Group,
                        tabContent: (
                            <div>
                                <CustomMaterialTable
                                    columns={[
                                        { field: 'name', title: t('NAME') },
                                        {
                                            field: 'scim_provider_id',
                                            title: t('PROVIDER_ID'),
                                        },
                                        {
                                            field: 'tenant_names',
                                            title: t('TENANTS'),
                                        },
                                        {
                                            field: 'groups',
                                            title: t('MAPPED_GROUPS'),
                                        },
                                    ]}
                                    data={scim_groups}
                                    title={t('SCIM_GROUPS')}
                                    actions={
                                        canManageIdentityProviders
                                            ? [
                                                  {
                                                      tooltip: t('EDIT'),
                                                      icon: Edit,
                                                      onClick: (
                                                          evt: any,
                                                          data: any
                                                      ) =>
                                                          setEditScimGroup(
                                                              data
                                                          ),
                                                  },
                                                  {
                                                      tooltip: t('DELETE'),
                                                      icon: Delete,
                                                      onClick: (
                                                          evt: any,
                                                          data: any
                                                      ) => {
                                                          setDeleteScimGroups([
                                                              data,
                                                          ]);
                                                      },
                                                  },
                                              ]
                                            : []
                                    }
                                    options={{
                                        pageSize: 10,
                                    }}
                                />
                            </div>
                        ),
                    },
                ]}
            />
        </>
    );
};

export default SCIMCard;
