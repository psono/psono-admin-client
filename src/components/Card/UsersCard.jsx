import React from 'react';
import { withStyles } from '@material-ui/core';
import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import DeleteConfirmDialog from '../../components/Dialog/DeleteConfirmDialog.js';
import Add from '@material-ui/icons/Add';
import Person from '@material-ui/icons/Person';
import DevicesOther from '@material-ui/icons/DevicesOther';
import Group from '@material-ui/icons/Group';
import Delete from '@material-ui/icons/Delete';
import NotInterested from '@material-ui/icons/NotInterested';
import CheckBox from '@material-ui/icons/CheckBox';
import Edit from '@material-ui/icons/Edit';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { CustomMaterialTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';

class UsersCard extends React.Component {
    state = {
        deleteUsers: [],
        deleteGroups: [],
    };

    render() {
        const {
            t,
            loadUsers,
            loadSessions,
            loadGroups,
            onDeleteUsers,
            onEditUser,
            onEditGroup,
            onActivate,
            onDeactivate,
            onDeleteSessions,
            onDeleteGroups,
            onCreateGroup,
            onCreateUser,
            show_create_group_button,
        } = this.props;
        return (
            <div>
                {this.state.deleteUsers.length > 0 && (
                    <DeleteConfirmDialog
                        title={t('DELETE_USER_S')}
                        onConfirm={() => {
                            onDeleteUsers(this.state.deleteUsers);
                            this.setState({
                                deleteUsers: [],
                            });
                        }}
                        onAbort={() => {
                            this.setState({
                                deleteUsers: [],
                            });
                        }}
                    >
                        {t('DELETE_USER_CONFIRM_DIALOG')}
                    </DeleteConfirmDialog>
                )}
                {this.state.deleteGroups.length > 0 && (
                    <DeleteConfirmDialog
                        title={t('DELETE_GROUP_S')}
                        onConfirm={() => {
                            onDeleteGroups(this.state.deleteGroups);
                            this.setState({
                                deleteGroups: [],
                            });
                        }}
                        onAbort={() => {
                            this.setState({
                                deleteGroups: [],
                            });
                        }}
                    >
                        {t('DELETE_GROUP_CONFIRM_DIALOG')}
                    </DeleteConfirmDialog>
                )}
                <CustomTabs
                    title={t('USER_MANAGEMENT')}
                    headerColor="primary"
                    tabs={[
                        {
                            tabName: t('USERS'),
                            tabIcon: Person,
                            tabContent: (
                                <CustomMaterialTable
                                    tableRef={this.props.userTableRef}
                                    columns={[
                                        {
                                            field: 'username',
                                            title: t('USERNAME'),
                                        },
                                        {
                                            field: 'create_date',
                                            title: t('CREATED_AT'),
                                        },
                                        {
                                            field: 'last_login',
                                            title: t('LAST_LOGIN'),
                                        },
                                        {
                                            field: 'is_active',
                                            title: t('ACTIVE'),
                                        },
                                        {
                                            field: 'is_email_active',
                                            title: t('EMAIL_ACTIVE'),
                                        },
                                        {
                                            field: 'yubikey_otp_enabled',
                                            title: t('YUBIKEY'),
                                        },
                                        {
                                            field: 'google_authenticator_enabled',
                                            title: t('GOOGLE_AUTHENTICATOR'),
                                        },
                                        {
                                            field: 'duo_enabled',
                                            title: t('DUO_AUTHENTICATION'),
                                        },
                                        {
                                            field: 'webauthn_enabled',
                                            title: t('WEBAUTHN'),
                                        },
                                    ]}
                                    data={loadUsers}
                                    title={''}
                                    actions={[
                                        {
                                            tooltip: t('EDIT_USER_S'),
                                            icon: Edit,
                                            onClick: (evt, data) =>
                                                onEditUser([data]),
                                        },
                                        {
                                            tooltip: t('ACTIVATE_USER_S'),
                                            icon: CheckBox,
                                            onClick: (evt, data) =>
                                                onActivate([data]),
                                        },
                                        {
                                            tooltip: t('DEACTIVATE_USER_S'),
                                            icon: NotInterested,
                                            onClick: (evt, data) =>
                                                onDeactivate([data]),
                                        },
                                        {
                                            tooltip: t('DELETE_USER_S'),
                                            icon: Delete,
                                            onClick: (evt, data) => {
                                                this.setState({
                                                    deleteUsers: [data],
                                                });
                                            },
                                        },
                                        {
                                            tooltip: t('CREATE_USER'),
                                            isFreeAction: true,
                                            icon: Add,
                                            onClick: (evt) => onCreateUser(),
                                        },
                                    ]}
                                />
                            ),
                        },
                        {
                            tabName: t('SESSIONS'),
                            tabIcon: DevicesOther,
                            tabContent: (
                                <CustomMaterialTable
                                    tableRef={this.props.sessionTableRef}
                                    columns={[
                                        {
                                            field: 'username',
                                            title: t('USERNAME'),
                                        },
                                        {
                                            field: 'create_date',
                                            title: t('LOGGED_IN_AT'),
                                        },
                                        {
                                            field: 'valid_till',
                                            title: t('VALID_TILL'),
                                        },
                                        {
                                            field: 'device_description',
                                            title: t('DEVICE_DESCRIPTION'),
                                        },
                                        {
                                            field: 'device_fingerprint',
                                            title: t('DEVICE'),
                                        },
                                        {
                                            field: 'completely_activated',
                                            title: t('ACTIVATED'),
                                        },
                                        {
                                            field: 'active',
                                            title: t('STILL_ACTIVE'),
                                        },
                                    ]}
                                    data={loadSessions}
                                    title={''}
                                    actions={[
                                        {
                                            tooltip: t('DELETE_SESSION_S'),
                                            icon: Delete,
                                            onClick: (evt, data) =>
                                                onDeleteSessions([data]),
                                        },
                                    ]}
                                />
                            ),
                        },
                        {
                            tabName: t('GROUPS'),
                            tabIcon: Group,
                            tabContent: (
                                <CustomMaterialTable
                                    tableRef={this.props.groupTableRef}
                                    columns={[
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
                                                this.setState({
                                                    deleteGroups: [data],
                                                });
                                            },
                                        },
                                        {
                                            tooltip: t('CREATE_GROUP'),
                                            isFreeAction: true,
                                            icon: Add,
                                            hidden: !show_create_group_button,
                                            onClick: (evt) => onCreateGroup(),
                                        },
                                    ]}
                                />
                            ),
                        },
                    ]}
                />
            </div>
        );
    }
}

UsersCard.propTypes = {
    classes: PropTypes.object.isRequired,
    loadUsers: PropTypes.func,
    loadSessions: PropTypes.func,
    loadGroups: PropTypes.func,
    userTableRef: PropTypes.object,
    groupTableRef: PropTypes.object,
    sessionTableRef: PropTypes.object,
};

export default compose(
    withTranslation(),
    withStyles(tasksCardStyle)
)(UsersCard);
