import React from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core';
import { Group } from '@material-ui/icons';
import Delete from '@material-ui/icons/Delete';

import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import { Button, CustomMaterialTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';
import DeleteConfirmDialog from '../Dialog/DeleteConfirmDialog';

class SAMLCard extends React.Component {
    state = {
        deleteSamlGroups: [],
    };
    render() {
        const { t, saml_groups, onSyncGroupsSaml, onDeleteSamlGroups } =
            this.props;
        return (
            <>
                {this.state.deleteSamlGroups.length > 0 && (
                    <DeleteConfirmDialog
                        title={t('DELETE_SAML_GROUP_S')}
                        onConfirm={() => {
                            onDeleteSamlGroups(this.state.deleteSamlGroups);
                            this.setState({
                                deleteSamlGroups: [],
                            });
                        }}
                        onAbort={() => {
                            this.setState({
                                deleteSamlGroups: [],
                            });
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
                                    <Button
                                        color="info"
                                        onClick={onSyncGroupsSaml}
                                    >
                                        {t('SYNC_WITH_SAML_IDP')}
                                    </Button>
                                    <CustomMaterialTable
                                        columns={[
                                            { field: 'name', title: t('NAME') },
                                            {
                                                field: 'saml_provider_id',
                                                title: t('PROVIDER_ID'),
                                            },
                                            {
                                                field: 'groups',
                                                title: t('MAPPED_GROUPS'),
                                            },
                                        ]}
                                        data={saml_groups}
                                        title={t('SAML_GROUPS')}
                                        actions={[
                                            {
                                                tooltip: t('DELETE'),
                                                icon: Delete,
                                                onClick: (evt, data) => {
                                                    this.setState({
                                                        deleteSamlGroups: [
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

SAMLCard.propTypes = {
    classes: PropTypes.object.isRequired,
    sessions: PropTypes.array,
    saml_groups: PropTypes.array,
    onSyncGroupsSaml: PropTypes.func.isRequired,
    onDeleteSamlGroups: PropTypes.func.isRequired,
};

export default compose(withTranslation(), withStyles(tasksCardStyle))(SAMLCard);
