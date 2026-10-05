import type { ApiRecord } from '../../types/api';
import React, { useRef, useState } from 'react';
import { Grid } from '@mui/material';
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { CustomMaterialTable, GridItem, RegularCard } from '../../components';
import DeleteConfirmDialog from '../../components/Dialog/DeleteConfirmDialog';
import psonoServer from '../../services/api-server';
import store from '../../services/store';
import type { TableHandle } from '../../types/table';

const Tenants = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const [pendingDelete, setPendingDelete] = useState<ApiRecord | null>(null);
    const tableRef = useRef<TableHandle | null>(null);
    const credentials = () =>
        [
            store.getState().user.token,
            store.getState().user.session_secret_key,
        ] as const;

    const loadTenants = (query: any) => {
        const params: Record<string, string | number> = {
            page_size: query.pageSize,
            search: query.search,
            page: query.page,
        };
        if (query.orderBy) {
            const fields: Record<string, string> = {
                active_label: 'is_active',
            };
            const field = fields[query.orderBy.field] || query.orderBy.field;
            params.ordering =
                query.orderDirection === 'asc' ? field : '-' + field;
        }

        return psonoServer
            .admin_tenant(...credentials(), undefined, params)
            .then((response) => ({
                data: response.data.tenants.map((tenant: any) => ({
                    ...tenant,
                    active_label: tenant.is_active ? t('YES') : t('NO'),
                })),
                page: query.page,
                pageSize: query.pageSize,
                totalCount: response.data.count,
            }));
    };

    const deleteTenant = () => {
        psonoServer
            .admin_delete_tenant(...credentials(), pendingDelete!.id)
            .then(() => {
                if (tableRef.current) tableRef.current.onQueryChange();
            });
        setPendingDelete(null);
    };

    return (
        <Grid container>
            <GridItem xs={12} sm={12} md={12}>
                {pendingDelete && (
                    <DeleteConfirmDialog
                        title={t('DELETE_TENANT')}
                        onConfirm={deleteTenant}
                        onAbort={() => setPendingDelete(null)}
                    >
                        {t('DELETE_TENANT_CONFIRM')}
                    </DeleteConfirmDialog>
                )}
                <RegularCard
                    cardTitle={t('TENANT_MANAGEMENT')}
                    cardSubtitle={t('TENANT_MANAGEMENT_INFO')}
                    headerColor="primary"
                    content={
                        <CustomMaterialTable
                            tableRef={tableRef}
                            title=""
                            columns={[
                                { field: 'name', title: t('NAME') },
                                {
                                    field: 'description',
                                    title: t('DESCRIPTION'),
                                },
                                {
                                    field: 'active_label',
                                    title: t('ACTIVE'),
                                },
                                {
                                    field: 'user_count',
                                    title: t('USERS'),
                                },
                                {
                                    field: 'group_count',
                                    title: t('GROUPS'),
                                },
                            ]}
                            data={loadTenants}
                            actions={[
                                {
                                    tooltip: t('EDIT_TENANT'),
                                    icon: Edit,
                                    onClick: (event: any, tenant: any) =>
                                        history.push('/tenant/' + tenant.id),
                                },
                                {
                                    tooltip: t('DELETE_TENANT'),
                                    icon: Delete,
                                    onClick: (event: any, tenant: any) =>
                                        setPendingDelete(tenant),
                                },
                                {
                                    tooltip: t('CREATE_TENANT'),
                                    icon: Add,
                                    isFreeAction: true,
                                    onClick: () =>
                                        history.push('/tenants/create'),
                                },
                            ]}
                        />
                    }
                />
            </GridItem>
        </Grid>
    );
};

export default Tenants;
