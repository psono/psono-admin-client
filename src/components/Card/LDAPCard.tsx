import type { ApiRecord } from '../../types/api';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { withStyles } from '@mui/styles';
import { Person, Group } from '@mui/icons-material';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';

import CustomTabs from '../../components/CustomTabs/CustomTabs';
import { CustomMaterialTable, Button } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';
import DeleteConfirmDialog from '../Dialog/DeleteConfirmDialog';
import TenantMultiSelectDialog from '../Dialog/TenantMultiSelectDialog';

export interface LDAPCardProps {
    ldap_users?: any;
    ldap_groups?: any;
    onSyncGroupsLdap: (...args: any[]) => any;
    onDeleteLdapGroups: (...args: any[]) => any;
    onUpdateLdapGroupTenants: (...args: any[]) => any;
    canManageIdentityProviders?: boolean;
}
const LDAPCard = ({
    ldap_users,
    ldap_groups,
    onSyncGroupsLdap,
    onDeleteLdapGroups,
    onUpdateLdapGroupTenants,
    canManageIdentityProviders,
}: LDAPCardProps) => {
    const { t } = useTranslation();
    const [deleteLdapGroups, setDeleteLdapGroups] = useState<ApiRecord[]>([]);
    const [editLdapGroup, setEditLdapGroup] = useState<ApiRecord | null>(null);

    return (
        <>
            {canManageIdentityProviders && editLdapGroup && (
                <TenantMultiSelectDialog
                    group={editLdapGroup}
                    onSave={(tenantIds) =>
                        onUpdateLdapGroupTenants(editLdapGroup, tenantIds)
                    }
                    onAbort={() => setEditLdapGroup(null)}
                />
            )}
            {deleteLdapGroups.length > 0 && (
                <DeleteConfirmDialog
                    title={t('DELETE_LDAP_GROUP_S')}
                    onConfirm={() => {
                        onDeleteLdapGroups(deleteLdapGroups);
                        setDeleteLdapGroups([]);
                    }}
                    onAbort={() => {
                        setDeleteLdapGroups([]);
                    }}
                >
                    {t('DELETE_LDAP_GROUP_CONFIRM_DIALOG')}
                </DeleteConfirmDialog>
            )}
            <CustomTabs
                title={t('LDAP_MANAGEMENT')}
                headerColor="primary"
                tabs={[
                    {
                        tabName: t('USERS'),
                        tabIcon: Person,
                        tabContent: (
                            <CustomMaterialTable
                                columns={[
                                    {
                                        field: 'username',
                                        title: t('USERNAME'),
                                    },
                                    {
                                        field: 'create_date',
                                        title: t('IMPORTED'),
                                    },
                                    { field: 'email', title: t('EMAIL') },
                                    { field: 'dn', title: t('DN') },
                                ]}
                                data={ldap_users}
                                title={t('LDAP_USERS')}
                                options={{
                                    pageSize: 10,
                                }}
                            />
                        ),
                    },
                    {
                        tabName: t('GROUPS'),
                        tabIcon: Group,
                        tabContent: (
                            <div>
                                {canManageIdentityProviders && (
                                    <Button
                                        color="info"
                                        onClick={onSyncGroupsLdap}
                                    >
                                        {t('SYNC_WITH_LDAP')}
                                    </Button>
                                )}
                                <CustomMaterialTable
                                    columns={[
                                        { field: 'dn', title: 'DN' },
                                        {
                                            field: 'domain',
                                            title: 'Domain',
                                        },
                                        {
                                            field: 'tenant_names',
                                            title: t('TENANTS'),
                                        },
                                        {
                                            field: 'groups',
                                            title: 'Mapped Groups',
                                        },
                                    ]}
                                    data={ldap_groups}
                                    title={t('LDAP_GROUPS')}
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
                                                          setEditLdapGroup(
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
                                                          setDeleteLdapGroups([
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

export default LDAPCard;
