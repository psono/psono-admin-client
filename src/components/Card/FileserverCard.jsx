import React from 'react';
import { withStyles } from '@material-ui/core';
import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import { Domain } from '@material-ui/icons';
import PropTypes from 'prop-types';

import { CustomTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';

class FileserverCard extends React.Component {
    render() {
        const { headerColor, t, fileserver } = this.props;
        return (
            <CustomTabs
                title={t('FILESERVER_INFO')}
                headerColor={headerColor}
                tabs={[
                    {
                        tabName: t('FILESERVER'),
                        tabIcon: Domain,
                        tabContent: (
                            <CustomTable
                                head={[
                                    { id: 'hostname', label: t('HOSTNAME') },
                                    {
                                        id: 'fileserver_cluster_title',
                                        label: t('CLUSTER')
                                    },
                                    {
                                        id: 'version',
                                        label: t('VERSION')
                                    }
                                ]}
                                rowsPerPage={10}
                                data={fileserver}
                            />
                        )
                    }
                ]}
            />
        );
    }
}

FileserverCard.defaultProps = {
    headerColor: 'primary'
};

FileserverCard.propTypes = {
    classes: PropTypes.object.isRequired,
    headerColor: PropTypes.oneOf([
        'warning',
        'success',
        'danger',
        'info',
        'primary',
        'rose'
    ]),
    fileserver: PropTypes.array
};

export default compose(withTranslation(), withStyles(tasksCardStyle))(
    FileserverCard
);
