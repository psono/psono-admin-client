import React from 'react';
import { withStyles } from '@material-ui/core';
import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import { Group } from '@material-ui/icons';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { CustomTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';

class SAMLCard extends React.Component {
    render() {
        const { t, saml_groups } = this.props;
        return (
            <CustomTabs
                title={t('LDAP_MANAGEMENT')}
                headerColor="primary"
                tabs={[
                    {
                        tabName: t('GROUPS'),
                        tabIcon: Group,
                        tabContent: (
                            <CustomTable
                                title={t('SAML_GROUPS')}
                                headerFunctions={[]}
                                head={[
                                    { id: 'saml_name', label: t('NAME') },
                                    {
                                        id: 'saml_provider_id',
                                        label: t('POVIDER_ID')
                                    },
                                    { id: 'groups', label: t('MAPPED_GROUPS') }
                                ]}
                                data={saml_groups}
                            />
                        )
                    }
                ]}
            />
        );
    }
}

SAMLCard.propTypes = {
    classes: PropTypes.object.isRequired,
    sessions: PropTypes.array,
    saml_groups: PropTypes.array
};

export default compose(withTranslation(), withStyles(tasksCardStyle))(SAMLCard);
