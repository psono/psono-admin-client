import React from 'react';
import { withStyles } from '@material-ui/core';
import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import { DevicesOther, Group, Delete } from '@material-ui/icons';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { CustomMaterialTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';

class UserCard extends React.Component {
    render() {
        const {
            t,
            sessions,
            memberships,
            duos,
            yubikey_otps,
            google_authenticators,
            recovery_codes,
            emergency_codes,
            onDeleteSessions,
            onDeleteMemberships,
            onDeleteDuos,
            onDeleteYubikeyOtps,
            onDeleteGoogleAuthenticators,
            onDeleteRecoveryCodes,
            onDeleteEmergencyCodes
        } = this.props;
        return (
            <CustomTabs
                title={t('USER_DETAILS')}
                headerColor="primary"
                tabs={[
                    {
                        tabName: t('SESSIONS'),
                        tabIcon: DevicesOther,
                        tabContent: (
                            <CustomMaterialTable
                                columns={[
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
                                title={t('SESSIONS')}
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
                        tabName: t('MEMBERSHIPS'),
                        tabIcon: Group,
                        tabContent: (
                            <CustomMaterialTable
                                columns={[
                                    { field: 'group_name', title: t('GROUP') },
                                    {
                                        field: 'create_date',
                                        title: t('JOINED_AT')
                                    },
                                    { field: 'accepted', title: t('ACCEPTED') },
                                    { field: 'admin', title: t('GROUP_ADMIN') }
                                ]}
                                data={memberships}
                                title={t('MEMBERSHIPS')}
                                actions={[
                                    {
                                        tooltip: t('DELETE_MEMBERSHIP_S'),
                                        icon: Delete,
                                        onClick: (evt, data) =>
                                            onDeleteMemberships([data])
                                    }
                                ]}
                            />
                        )
                    },
                    {
                        tabName: t('DUOS'),
                        tabIcon: Group,
                        tabContent: (
                            <CustomMaterialTable
                                columns={[
                                    { field: 'title', title: t('TITLE') },
                                    {
                                        field: 'create_date',
                                        title: t('CREATED_AT')
                                    },
                                    { field: 'active', title: t('ACTIVE') }
                                ]}
                                data={duos}
                                title={t('DUOS')}
                                actions={[
                                    {
                                        tooltip: t('DELETE_DUO_S'),
                                        icon: Delete,
                                        onClick: (evt, data) =>
                                            onDeleteDuos([data])
                                    }
                                ]}
                            />
                        )
                    },
                    {
                        tabName: t('YUBIKEYS'),
                        tabIcon: Group,
                        tabContent: (
                            <CustomMaterialTable
                                columns={[
                                    { field: 'title', title: t('TITLE') },
                                    {
                                        field: 'create_date',
                                        title: t('CREATED_AT')
                                    },
                                    { field: 'active', title: t('ACTIVE') }
                                ]}
                                data={yubikey_otps}
                                title={t('YUBIKEYS')}
                                actions={[
                                    {
                                        tooltip: t('DELETE_YUBIKEY_S'),
                                        icon: Delete,
                                        onClick: (evt, data) =>
                                            onDeleteYubikeyOtps([data])
                                    }
                                ]}
                            />
                        )
                    },
                    {
                        tabName: t('GOOGLE_AUTHS'),
                        tabIcon: Group,
                        tabContent: (
                            <CustomMaterialTable
                                columns={[
                                    { field: 'title', title: t('TITLE') },
                                    {
                                        field: 'create_date',
                                        title: t('CREATED_AT')
                                    },
                                    { field: 'active', title: t('ACTIVE') }
                                ]}
                                data={google_authenticators}
                                title={t('GOOGLE_AUTHENTICATORS')}
                                actions={[
                                    {
                                        tooltip: t('DELETE_GOOGLE_AUTH_S'),
                                        icon: Delete,
                                        onClick: (evt, data) =>
                                            onDeleteGoogleAuthenticators([data])
                                    }
                                ]}
                            />
                        )
                    },
                    {
                        tabName: t('RECOVERY_CODES'),
                        tabIcon: Group,
                        tabContent: (
                            <CustomMaterialTable
                                columns={[
                                    {
                                        field: 'create_date',
                                        title: t('CREATED_AT')
                                    }
                                ]}
                                data={recovery_codes}
                                title={t('RECOVERY_CODES')}
                                actions={[
                                    {
                                        tooltip: t('DELETE_RECOVERY_CODE_S'),
                                        icon: Delete,
                                        onClick: (evt, data) =>
                                            onDeleteRecoveryCodes([data])
                                    }
                                ]}
                            />
                        )
                    },
                    {
                        tabName: t('EMERGENCY_CODES'),
                        tabIcon: Group,
                        tabContent: (
                            <CustomMaterialTable
                                columns={[
                                    {
                                        field: 'description',
                                        title: t('DESCRIPTION')
                                    },
                                    {
                                        field: 'create_date',
                                        title: t('CREATED_AT')
                                    }
                                ]}
                                data={emergency_codes}
                                title={t('EMERGENCY_CODES')}
                                actions={[
                                    {
                                        tooltip: t('DELETE_NOTFALL_CODE_S'),
                                        icon: Delete,
                                        onClick: (evt, data) =>
                                            onDeleteEmergencyCodes([data])
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

UserCard.propTypes = {
    classes: PropTypes.object.isRequired,
    sessions: PropTypes.array,
    groups: PropTypes.array
};

export default compose(withTranslation(), withStyles(tasksCardStyle))(UserCard);
