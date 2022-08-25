import React from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core';
import { Person, Group } from '@material-ui/icons';
import Delete from '@material-ui/icons/Delete';

import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import { CustomMaterialTable, Button } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';
import DeleteConfirmDialog from '../Dialog/DeleteConfirmDialog';

class LDAPCard extends React.Component {
    state = {
        deleteLdapGroups: [],
    };
    render() {
        const {
            t,
            ldap_users,
            ldap_groups,
            onSyncGroupsLdap,
            onDeleteLdapGroups,
        } = this.props;
        return (
            <>
                {this.state.deleteLdapGroups.length > 0 && (
                    <DeleteConfirmDialog
                        title={t('DELETE_LDAP_GROUP_S')}
                        onConfirm={() => {
                            onDeleteLdapGroups(this.state.deleteLdapGroups);
                            this.setState({
                                deleteLdapGroups: [],
                            });
                        }}
                        onAbort={() => {
                            this.setState({
                                deleteLdapGroups: [],
                            });
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
                                    <Button
                                        color="info"
                                        onClick={onSyncGroupsLdap}
                                    >
                                        {t('SYNC_WITH_LDAP')}
                                    </Button>
                                    <CustomMaterialTable
                                        columns={[
                                            { field: 'dn', title: 'DN' },
                                            {
                                                field: 'domain',
                                                title: 'Domain',
                                            },
                                            {
                                                field: 'groups',
                                                title: 'Mapped Groups',
                                            },
                                        ]}
                                        data={ldap_groups}
                                        title={t('LDAP_GROUPS')}
                                        actions={[
                                            {
                                                tooltip: t('DELETE'),
                                                icon: Delete,
                                                onClick: (evt, data) => {
                                                    this.setState({
                                                        deleteLdapGroups: [
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

LDAPCard.propTypes = {
    classes: PropTypes.object.isRequired,
    ldap_users: PropTypes.array,
    sessions: PropTypes.array,
    ldap_groups: PropTypes.array,
    onDeleteLdapGroups: PropTypes.func.isRequired,
};

export default compose(withTranslation(), withStyles(tasksCardStyle))(LDAPCard);
