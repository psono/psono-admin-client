import React from 'react';
import { withStyles } from '@material-ui/core';
import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import { Person, Group } from '@material-ui/icons';
import PropTypes from 'prop-types';

import { CustomTable, Button } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';

class LDAPCard extends React.Component {
    render() {
        const { t, ldap_users, ldap_groups, onSyncGroupsLdap } = this.props;
        return (
            <CustomTabs
                title={t('LDAP_MANAGEMENT')}
                headerColor="primary"
                tabs={[
                    {
                        tabName: t('USERS'),
                        tabIcon: Person,
                        tabContent: (
                            <CustomTable
                                title="LDAP Users"
                                headerFunctions={[]}
                                head={[
                                    { id: 'username', label: t('USERNAME') },
                                    {
                                        id: 'create_date',
                                        label: t('IMPORTED')
                                    },
                                    { id: 'email', label: t('EMAIL') },
                                    { id: 'dn', label: t('DN') }
                                ]}
                                data={ldap_users}
                            />
                        )
                    },
                    {
                        tabName: t('GROUPS'),
                        tabIcon: Group,
                        tabContent: (
                            <div>
                                <Button
                                    color="info"
                                    onClick={() => {
                                        onSyncGroupsLdap();
                                    }}
                                >
                                    {t('SYNC_WITH_LDAP')}
                                </Button>
                                <CustomTable
                                    title={t('LDAP_GROUPS')}
                                    headerFunctions={[]}
                                    head={[
                                        { id: 'dn', label: 'DN' },
                                        { id: 'domain', label: 'Domain' },
                                        { id: 'groups', label: 'Mapped Groups' }
                                    ]}
                                    data={ldap_groups}
                                />
                            </div>
                        )
                    }
                ]}
            />
        );
    }
}

LDAPCard.propTypes = {
    classes: PropTypes.object.isRequired,
    ldap_users: PropTypes.array,
    sessions: PropTypes.array,
    ldap_groups: PropTypes.array
};

export default compose(withTranslation(), withStyles(tasksCardStyle))(LDAPCard);
