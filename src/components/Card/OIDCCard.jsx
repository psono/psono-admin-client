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

class OIDCCard extends React.Component {
    state = {
        deleteOidcGroups: [],
    };
    render() {
        const { t, oidc_groups, onDeleteOidcGroups } = this.props;
        return (
            <>
                {this.state.deleteOidcGroups.length > 0 && (
                    <DeleteConfirmDialog
                        title={t('DELETE_OIDC_GROUP_S')}
                        onConfirm={() => {
                            onDeleteOidcGroups(this.state.deleteOidcGroups);
                            this.setState({
                                deleteOidcGroups: [],
                            });
                        }}
                        onAbort={() => {
                            this.setState({
                                deleteOidcGroups: [],
                            });
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
                                            field: 'groups',
                                            title: t('MAPPED_GROUPS'),
                                        },
                                    ]}
                                    data={oidc_groups}
                                    title={t('OIDC_GROUPS')}
                                    actions={[
                                        {
                                            tooltip: t('DELETE'),
                                            icon: Delete,
                                            onClick: (evt, data) => {
                                                this.setState({
                                                    deleteOidcGroups: [data],
                                                });
                                            },
                                        },
                                    ]}
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
    }
}

OIDCCard.propTypes = {
    classes: PropTypes.object.isRequired,
    sessions: PropTypes.array,
    oidc_groups: PropTypes.array,
    onDeleteOidcGroups: PropTypes.func.isRequired,
};

export default compose(withTranslation(), withStyles(tasksCardStyle))(OIDCCard);
