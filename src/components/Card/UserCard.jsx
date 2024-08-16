import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { DevicesOther, Group, Delete, Link } from '@material-ui/icons';

import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import { CustomMaterialTable } from '../../components';

const UserCard = (props) => {
    const { t } = useTranslation();
    const {
        sessions,
        memberships,
        duos,
        yubikey_otps,
        webauthns,
        google_authenticators,
        recovery_codes,
        emergency_codes,
        link_shares,
        onDeleteSessions,
        onDeleteMemberships,
        onDeleteDuos,
        onDeleteYubikeyOtps,
        onDeleteWebAuthns,
        onDeleteGoogleAuthenticators,
        onDeleteRecoveryCodes,
        onDeleteEmergencyCodes,
        onDeleteLinkShares,
        onDeleteIvaltUser,
        ivalts
    } = props;

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
                                { field: 'active', title: t('STILL_ACTIVE') },
                            ]}
                            data={sessions}
                            title={t('SESSIONS')}
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
                    tabName: t('MEMBERSHIPS'),
                    tabIcon: Group,
                    tabContent: (
                        <CustomMaterialTable
                            columns={[
                                { field: 'group_name', title: t('GROUP') },
                                {
                                    field: 'create_date',
                                    title: t('JOINED_AT'),
                                },
                                { field: 'accepted', title: t('ACCEPTED') },
                                { field: 'admin', title: t('GROUP_ADMIN') },
                                {
                                    field: 'share_admin',
                                    title: t('SHARE_ADMIN'),
                                },
                            ]}
                            data={memberships}
                            title={t('MEMBERSHIPS')}
                            actions={[
                                {
                                    tooltip: t('DELETE_MEMBERSHIP_S'),
                                    icon: Delete,
                                    onClick: (evt, data) =>
                                        onDeleteMemberships([data]),
                                },
                            ]}
                        />
                    ),
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
                                    title: t('CREATED_AT'),
                                },
                                { field: 'active', title: t('ACTIVE') },
                            ]}
                            data={duos}
                            title={t('DUOS')}
                            actions={[
                                {
                                    tooltip: t('DELETE_DUO_S'),
                                    icon: Delete,
                                    onClick: (evt, data) =>
                                        onDeleteDuos([data]),
                                },
                            ]}
                        />
                    ),
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
                                    title: t('CREATED_AT'),
                                },
                                { field: 'active', title: t('ACTIVE') },
                            ]}
                            data={yubikey_otps}
                            title={t('YUBIKEYS')}
                            actions={[
                                {
                                    tooltip: t('DELETE_YUBIKEY_S'),
                                    icon: Delete,
                                    onClick: (evt, data) =>
                                        onDeleteYubikeyOtps([data]),
                                },
                            ]}
                        />
                    ),
                },
                {
                    tabName: t('WEBAUTHNS'),
                    tabIcon: Group,
                    tabContent: (
                        <CustomMaterialTable
                            columns={[
                                { field: 'title', title: t('TITLE') },
                                {
                                    field: 'create_date',
                                    title: t('CREATED_AT'),
                                },
                                { field: 'active', title: t('ACTIVE') },
                            ]}
                            data={webauthns}
                            title={t('WEBAUTHNS')}
                            actions={[
                                {
                                    tooltip: t('DELETE_WEBAUTHN_S'),
                                    icon: Delete,
                                    onClick: (evt, data) =>
                                        onDeleteWebAuthns([data]),
                                },
                            ]}
                        />
                    ),
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
                                    title: t('CREATED_AT'),
                                },
                                { field: 'active', title: t('ACTIVE') },
                            ]}
                            data={google_authenticators}
                            title={t('GOOGLE_AUTHENTICATORS')}
                            actions={[
                                {
                                    tooltip: t('DELETE_GOOGLE_AUTH_S'),
                                    icon: Delete,
                                    onClick: (evt, data) =>
                                        onDeleteGoogleAuthenticators([data]),
                                },
                            ]}
                        />
                    ),
                },
                {
                    tabName: t('IVALT'),
                    tabIcon: Group,
                    tabContent: (
                        <CustomMaterialTable
                            columns={[
                                {
                                    field: 'mobile',
                                    title: t('MOBILE'),
                                },
                                {
                                    field: 'active',
                                    title: t('ACTIVE'),
                                },
                                {
                                    field: 'create_date',
                                    title: t('CREATED_AT'),
                                }
                            ]}
                            data={ivalts}
                            title={t('IVALT')}
                            actions={[
                                {
                                    tooltip: t('DELETE_IVALT'),
                                    icon: Delete,
                                    onClick: (evt, data) =>
                                        onDeleteIvaltUser([data]),
                                },
                            ]}
                        />
                    ),
                },
                {
                    tabName: t('RECOVERY_CODES'),
                    tabIcon: Group,
                    tabContent: (
                        <CustomMaterialTable
                            columns={[
                                {
                                    field: 'create_date',
                                    title: t('CREATED_AT'),
                                },
                            ]}
                            data={recovery_codes}
                            title={t('RECOVERY_CODES')}
                            actions={[
                                {
                                    tooltip: t('DELETE_RECOVERY_CODE_S'),
                                    icon: Delete,
                                    onClick: (evt, data) =>
                                        onDeleteRecoveryCodes([data]),
                                },
                            ]}
                        />
                    ),
                },
                {
                    tabName: t('EMERGENCY_CODES'),
                    tabIcon: Group,
                    tabContent: (
                        <CustomMaterialTable
                            columns={[
                                {
                                    field: 'description',
                                    title: t('DESCRIPTION'),
                                },
                                {
                                    field: 'create_date',
                                    title: t('CREATED_AT'),
                                },
                            ]}
                            data={emergency_codes}
                            title={t('EMERGENCY_CODES')}
                            actions={[
                                {
                                    tooltip: t('DELETE_EMERGENCY_CODE_S'),
                                    icon: Delete,
                                    onClick: (evt, data) =>
                                        onDeleteEmergencyCodes([data]),
                                },
                            ]}
                        />
                    ),
                },
                {
                    tabName: t('LINK_SHARES'),
                    tabIcon: Link,
                    tabContent: (
                        <CustomMaterialTable
                            columns={[
                                {
                                    field: 'public_title',
                                    title: t('TITLE'),
                                },
                                {
                                    field: 'valid_till',
                                    title: t('VALID_TILL'),
                                },
                                {
                                    field: 'allowed_reads',
                                    title: t('ALLOWED_USAGE'),
                                },
                                {
                                    field: 'has_passphrase',
                                    title: t('PASSPHRASE'),
                                },
                                {
                                    field: 'create_date',
                                    title: t('CREATED_AT'),
                                },
                            ]}
                            data={link_shares}
                            title={t('LINK_SHARES')}
                            actions={[
                                {
                                    tooltip: t('DELETE_LINK_SHARE_S'),
                                    icon: Delete,
                                    onClick: (evt, data) =>
                                        onDeleteLinkShares([data]),
                                },
                            ]}
                        />
                    ),
                },
            ]}
        />
    );
};

UserCard.propTypes = {
    sessions: PropTypes.array,
    groups: PropTypes.array,
};

export default UserCard;
