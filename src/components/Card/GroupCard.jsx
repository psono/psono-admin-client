import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { Group, Delete } from '@material-ui/icons';

import { CustomMaterialTable } from '../../components';
import CustomTabs from '../../components/CustomTabs/CustomTabs.js';

const GroupCard = ({
    memberships,
    shareRights,
    ldapGroups,
    samlGroups,
    scimGroups,
    oidcGroups,
    onDeleteMemberships,
    onDeleteGroupShareRights,
}) => {
    const { t } = useTranslation();

    const hasLdapGroups = ldapGroups && ldapGroups.length > 0;
    const hasSamlGroups = samlGroups && samlGroups.length > 0;
    const hasScimGroups = scimGroups && scimGroups.length > 0;
    const hasOidcGroups = oidcGroups && oidcGroups.length > 0;

    const tabs = [
        {
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
                    actions={[
                        {
                            tooltip: t('DELETE_MEMBERSHIP_S'),
                            icon: Delete,
                            onClick: (evt, data) => onDeleteMemberships([data]),
                        },
                    ]}
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
                    actions={[
                        {
                            tooltip: t('DELETE_SHARE_RIGHT_S'),
                            icon: Delete,
                            onClick: (evt, data) =>
                                onDeleteGroupShareRights([data]),
                        },
                    ]}
                />
            ),
        },
    ];

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
                            customSort: (a, b) => {
                                return a.mapped_raw - b.mapped_raw;
                            },
                        },
                        { field: 'dn', title: t('DN') },
                        {
                            field: 'has_share_admin',
                            title: t('SHARE_ADMIN'),
                            customSort: (a, b) =>
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
                            customSort: (a, b) => a.mapped_raw - b.mapped_raw,
                        },
                        { field: 'name', title: t('NAME') },
                        {
                            field: 'has_share_admin',
                            title: t('SHARE_ADMIN'),
                            customSort: (a, b) =>
                                a.has_share_admin_raw - b.has_share_admin_raw,
                        },
                        {
                            field: 'saml_provider_id',
                            title: t('POVIDER_ID'),
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
                            customSort: (a, b) => a.mapped_raw - b.mapped_raw,
                        },
                        { field: 'name', title: t('NAME') },
                        {
                            field: 'has_share_admin',
                            title: t('SHARE_ADMIN'),
                            customSort: (a, b) =>
                                a.has_share_admin_raw - b.has_share_admin_raw,
                        },
                        {
                            field: 'scim_provider_id',
                            title: t('POVIDER_ID'),
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
                            customSort: (a, b) => a.mapped_raw - b.mapped_raw,
                        },
                        { field: 'name', title: t('NAME') },
                        {
                            field: 'has_share_admin',
                            title: t('SHARE_ADMIN'),
                            customSort: (a, b) =>
                                a.has_share_admin_raw - b.has_share_admin_raw,
                        },
                        {
                            field: 'oidc_provider_id',
                            title: t('POVIDER_ID'),
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

GroupCard.propTypes = {
    sessions: PropTypes.array,
    groups: PropTypes.array,
};

export default GroupCard;
