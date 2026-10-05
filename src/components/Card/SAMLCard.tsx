import type { ApiRecord } from '../../types/api';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { withStyles } from '@mui/styles';
import { Group } from '@mui/icons-material';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';

import CustomTabs from '../../components/CustomTabs/CustomTabs';
import { Button, CustomMaterialTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';
import DeleteConfirmDialog from '../Dialog/DeleteConfirmDialog';
import TenantMultiSelectDialog from '../Dialog/TenantMultiSelectDialog';

export interface SAMLCardProps {
    saml_groups?: any;
    onSyncGroupsSaml: (...args: any[]) => any;
    onDeleteSamlGroups: (...args: any[]) => any;
    onUpdateSamlGroupTenants: (...args: any[]) => any;
    canManageIdentityProviders?: boolean;
}
const SAMLCard = ({
    saml_groups,
    onSyncGroupsSaml,
    onDeleteSamlGroups,
    onUpdateSamlGroupTenants,
    canManageIdentityProviders,
}: SAMLCardProps) => {
    const { t } = useTranslation();
    const [deleteSamlGroups, setDeleteSamlGroups] = useState<ApiRecord[]>([]);
    const [editSamlGroup, setEditSamlGroup] = useState<ApiRecord | null>(null);

    return (
        <>
            {canManageIdentityProviders && editSamlGroup && (
                <TenantMultiSelectDialog
                    group={editSamlGroup}
                    onSave={(tenantIds) =>
                        onUpdateSamlGroupTenants(editSamlGroup, tenantIds)
                    }
                    onAbort={() => setEditSamlGroup(null)}
                />
            )}
            {deleteSamlGroups.length > 0 && (
                <DeleteConfirmDialog
                    title={t('DELETE_SAML_GROUP_S')}
                    onConfirm={() => {
                        onDeleteSamlGroups(deleteSamlGroups);
                        setDeleteSamlGroups([]);
                    }}
                    onAbort={() => {
                        setDeleteSamlGroups([]);
                    }}
                >
                    {t('DELETE_SAML_GROUP_CONFIRM_DIALOG')}
                </DeleteConfirmDialog>
            )}
            <CustomTabs
                title={t('SAML_MANAGEMENT')}
                headerColor="primary"
                tabs={[
                    {
                        tabName: t('GROUPS'),
                        tabIcon: Group,
                        tabContent: (
                            <div>
                                {canManageIdentityProviders && (
                                    <Button
                                        color="info"
                                        onClick={onSyncGroupsSaml}
                                    >
                                        {t('SYNC_WITH_SAML_IDP')}
                                    </Button>
                                )}
                                <CustomMaterialTable
                                    columns={[
                                        { field: 'name', title: t('NAME') },
                                        {
                                            field: 'saml_provider_id',
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
                                    data={saml_groups}
                                    title={t('SAML_GROUPS')}
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
                                                          setEditSamlGroup(
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
                                                          setDeleteSamlGroups([
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

export default SAMLCard;
