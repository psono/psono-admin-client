import React from 'react';
import { withStyles } from '@material-ui/core';
import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import { Group } from '@material-ui/icons';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { Button, CustomMaterialTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';

class SAMLCard extends React.Component {
    render() {
        const { t, saml_groups, onSyncGroupsSaml } = this.props;
        return (
            <CustomTabs
                title={t('SAML_MANAGEMENT')}
                headerColor="primary"
                tabs={[
                    {
                        tabName: t('GROUPS'),
                        tabIcon: Group,
                        tabContent: (
                            <div>
                                <Button color="info" onClick={onSyncGroupsSaml}>
                                    {t('SYNC_WITH_SAML_IDP')}
                                </Button>
                                <CustomMaterialTable
                                    columns={[
                                        { field: 'name', title: t('NAME') },
                                        {
                                            field: 'saml_provider_id',
                                            title: t('POVIDER_ID'),
                                        },
                                        {
                                            field: 'groups',
                                            title: t('MAPPED_GROUPS'),
                                        },
                                    ]}
                                    data={saml_groups}
                                    title={t('SAML_GROUPS')}
                                    options={{
                                        pageSize: 10,
                                    }}
                                />
                            </div>
                        ),
                    },
                ]}
            />
        );
    }
}

SAMLCard.propTypes = {
    classes: PropTypes.object.isRequired,
    sessions: PropTypes.array,
    saml_groups: PropTypes.array,
};

export default compose(withTranslation(), withStyles(tasksCardStyle))(SAMLCard);
