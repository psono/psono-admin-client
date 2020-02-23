import React from 'react';
import { withStyles } from '@material-ui/core';
import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
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

import { CustomTable, Button } from '../../components';

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
                            <CustomTable
                                title={t('USERS')}
                                headerFunctions={[
                                    {
                                        title: t('EDIT_USER_S'),
                                        onClick: onEditUser,
                                        icon: <Edit />,
                                        max_selected: 1
                                    },
                                    {
                                        title: t('ACTIVATE_USER_S'),
                                        onClick: onActivate,
                                        icon: <CheckBox />
                                    },
                                    {
                                        title: t('DEACTIVATE_USER_S'),
                                        onClick: onDeactivate,
                                        icon: <NotInterested />
                                    },
                                    {
                                        title: t('DELETE_USER_S'),
                                        onClick: onDeleteUsers,
                                        icon: <Delete />
                                    }
                                ]}
                                onDelete={onDeleteUsers}
                                head={[
                                    { id: 'username', label: t('USERNAME') },
                                    {
                                        id: 'create_date',
                                        label: t('CREATED_AT')
                                    },
                                    { id: 'is_active', label: t('ACTIVE') },
                                    {
                                        id: 'is_email_active',
                                        label: t('EMAIL_ACTIVE')
                                    },
                                    { id: 'yubikey_2fa', label: t('YUBIKEY') },
                                    {
                                        id: 'ga_2fa',
                                        label: t('GOOGLE_AUTHENTICATOR')
                                    },
                                    {
                                        id: 'duo_2fa',
                                        label: t('DUO_AUTHENTICATION')
                                    }
                                ]}
                                data={users}
                            />
                        )
                    },
                    {
                        tabName: t('SESSIONS'),
                        tabIcon: DevicesOther,
                        tabContent: (
                            <CustomTable
                                title={t('SESSIONS')}
                                headerFunctions={[
                                    {
                                        title: t('DELETE_SESSION_S'),
                                        onClick: onDeleteSessions,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    { id: 'username', label: t('USERNAME') },
                                    {
                                        id: 'create_date',
                                        label: t('LOGGED_IN_AT')
                                    },
                                    {
                                        id: 'valid_till',
                                        label: t('VALID_TILL')
                                    },
                                    {
                                        id: 'device_description',
                                        label: t('DEVICE_DESCRIPTION')
                                    },
                                    {
                                        id: 'device_fingerprint',
                                        label: t('DEVICE')
                                    },
                                    { id: 'active', label: t('ACTIVE') }
                                ]}
                                data={sessions}
                            />
                        )
                    },
                    {
                        tabName: t('GROUPS'),
                        tabIcon: Group,
                        tabContent: (
                            <div>
                                {show_create_group_button ? (
                                    <Button
                                        color="primary"
                                        onClick={() => {
                                            onCreateGroup();
                                        }}
                                    >
                                        {t('CREATE_GROUP')}
                                    </Button>
                                ) : null}
                                <CustomTable
                                    title={t('GROUPS')}
                                    headerFunctions={[
                                        {
                                            title: t('EDIT_GROUP'),
                                            onClick: onEditGroup,
                                            icon: <Edit />,
                                            max_selected: 1
                                        },
                                        {
                                            title: t('DELETE_GROUP_S'),
                                            onClick: onDeleteGroups,
                                            icon: <Delete />
                                        }
                                    ]}
                                    head={[
                                        { id: 'name', label: t('NAME') },
                                        {
                                            id: 'create_date',
                                            label: t('CREATED_AT')
                                        },
                                        {
                                            id: 'member_count',
                                            label: t('MEMBERS')
                                        },
                                        {
                                            id: 'is_managed',
                                            label: t('MANAGED')
                                        }
                                    ]}
                                    data={groups}
                                />
                            </div>
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
