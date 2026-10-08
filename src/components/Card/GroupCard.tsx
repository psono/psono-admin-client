import React from 'react';
import { useTranslation } from 'react-i18next';

import { Group, Delete } from '@mui/icons-material';

import { CustomMaterialTable } from '../../components';
import CustomTabs from '../../components/CustomTabs/CustomTabs';
import Add from '@mui/icons-material/Add';

export interface GroupCardProps {
    memberships?: any;
    shareRights?: any;
    ldapGroups?: any;
    samlGroups?: any;
    scimGroups?: any;
    oidcGroups?: any;
    onDeleteMemberships: (...args: any[]) => any;
    onDeleteGroupShareRights: (...args: any[]) => any;
    onCreateGroupShareRight: (...args: any[]) => any;
    hasGroupUserSecret?: any;
    canManageMemberships?: boolean;
    canReadMemberships?: boolean;
    canManageShares?: boolean;
}
const GroupCard = ({
    memberships,
    shareRights,
    ldapGroups,
    samlGroups,
    scimGroups,
    oidcGroups,
    onDeleteMemberships,
    onDeleteGroupShareRights,
    onCreateGroupShareRight,
    hasGroupUserSecret,
    canManageMemberships,
    canReadMemberships,
    canManageShares,
}: GroupCardProps) => {
    const { t } = useTranslation();

    const hasLdapGroups = ldapGroups && ldapGroups.length > 0;
    const hasSamlGroups = samlGroups && samlGroups.length > 0;
    const hasScimGroups = scimGroups && scimGroups.length > 0;
    const hasOidcGroups = oidcGroups && oidcGroups.length > 0;

    const tabs = [
        canReadMemberships && {
            tabName: t('MEMBERSHIPS'),
            tabIcon: Group,
            tabContent: (
                <CustomMaterialTable
                    columns={[
                        { field: 'username', title: t('USERNAME') },
                        {
                            field: 'create_date',
                            title: t('JOINED'),
                        },
                        { field: 'accepted', title: t('ACCEPTED') },
                        { field: 'admin', title: t('GROUP_ADMIN') },
                        {
                            field: 'share_admin',
                            title: t('SHARE_ADMIN'),
                        },
                    ]}
                    data={memberships}
                    title={t('USERS')}
                    actions={
                        canManageMemberships
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
            tabName: t('SHARE_RIGHTS'),
            tabIcon: Group,
            tabContent: (
                <CustomMaterialTable
                    columns={[
                        { field: 'share_id', title: t('SHARE_ID') },
                        {
                            field: 'share_title',
                            title: t('TITLE'),
                            hidden: !shareRights.some(
                                (shareRight: any) => shareRight.share_title
                            ),
                        },
                        {
                            field: 'share_type',
                            title: t('TYPE'),
                            hidden: !shareRights.some(
                                (shareRight: any) => shareRight.share_title
                            ),
                        },
                        {
                            field: 'create_date',
                            title: t('SHARE_DATE'),
                        },
                        { field: 'read', title: t('READ') },
                        { field: 'write', title: t('WRITE') },
                        {
                            field: 'grant',
                            title: t('ADMIN'),
                        },
                    ]}
                    data={shareRights}
                    title={t('SHARES')}
                    actions={
                        canManageShares
                            ? [
                                  {
                                      tooltip: t('DELETE_SHARE_RIGHT_S'),
                                      icon: Delete,
                                      onClick: (evt: any, data: any) =>
                                          onDeleteGroupShareRights([data]),
                                  },
                                  {
                                      tooltip: t('CREATE_SHARE_RIGHT'),
                                      isFreeAction: true,
                                      icon: Add,
                                      hidden: !hasGroupUserSecret,
                                      onClick: (evt: any) =>
                                          onCreateGroupShareRight(),
                                  },
                              ]
                            : []
                    }
                />
            ),
        },
    ].filter(Boolean);

    if (hasLdapGroups) {
        tabs.push({
            tabName: t('LDAP_GROUPS'),
            tabIcon: Group,
            tabContent: (
                <CustomMaterialTable
                    columns={[
                        {
                            field: 'mapped',
                            title: t('MAPPED'),
                            customSort: (a: any, b: any) => {
                                return a.mapped_raw - b.mapped_raw;
                            },
                        },
                        { field: 'dn', title: t('DN') },
                        {
                            field: 'has_share_admin',
                            title: t('SHARE_ADMIN'),
                            customSort: (a: any, b: any) =>
                                a.has_share_admin_raw - b.has_share_admin_raw,
                        },
                        { field: 'domain', title: t('DOMAIN') },
                    ]}
                    data={ldapGroups}
                    title={t('MAPPED_LDAP_GROUPS')}
                />
            ),
        });
    }

    if (hasSamlGroups) {
        tabs.push({
            tabName: t('SAML_GROUPS'),
            tabIcon: Group,
            tabContent: (
                <CustomMaterialTable
                    columns={[
                        {
                            field: 'mapped',
                            title: t('MAPPED'),
                            customSort: (a: any, b: any) =>
                                a.mapped_raw - b.mapped_raw,
                        },
                        { field: 'name', title: t('NAME') },
                        {
                            field: 'has_share_admin',
                            title: t('SHARE_ADMIN'),
                            customSort: (a: any, b: any) =>
                                a.has_share_admin_raw - b.has_share_admin_raw,
                        },
                        {
                            field: 'saml_provider_id',
                            title: t('PROVIDER_ID'),
                        },
                    ]}
                    data={samlGroups}
                    title={t('MAPPED_SAML_GROUPS')}
                />
            ),
        });
    }

    if (hasScimGroups) {
        tabs.push({
            tabName: t('SCIM_GROUPS'),
            tabIcon: Group,
            tabContent: (
                <CustomMaterialTable
                    columns={[
                        {
                            field: 'mapped',
                            title: t('MAPPED'),
                            customSort: (a: any, b: any) =>
                                a.mapped_raw - b.mapped_raw,
                        },
                        { field: 'name', title: t('NAME') },
                        {
                            field: 'has_share_admin',
                            title: t('SHARE_ADMIN'),
                            customSort: (a: any, b: any) =>
                                a.has_share_admin_raw - b.has_share_admin_raw,
                        },
                        {
                            field: 'scim_provider_id',
                            title: t('PROVIDER_ID'),
                        },
                    ]}
                    data={scimGroups}
                    title={t('MAPPED_SCIM_GROUPS')}
                />
            ),
        });
    }

    if (hasOidcGroups) {
        tabs.push({
            tabName: t('OIDC_GROUPS'),
            tabIcon: Group,
            tabContent: (
                <CustomMaterialTable
                    columns={[
                        {
                            field: 'mapped',
                            title: t('MAPPED'),
                            customSort: (a: any, b: any) =>
                                a.mapped_raw - b.mapped_raw,
                        },
                        { field: 'name', title: t('NAME') },
                        {
                            field: 'has_share_admin',
                            title: t('SHARE_ADMIN'),
                            customSort: (a: any, b: any) =>
                                a.has_share_admin_raw - b.has_share_admin_raw,
                        },
                        {
                            field: 'oidc_provider_id',
                            title: t('PROVIDER_ID'),
                        },
                    ]}
                    data={oidcGroups}
                    title={t('MAPPED_OIDC_GROUPS')}
                />
            ),
        });
    }

    return (
        <CustomTabs
            title={t('GROUP_DETAILS')}
            headerColor="primary"
            tabs={tabs}
        />
    );
};

export default GroupCard;
