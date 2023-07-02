import React from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core';
import { Group } from '@material-ui/icons';
import Delete from '@material-ui/icons/Delete';

import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import { CustomMaterialTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';
import DeleteConfirmDialog from '../Dialog/DeleteConfirmDialog';

class SCIMCard extends React.Component {
    state = {
        deleteScimGroups: [],
    };
    render() {
        const { t, scim_groups, onDeleteScimGroups } = this.props;
        return (
            <>
                {this.state.deleteScimGroups.length > 0 && (
                    <DeleteConfirmDialog
                        title={t('DELETE_SCIM_GROUP_S')}
                        onConfirm={() => {
                            onDeleteScimGroups(this.state.deleteScimGroups);
                            this.setState({
                                deleteScimGroups: [],
                            });
                        }}
                        onAbort={() => {
                            this.setState({
                                deleteScimGroups: [],
                            });
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
                                                title: t('POVIDER_ID'),
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
                                                    this.setState({
                                                        deleteScimGroups: [
                                                            data,
                                                        ],
                                                    });
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
    }
}

SCIMCard.propTypes = {
    classes: PropTypes.object.isRequired,
    sessions: PropTypes.array,
    scim_groups: PropTypes.array,
    onDeleteScimGroups: PropTypes.func.isRequired,
};

export default compose(withTranslation(), withStyles(tasksCardStyle))(SCIMCard);
