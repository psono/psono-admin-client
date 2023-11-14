import React, { useRef } from 'react';
import { withStyles, Grid } from '@material-ui/core';
import { useTranslation, withTranslation } from 'react-i18next';
import { compose } from 'redux';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { CustomMaterialTable, GridItem, RegularCard } from '../../components';
import dashboardStyle from '../../assets/jss/material-dashboard-react/dashboardStyle';
import psono_server from '../../services/api-server';
import store from '../../services/store';
import { Edit } from '@material-ui/icons';
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';

const Policies = () => {
    const { t } = useTranslation();
    const policyTableRef = useRef(null);

    const [redirectTo, setRedirectTo] = React.useState('');

    const onDeletePolicies = (selected_policy) => {
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

    const onEditPolicy = (selected_policy) => {
        setRedirectTo('/policy/' + selected_policy.id);
    };

    const onCreatePolicy = () => {
        setRedirectTo('/policies/create/');
    };

    const loadPolicies = (query) => {
        const params = {
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
                policies.forEach((u) => {
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
                                        onClick: (evt, selectedPolicy) =>
                                            onEditPolicy(selectedPolicy),
                                    },
                                    {
                                        tooltip: t('DELETE'),
                                        icon: Delete,
                                        onClick: (evt, selectedPolicy) =>
                                            onDeletePolicies(selectedPolicy),
                                    },
                                    {
                                        tooltip: t('CREATE_POLICY'),
                                        isFreeAction: true,
                                        icon: Add,
                                        onClick: (evt) => onCreatePolicy(),
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

Policies.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default compose(withTranslation(), withStyles(dashboardStyle))(Policies);
