import React from 'react';
import { useTranslation } from 'react-i18next';

import { DevicesOther, Group, Delete, Link } from '@mui/icons-material';

import CustomTabs from '../../components/CustomTabs/CustomTabs';
import { CustomMaterialTable } from '../../components';

export interface UserCardProps {
    sessions?: any;
    memberships?: any;
    duos?: any;
    yubikey_otps?: any;
    webauthns?: any;
    google_authenticators?: any;
    recovery_codes?: any;
    emergency_codes?: any;
    link_shares?: any[];
    onDeleteSessions: ((...args: any[]) => void) | null;
    onDeleteMemberships: ((...args: any[]) => void) | null;
    onDeleteDuos: ((...args: any[]) => void) | null;
    onDeleteYubikeyOtps: ((...args: any[]) => void) | null;
    onDeleteWebAuthns: ((...args: any[]) => void) | null;
    onDeleteGoogleAuthenticators: ((...args: any[]) => void) | null;
    onDeleteRecoveryCodes: ((...args: any[]) => void) | null;
    onDeleteEmergencyCodes: ((...args: any[]) => void) | null;
    onDeleteLinkShares: ((...args: any[]) => void) | null;
    onDeleteIvaltUser: ((...args: any[]) => void) | null;
    ivalts?: any;
    canReadSessions?: boolean;
    canReadMemberships?: boolean;
    canReadRecovery?: boolean;
}
const UserCard = (props: UserCardProps) => {
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
        link_shares = [],
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
        ivalts,
        canReadSessions,
        canReadMemberships,
        canReadRecovery,
    } = props;

    return (
        <CustomTabs
            title={t('USER_DETAILS')}
            headerColor="primary"
            tabs={[
                canReadSessions && {
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
                            actions={
                                onDeleteSessions
                                    ? [
                                          {
                                              tooltip: t('DELETE_SESSION_S'),
                                              icon: Delete,
                                              onClick: (evt: any, data: any) =>
                                                  onDeleteSessions([data]),
                                          },
                                      ]
                                    : []
                            }
                        />
                    ),
                },
                canReadMemberships && {
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
                            actions={
                                onDeleteMemberships
                                    ? [
                                          {
                                              tooltip: t('DELETE_MEMBERSHIP_S'),
                                              icon: Delete,
                                              onClick: (evt: any, data: any) =>
                                                  onDeleteMemberships([data]),
                                          },
                                      ]
                                    : []
                            }
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
                            actions={
                                onDeleteDuos
                                    ? [
                                          {
                                              tooltip: t('DELETE_DUO_S'),
                                              icon: Delete,
                                              onClick: (evt: any, data: any) =>
                                                  onDeleteDuos([data]),
                                          },
                                      ]
                                    : []
                            }
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
                            actions={
                                onDeleteYubikeyOtps
                                    ? [
                                          {
                                              tooltip: t('DELETE_YUBIKEY_S'),
                                              icon: Delete,
                                              onClick: (evt: any, data: any) =>
                                                  onDeleteYubikeyOtps([data]),
                                          },
                                      ]
                                    : []
                            }
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
                            actions={
                                onDeleteWebAuthns
                                    ? [
                                          {
                                              tooltip: t('DELETE_WEBAUTHN_S'),
                                              icon: Delete,
                                              onClick: (evt: any, data: any) =>
                                                  onDeleteWebAuthns([data]),
                                          },
                                      ]
                                    : []
                            }
                        />
                    ),
                },
                {
                    tabName: t('TOTPS'),
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
                            title={t('TOTPS')}
                            actions={
                                onDeleteGoogleAuthenticators
                                    ? [
                                          {
                                              tooltip: t(
                                                  'DELETE_GOOGLE_AUTH_S'
                                              ),
                                              icon: Delete,
                                              onClick: (evt: any, data: any) =>
                                                  onDeleteGoogleAuthenticators([
                                                      data,
                                                  ]),
                                          },
                                      ]
                                    : []
                            }
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
                                },
                            ]}
                            data={ivalts}
                            title={t('IVALT')}
                            actions={
                                onDeleteIvaltUser
                                    ? [
                                          {
                                              tooltip: t('DELETE_IVALT'),
                                              icon: Delete,
                                              onClick: (evt: any, data: any) =>
                                                  onDeleteIvaltUser([data]),
                                          },
                                      ]
                                    : []
                            }
                        />
                    ),
                },
                canReadRecovery && {
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
                            actions={
                                onDeleteRecoveryCodes
                                    ? [
                                          {
                                              tooltip: t(
                                                  'DELETE_RECOVERY_CODE_S'
                                              ),
                                              icon: Delete,
                                              onClick: (evt: any, data: any) =>
                                                  onDeleteRecoveryCodes([data]),
                                          },
                                      ]
                                    : []
                            }
                        />
                    ),
                },
                canReadRecovery && {
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
                            actions={
                                onDeleteEmergencyCodes
                                    ? [
                                          {
                                              tooltip: t(
                                                  'DELETE_EMERGENCY_CODE_S'
                                              ),
                                              icon: Delete,
                                              onClick: (evt: any, data: any) =>
                                                  onDeleteEmergencyCodes([
                                                      data,
                                                  ]),
                                          },
                                      ]
                                    : []
                            }
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
                            actions={
                                onDeleteLinkShares
                                    ? [
                                          {
                                              tooltip: t('DELETE_LINK_SHARE_S'),
                                              icon: Delete,
                                              onClick: (evt: any, data: any) =>
                                                  onDeleteLinkShares([data]),
                                          },
                                      ]
                                    : []
                            }
                        />
                    ),
                },
            ].filter(Boolean)}
        />
    );
};

export default UserCard;
