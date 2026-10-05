import React from 'react';
import { useTranslation } from 'react-i18next';

import { Domain } from '@mui/icons-material';

import CustomTabs from '../../components/CustomTabs/CustomTabs';
import { CustomMaterialTable } from '../../components';

export interface FileserverCardProps {
    latest_version?: string;
    headerColor?: string;
    fileserver?: any;
}
const FileserverCard = ({ headerColor, fileserver }: FileserverCardProps) => {
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

export default FileserverCard;
