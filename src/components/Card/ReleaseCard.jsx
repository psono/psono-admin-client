import React from 'react';
import { withStyles } from '@material-ui/core';
import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import { Domain, DevicesOther, Web } from '@material-ui/icons';
import PropTypes from 'prop-types';

import { CustomTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';

class ReleaseCard extends React.Component {
    render() {
        const {
            headerColor,
            t,
            server_releases,
            client_releases,
            admin_client_releases,
            fileserver_releases
        } = this.props;
        return (
            <CustomTabs
                title={t('RELEASES')}
                headerColor={headerColor}
                tabs={[
                    {
                        tabName: t('SERVER'),
                        tabIcon: Domain,
                        tabContent: (
                            <CustomTable
                                head={[
                                    { id: 'name', label: t('VERSION') },
                                    { id: 'created_at', label: t('DATE') },
                                    {
                                        id: 'description',
                                        label: t('RELEASE_NOTES')
                                    }
                                ]}
                                rowsPerPage={10}
                                data={server_releases}
                            />
                        )
                    },
                    {
                        tabName: t('CLIENT'),
                        tabIcon: DevicesOther,
                        tabContent: (
                            <CustomTable
                                head={[
                                    { id: 'name', label: t('VERSION') },
                                    { id: 'created_at', label: t('DATE') },
                                    {
                                        id: 'description',
                                        label: t('RELEASE_NOTES')
                                    }
                                ]}
                                rowsPerPage={10}
                                data={client_releases}
                            />
                        )
                    },
                    {
                        tabName: t('PORTAL'),
                        tabIcon: Web,
                        tabContent: (
                            <CustomTable
                                head={[
                                    { id: 'name', label: t('VERSION') },
                                    { id: 'created_at', label: t('DATE') },
                                    {
                                        id: 'description',
                                        label: t('RELEASE_NOTES')
                                    }
                                ]}
                                rowsPerPage={10}
                                data={admin_client_releases}
                            />
                        )
                    },
                    {
                        tabName: t('FILESERVER'),
                        tabIcon: Domain,
                        tabContent: (
                            <CustomTable
                                head={[
                                    { id: 'name', label: t('VERSION') },
                                    { id: 'created_at', label: t('DATE') },
                                    {
                                        id: 'description',
                                        label: t('RELEASE_NOTES')
                                    }
                                ]}
                                data={fileserver_releases}
                                rowsPerPage={10}
                            />
                        )
                    }
                ]}
            />
        );
    }
}

ReleaseCard.defaultProps = {
    headerColor: 'rose'
};

ReleaseCard.propTypes = {
    classes: PropTypes.object.isRequired,
    headerColor: PropTypes.oneOf([
        'warning',
        'success',
        'danger',
        'info',
        'primary',
        'rose'
    ]),
    server_releases: PropTypes.array,
    client_releases: PropTypes.array,
    admin_client_releases: PropTypes.array,
    fileserver_releases: PropTypes.array
};

export default compose(withTranslation(), withStyles(tasksCardStyle))(
    ReleaseCard
);
