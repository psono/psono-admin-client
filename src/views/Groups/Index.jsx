import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useHistory } from 'react-router-dom';

import { Grid } from '@material-ui/core';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Delete';
import Add from '@material-ui/icons/Add';

import { GridItem, CustomMaterialTable, RegularCard } from '../../components';
import psono_server from '../../services/api-server';
import store from '../../services/store';
import DeleteConfirmDialog from '../../components/Dialog/DeleteConfirmDialog';

const GroupsView = (props) => {
    const { t } = useTranslation();
    const groupTableRef = useRef(null);
    const history = useHistory();
    const [deleteGroups, setDeleteGroups] = useState([]);

    const onEditGroup = (selectedGroups) => {
        history.push('/group/' + selectedGroups[0].id);
    };

    const onDeleteGroups = (selectedGroups) => {
        selectedGroups.forEach((group) => {
            psono_server
                .admin_delete_group(
                    store.getState().user.token,
                    store.getState().user.session_secret_key,
                    group.id
                )
                .then(() => {
                    groupTableRef.current &&
                        groupTableRef.current.onQueryChange();
                });
        });
    };

    const onCreateGroup = () => {
        history.push('/groups/create/');
    };

    const loadGroups = (query) => {
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
            .admin_group(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                undefined,
                params
            )
            .then((response) => {
                const { groups } = response.data;
                groups.forEach((g) => {
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
                                onDeleteGroups(deleteGroups);
                                setDeleteGroups([]);
                            }}
                            onAbort={() => {
                                setDeleteGroups([]);
                            }}
                        >
                            {t('DELETE_GROUP_CONFIRM_DIALOG')}
                        </DeleteConfirmDialog>
                    )}
                    <RegularCard
                        cardTitle={t('GROUP_MANAGEMENT')}
                        cardSubtitle={t('GROUP_LIST_INFO')}
                        headerColor="green"
                        content={
                            <CustomMaterialTable
                                tableRef={groupTableRef}
                                columns={[
                                    {
                                        field: 'mapped',
                                        title: t('MAPPED'),
                                        customSort: (a, b) => {
                                            return a.mapped_raw - b.mapped_raw;
                                        },
                                    },
                                    { field: 'name', title: t('NAME') },
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
                                ]}
                                data={loadGroups}
                                title={''}
                                actions={[
                                    {
                                        tooltip: t('EDIT_GROUP'),
                                        icon: Edit,
                                        onClick: (evt, data) =>
                                            onEditGroup([data]),
                                    },
                                    {
                                        tooltip: t('DELETE_GROUP_S'),
                                        icon: Delete,
                                        onClick: (evt, data) => {
                                            setDeleteGroups([data]);
                                        },
                                    },
                                    {
                                        tooltip: t('CREATE_GROUP'),
                                        isFreeAction: true,
                                        icon: Add,
                                        hidden:
                                            store.getState().server.type !==
                                            'EE',
                                        onClick: (evt) => onCreateGroup(),
                                    },
                                ]}
                            />
                        }
                    />
                </div>
            </GridItem>
        </Grid>
    );
};

export default GroupsView;
