import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core';
import { Group } from '@material-ui/icons';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';

import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import { CustomMaterialTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';
import DeleteConfirmDialog from '../Dialog/DeleteConfirmDialog';
import TenantMultiSelectDialog from '../Dialog/TenantMultiSelectDialog';

const OIDCCard = ({
    oidc_groups,
    onDeleteOidcGroups,
    onUpdateOidcGroupTenants,
    canManageIdentityProviders,
}) => {
    const { t } = useTranslation();
    const [deleteOidcGroups, setDeleteOidcGroups] = useState([]);
    const [editOidcGroup, setEditOidcGroup] = useState(null);

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
                                                  onClick: (evt, data) =>
                                                      setEditOidcGroup(data),
                                              },
                                              {
                                                  tooltip: t('DELETE'),
                                                  icon: Delete,
                                                  onClick: (evt, data) => {
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

OIDCCard.propTypes = {
    oidc_groups: PropTypes.array,
    onDeleteOidcGroups: PropTypes.func.isRequired,
    onUpdateOidcGroupTenants: PropTypes.func.isRequired,
    canManageIdentityProviders: PropTypes.bool.isRequired,
};

export default OIDCCard;
