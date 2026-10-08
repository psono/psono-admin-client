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

export interface OIDCCardProps {
    oidc_groups?: any;
    onDeleteOidcGroups: (...args: any[]) => any;
    onUpdateOidcGroupTenants: (...args: any[]) => any;
    canManageIdentityProviders?: boolean;
}
const OIDCCard = ({
    oidc_groups,
    onDeleteOidcGroups,
    onUpdateOidcGroupTenants,
    canManageIdentityProviders,
}: OIDCCardProps) => {
    const { t } = useTranslation();
    const [deleteOidcGroups, setDeleteOidcGroups] = useState<ApiRecord[]>([]);
    const [editOidcGroup, setEditOidcGroup] = useState<ApiRecord | null>(null);

    return (
        <>
            {canManageIdentityProviders && editOidcGroup && (
                <TenantMultiSelectDialog
                    group={editOidcGroup}
                    onSave={(tenantIds) =>
                        onUpdateOidcGroupTenants(editOidcGroup, tenantIds)
                    }
                    onAbort={() => setEditOidcGroup(null)}
                />
            )}
            {deleteOidcGroups.length > 0 && (
                <DeleteConfirmDialog
                    title={t('DELETE_OIDC_GROUP_S')}
                    onConfirm={() => {
                        onDeleteOidcGroups(deleteOidcGroups);
                        setDeleteOidcGroups([]);
                    }}
                    onAbort={() => {
                        setDeleteOidcGroups([]);
                    }}
                >
                    {t('DELETE_OIDC_GROUP_CONFIRM_DIALOG')}
                </DeleteConfirmDialog>
            )}
            <CustomTabs
                title={t('OIDC_MANAGEMENT')}
                headerColor="primary"
                tabs={[
                    {
                        tabName: t('GROUPS'),
                        tabIcon: Group,
                        tabContent: (
                            <CustomMaterialTable
                                columns={[
                                    {
                                        field: 'oidc_name',
                                        title: t('NAME'),
                                    },
                                    {
                                        field: 'oidc_provider_id',
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
                                data={oidc_groups}
                                title={t('OIDC_GROUPS')}
                                actions={
                                    canManageIdentityProviders
                                        ? [
                                              {
                                                  tooltip: t('EDIT'),
                                                  icon: Edit,
                                                  onClick: (
                                                      evt: any,
                                                      data: any
                                                  ) => setEditOidcGroup(data),
                                              },
                                              {
                                                  tooltip: t('DELETE'),
                                                  icon: Delete,
                                                  onClick: (
                                                      evt: any,
                                                      data: any
                                                  ) => {
                                                      setDeleteOidcGroups([
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
                        ),
                    },
                ]}
            />
        </>
    );
};

export default OIDCCard;
