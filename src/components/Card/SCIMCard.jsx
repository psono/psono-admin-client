import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core';
import { Group } from '@material-ui/icons';
import Delete from '@material-ui/icons/Delete';

import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import { CustomMaterialTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';
import DeleteConfirmDialog from '../Dialog/DeleteConfirmDialog';

const SCIMCard = ({ scim_groups, onDeleteScimGroups }) => {
    const { t } = useTranslation();
    const [deleteScimGroups, setDeleteScimGroups] = useState([]);

    return (
        <>
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
                                            field: 'groups',
                                            title: t('MAPPED_GROUPS'),
                                        },
                                    ]}
                                    data={scim_groups}
                                    title={t('SCIM_GROUPS')}
                                    actions={[
                                        {
                                            tooltip: t('DELETE'),
                                            icon: Delete,
                                            onClick: (evt, data) => {
                                                setDeleteScimGroups([data]);
                                            },
                                        },
                                    ]}
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

SCIMCard.propTypes = {
    scim_groups: PropTypes.array,
    onDeleteScimGroups: PropTypes.func.isRequired,
};

export default SCIMCard;
