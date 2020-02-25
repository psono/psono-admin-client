import React from 'react';
import { withStyles } from '@material-ui/core';
import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
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
    render() {
        const {
            t,
            users,
            sessions,
            groups,
            onDeleteUsers,
            onEditUser,
            onEditGroup,
            onActivate,
            onDeactivate,
            onDeleteSessions,
            onDeleteGroups,
            onCreateGroup,
            show_create_group_button
        } = this.props;
        return (
            <CustomTabs
                title={t('USER_MANAGEMENT')}
                headerColor="primary"
                tabs={[
                    {
                        tabName: t('USERS'),
                        tabIcon: Person,
                        tabContent: (
                            <CustomMaterialTable
                                columns={[
                                    { field: 'username', title: t('USERNAME') },
                                    {
                                        field: 'create_date',
                                        title: t('CREATED_AT')
                                    },
                                    { field: 'is_active', title: t('ACTIVE') },
                                    {
                                        field: 'is_email_active',
                                        title: t('EMAIL_ACTIVE')
                                    },
                                    {
                                        field: 'yubikey_2fa',
                                        title: t('YUBIKEY')
                                    },
                                    {
                                        field: 'ga_2fa',
                                        title: t('GOOGLE_AUTHENTICATOR')
                                    },
                                    {
                                        field: 'duo_2fa',
                                        title: t('DUO_AUTHENTICATION')
                                    }
                                ]}
                                data={users}
                                title={''}
                                actions={[
                                    {
                                        tooltip: t('EDIT_USER_S'),
                                        icon: Edit,
                                        onClick: (evt, data) =>
                                            onEditUser([data])
                                    },
                                    {
                                        tooltip: t('ACTIVATE_USER_S'),
                                        icon: CheckBox,
                                        onClick: (evt, data) =>
                                            onActivate([data])
                                    },
                                    {
                                        tooltip: t('DEACTIVATE_USER_S'),
                                        icon: NotInterested,
                                        onClick: (evt, data) =>
                                            onDeactivate([data])
                                    },
                                    {
                                        tooltip: t('DELETE_USER_S'),
                                        icon: Delete,
                                        onClick: (evt, data) =>
                                            onDeleteUsers([data])
                                    }
                                ]}
                            />
                        )
                    },
                    {
                        tabName: t('SESSIONS'),
                        tabIcon: DevicesOther,
                        tabContent: (
                            <CustomMaterialTable
                                columns={[
                                    { field: 'username', title: t('USERNAME') },
                                    {
                                        field: 'create_date',
                                        title: t('LOGGED_IN_AT')
                                    },
                                    {
                                        field: 'valid_till',
                                        title: t('VALID_TILL')
                                    },
                                    {
                                        field: 'device_description',
                                        title: t('DEVICE_DESCRIPTION')
                                    },
                                    {
                                        field: 'device_fingerprint',
                                        title: t('DEVICE')
                                    },
                                    { field: 'active', title: t('ACTIVE') }
                                ]}
                                data={sessions}
                                title={''}
                                actions={[
                                    {
                                        tooltip: t('DELETE_SESSION_S'),
                                        icon: Delete,
                                        onClick: (evt, data) =>
                                            onDeleteSessions([data])
                                    }
                                ]}
                            />
                        )
                    },
                    {
                        tabName: t('GROUPS'),
                        tabIcon: Group,
                        tabContent: (
                            <CustomMaterialTable
                                columns={[
                                    { field: 'name', title: t('NAME') },
                                    {
                                        field: 'create_date',
                                        title: t('CREATED_AT')
                                    },
                                    {
                                        field: 'member_count',
                                        title: t('MEMBERS')
                                    },
                                    {
                                        field: 'is_managed',
                                        title: t('MANAGED')
                                    }
                                ]}
                                data={groups}
                                title={''}
                                actions={[
                                    {
                                        tooltip: t('EDIT_GROUP'),
                                        icon: Edit,
                                        onClick: (evt, data) =>
                                            onEditGroup([data])
                                    },
                                    {
                                        tooltip: t('DELETE_GROUP_S'),
                                        icon: Delete,
                                        onClick: (evt, data) =>
                                            onDeleteGroups([data])
                                    },
                                    {
                                        tooltip: t('CREATE_GROUP'),
                                        isFreeAction: true,
                                        icon: Add,
                                        hidden: !show_create_group_button,
                                        onClick: evt => onCreateGroup()
                                    }
                                ]}
                            />
                        )
                    }
                ]}
            />
        );
    }
}

UsersCard.propTypes = {
    classes: PropTypes.object.isRequired,
    users: PropTypes.array,
    sessions: PropTypes.array,
    groups: PropTypes.array
};

export default compose(withTranslation(), withStyles(tasksCardStyle))(
    UsersCard
);
