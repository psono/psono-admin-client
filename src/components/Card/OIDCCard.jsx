import React from 'react';
import { withStyles } from '@material-ui/core';
import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import { Group } from '@material-ui/icons';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { CustomMaterialTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';

class OIDCCard extends React.Component {
    render() {
        const { t, oidc_groups } = this.props;
        return (
            <CustomTabs
                title={t('OIDC_MANAGEMENT')}
                headerColor="primary"
                tabs={[
                    {
                        tabName: t('GROUPS'),
                        tabIcon: Group,
                        tabContent: (
                            <CustomMaterialTable
                                columns={[
                                    { field: 'oidc_name', title: t('NAME') },
                                    {
                                        field: 'oidc_provider_id',
                                        title: t('POVIDER_ID')
                                    },
                                    {
                                        field: 'groups',
                                        title: t('MAPPED_GROUPS')
                                    }
                                ]}
                                data={oidc_groups}
                                title={t('OIDC_GROUPS')}
                                options={{
                                    pageSize: 10
                                }}
                            />
                        )
                    }
                ]}
            />
        );
    }
}

OIDCCard.propTypes = {
    classes: PropTypes.object.isRequired,
    sessions: PropTypes.array,
    oidc_groups: PropTypes.array
};

export default compose(withTranslation(), withStyles(tasksCardStyle))(OIDCCard);
