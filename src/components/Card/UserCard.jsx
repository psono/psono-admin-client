import React from 'react';
import { withStyles } from '@material-ui/core';
import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import { DevicesOther, Group, Delete } from '@material-ui/icons';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { CustomTable } from '../../components';

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
                        tabName: t('MEMBERSHIPS'),
                        tabIcon: Group,
                        tabContent: (
                            <CustomTable
                                title={t('MEMBERSHIPS')}
                                headerFunctions={[
                                    {
                                        title: t('DELETE_MEMBERSHIP_S'),
                                        onClick: onDeleteMemberships,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    { id: 'group_name', label: t('GROUP') },
                                    {
                                        id: 'create_date',
                                        label: t('JOINED_AT')
                                    },
                                    { id: 'accepted', label: t('ACCEPTED') },
                                    { id: 'admin', label: t('GROUP_ADMIN') }
                                ]}
                                data={memberships}
                            />
                        )
                    },
                    {
                        tabName: t('DUOS'),
                        tabIcon: Group,
                        tabContent: (
                            <CustomTable
                                title={t('DUOS')}
                                headerFunctions={[
                                    {
                                        title: t('DELETE_DUO_S'),
                                        onClick: onDeleteDuos,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    { id: 'title', label: t('TITLE') },
                                    {
                                        id: 'create_date',
                                        label: t('CREATED_AT')
                                    },
                                    { id: 'active', label: t('ACTIVE') }
                                ]}
                                data={duos}
                            />
                        )
                    },
                    {
                        tabName: t('YUBIKEYS'),
                        tabIcon: Group,
                        tabContent: (
                            <CustomTable
                                title={t('YUBIKEYS')}
                                headerFunctions={[
                                    {
                                        title: t('DELETE_YUBIKEY_S'),
                                        onClick: onDeleteYubikeyOtps,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    { id: 'title', label: t('TITLE') },
                                    {
                                        id: 'create_date',
                                        label: t('CREATED_AT')
                                    },
                                    { id: 'active', label: t('ACTIVE') }
                                ]}
                                data={yubikey_otps}
                            />
                        )
                    },
                    {
                        tabName: t('GOOGLE_AUTHS'),
                        tabIcon: Group,
                        tabContent: (
                            <CustomTable
                                title={t('GOOGLE_AUTHENTICATORS')}
                                headerFunctions={[
                                    {
                                        title: t('DELETE_GOOGLE_AUTH_S'),
                                        onClick: onDeleteGoogleAuthenticators,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    { id: 'title', label: t('TITLE') },
                                    {
                                        id: 'create_date',
                                        label: t('CREATED_AT')
                                    },
                                    { id: 'active', label: t('ACTIVE') }
                                ]}
                                data={google_authenticators}
                            />
                        )
                    },
                    {
                        tabName: t('RECOVERY_CODES'),
                        tabIcon: Group,
                        tabContent: (
                            <CustomTable
                                title={t('RECOVERY_CODES')}
                                headerFunctions={[
                                    {
                                        title: t('DELETE_RECOVERY_CODE_S'),
                                        onClick: onDeleteRecoveryCodes,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    {
                                        id: 'create_date',
                                        label: t('CREATED_AT')
                                    }
                                ]}
                                data={recovery_codes}
                            />
                        )
                    },
                    {
                        tabName: t('EMERGENCY_CODES'),
                        tabIcon: Group,
                        tabContent: (
                            <CustomTable
                                title={t('EMERGENCY_CODES')}
                                headerFunctions={[
                                    {
                                        title: t('DELETE_NOTFALL_CODE_S'),
                                        onClick: onDeleteEmergencyCodes,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    {
                                        id: 'description',
                                        label: t('DESCRIPTION')
                                    },
                                    {
                                        id: 'create_date',
                                        label: t('CREATED_AT')
                                    }
                                ]}
                                data={emergency_codes}
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
