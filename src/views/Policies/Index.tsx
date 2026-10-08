import type { TableHandle } from '../../types/table';
import React, { useRef } from 'react';
import { Grid } from '@mui/material';
import { withStyles } from '@mui/styles';
import { useTranslation, withTranslation } from 'react-i18next';
import { compose } from 'redux';
import moment from 'moment';

import { Redirect } from 'react-router-dom';

import { CustomMaterialTable, GridItem, RegularCard } from '../../components';
import dashboardStyle from '../../assets/jss/material-dashboard-react/dashboardStyle';
import psono_server from '../../services/api-server';
import store from '../../services/store';
import { Edit } from '@mui/icons-material';
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';

const Policies = () => {
    const { t } = useTranslation();
    const policyTableRef = useRef<TableHandle | null>(null);

    const [redirectTo, setRedirectTo] = React.useState('');

    const onDeletePolicies = (selected_policy: any) => {
        psono_server
            .admin_delete_policy(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                selected_policy.id
            )
            .then(() => {
                policyTableRef.current &&
                    policyTableRef.current.onQueryChange();
            });
    };

    const onEditPolicy = (selected_policy: any) => {
        setRedirectTo('/policy/' + selected_policy.id);
    };

    const onCreatePolicy = () => {
        setRedirectTo('/policies/create/');
    };

    const loadPolicies = (query: any) => {
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
            .admin_policy(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                undefined,
                params
            )
            .then((response) => {
                const { policies } = response.data;
                policies.forEach((u: any) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                });
                return {
                    data: policies,
                    page: query.page,
                    pageSize: query.pageSize,
                    totalCount: response.data.count,
                };
            });
    };

    if (redirectTo) {
        return <Redirect to={redirectTo} />;
    }
    return (
        <div>
            <Grid container>
                <GridItem xs={12} sm={12} md={12}>
                    <RegularCard
                        headerColor="orange"
                        cardTitle={t('POLICIES')}
                        cardSubtitle={t('POLICY_LIST_INFO')}
                        content={
                            <CustomMaterialTable
                                tableRef={policyTableRef}
                                columns={[
                                    {
                                        field: 'priority',
                                        title: t('PRIORITY'),
                                    },
                                    {
                                        field: 'title',
                                        title: t('TITLE'),
                                    },
                                    {
                                        field: 'create_date',
                                        title: t('CREATED_AT'),
                                    },
                                ]}
                                data={loadPolicies}
                                title={''}
                                actions={[
                                    {
                                        tooltip: t('EDIT'),
                                        icon: Edit,
                                        onClick: (
                                            evt: any,
                                            selectedPolicy: any
                                        ) => onEditPolicy(selectedPolicy),
                                    },
                                    {
                                        tooltip: t('DELETE'),
                                        icon: Delete,
                                        onClick: (
                                            evt: any,
                                            selectedPolicy: any
                                        ) => onDeletePolicies(selectedPolicy),
                                    },
                                    {
                                        tooltip: t('CREATE_POLICY'),
                                        isFreeAction: true,
                                        icon: Add,
                                        onClick: (evt: any) => onCreatePolicy(),
                                    },
                                ]}
                            />
                        }
                    />
                </GridItem>
            </Grid>
        </div>
    );
};

export default withTranslation()(withStyles(dashboardStyle)(Policies));
