import React from 'react';
import { withStyles } from '@material-ui/core';
import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import { Group, Delete } from '@material-ui/icons';
import PropTypes from 'prop-types';

import { CustomTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';

class GroupCard extends React.Component {
    render() {
        const {
            t,
            memberships,
            ldap_groups,
            saml_groups,
            onDeleteMemberships
        } = this.props;

        const has_ldap_groups = ldap_groups && ldap_groups.length > 0;
        const has_saml_groups = saml_groups && saml_groups.length > 0;

        const tabs = [
            {
                tabName: t('MEMBERSHIPS'),
                tabIcon: Group,
                tabContent: (
                    <CustomTable
                        title={t('USERS')}
                        headerFunctions={[
                            {
                                title: t('DELETE_MEMBERSHIP_S'),
                                onClick: onDeleteMemberships,
                                icon: <Delete />
                            }
                        ]}
                        head={[
                            { id: 'username', label: t('USERNAME') },
                            {
                                id: 'create_date',
                                label: t('JOINED')
                            },
                            { id: 'accepted', label: t('ACCEPTED') },
                            { id: 'admin', label: t('GROUP_ADMIN') },
                            {
                                id: 'share_admin',
                                label: t('SHARE_ADMIN')
                            }
                        ]}
                        data={memberships}
                    />
                )
            }
        ];

        if (has_ldap_groups) {
            tabs.push({
                tabName: t('LDAP_GROUPS'),
                tabIcon: Group,
                tabContent: (
                    <CustomTable
                        title={t('MAPPED_LDAP_GROUPS')}
                        head={[
                            { id: 'mapped', label: t('MAPPED') },
                            { id: 'dn', label: t('DN') },
                            {
                                id: 'has_share_admin',
                                label: t('SHARE_ADMIN')
                            },
                            { id: 'domain', label: t('DOMAIN') }
                        ]}
                        data={ldap_groups}
                    />
                )
            });
        }

        if (has_saml_groups) {
            tabs.push({
                tabName: t('SAML_GROUPS'),
                tabIcon: Group,
                tabContent: (
                    <CustomTable
                        title={t('MAPPED_SAML_GROUPS')}
                        head={[
                            { id: 'mapped', label: t('MAPPED') },
                            { id: 'saml_name', label: t('NAME') },
                            {
                                id: 'has_share_admin',
                                label: t('SHARE_ADMIN')
                            },
                            {
                                id: 'saml_provider_id',
                                label: t('POVIDER_ID')
                            }
                        ]}
                        data={saml_groups}
                    />
                )
            });
        }

        return (
            <CustomTabs
                title={t('GROUP_DETAILS')}
                headerColor="primary"
                tabs={tabs}
            />
        );
    }
}

GroupCard.propTypes = {
    classes: PropTypes.object.isRequired,
    sessions: PropTypes.array,
    groups: PropTypes.array
};

export default compose(withTranslation(), withStyles(tasksCardStyle))(
    GroupCard
);
