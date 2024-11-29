import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Domain } from '@material-ui/icons';

import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import { CustomMaterialTable } from '../../components';

const FileserverCard = ({ headerColor, fileserver }) => {
    const { t } = useTranslation();

    return (
        <CustomTabs
            title={t('FILESERVER_INFO')}
            headerColor={headerColor}
            tabs={[
                {
                    tabName: t('FILESERVER'),
                    tabIcon: Domain,
                    tabContent: (
                        <CustomMaterialTable
                            columns={[
                                { field: 'hostname', title: t('HOSTNAME') },
                                {
                                    field: 'fileserver_cluster_title',
                                    title: t('CLUSTER'),
                                },
                                {
                                    field: 'version',
                                    title: t('VERSION'),
                                },
                            ]}
                            options={{
                                pageSize: 5,
                            }}
                            data={fileserver}
                            title={''}
                        />
                    ),
                },
            ]}
        />
    );
};

FileserverCard.defaultProps = {
    headerColor: 'primary',
};

FileserverCard.propTypes = {
    headerColor: PropTypes.oneOf([
        'warning',
        'success',
        'danger',
        'info',
        'primary',
        'rose',
    ]),
    fileserver: PropTypes.array,
};

export default FileserverCard;
