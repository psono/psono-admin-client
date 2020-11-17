import React from 'react';
import { withStyles } from '@material-ui/core';
import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import { Group, Delete } from '@material-ui/icons';
import PropTypes from 'prop-types';

import { CustomMaterialTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';

class GroupCard extends React.Component {
    render() {
        const {
            t,
            memberships,
            ldap_groups,
            saml_groups,
            oidc_groups,
            onDeleteMemberships
        } = this.props;

        const has_ldap_groups = ldap_groups && ldap_groups.length > 0;
        const has_saml_groups = saml_groups && saml_groups.length > 0;
        const has_oidc_groups = oidc_groups && oidc_groups.length > 0;

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
                                title: t('JOINED')
                            },
                            { field: 'accepted', title: t('ACCEPTED') },
                            { field: 'admin', title: t('GROUP_ADMIN') },
                            {
                                field: 'share_admin',
                                title: t('SHARE_ADMIN')
                            }
                        ]}
                        data={memberships}
                        title={t('USERS')}
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
            }
        ];

        if (has_ldap_groups) {
            tabs.push({
                tabName: t('LDAP_GROUPS'),
                tabIcon: Group,
                tabContent: (
                    <CustomMaterialTable
                        columns={[
                            { field: 'mapped', title: t('MAPPED') },
                            { field: 'dn', title: t('DN') },
                            {
                                field: 'has_share_admin',
                                title: t('SHARE_ADMIN')
                            },
                            { field: 'domain', title: t('DOMAIN') }
                        ]}
                        data={ldap_groups}
                        title={t('MAPPED_LDAP_GROUPS')}
                    />
                )
            });
        }

        if (has_saml_groups) {
            tabs.push({
                tabName: t('SAML_GROUPS'),
                tabIcon: Group,
                tabContent: (
                    <CustomMaterialTable
                        columns={[
                            { field: 'mapped', title: t('MAPPED') },
                            { field: 'saml_name', title: t('NAME') },
                            {
                                field: 'has_share_admin',
                                title: t('SHARE_ADMIN')
                            },
                            {
                                field: 'saml_provider_id',
                                title: t('POVIDER_ID')
                            }
                        ]}
                        data={saml_groups}
                        title={t('MAPPED_SAML_GROUPS')}
                    />
                )
            });
        }

        if (has_oidc_groups) {
            tabs.push({
                tabName: t('OIDC_GROUPS'),
                tabIcon: Group,
                tabContent: (
                    <CustomMaterialTable
                        columns={[
                            { field: 'mapped', title: t('MAPPED') },
                            { field: 'oidc_name', title: t('NAME') },
                            {
                                field: 'has_share_admin',
                                title: t('SHARE_ADMIN')
                            },
                            {
                                field: 'oidc_provider_id',
                                title: t('POVIDER_ID')
                            }
                        ]}
                        data={oidc_groups}
                        title={t('MAPPED_OIDC_GROUPS')}
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
