import React from 'react';
import CustomTabs from '../../components/CustomTabs/CustomTabs';
import { useTranslation } from 'react-i18next';
import { Domain, DesktopWindows, DevicesOther, Web } from '@mui/icons-material';

import { CustomMaterialTable } from '../../components';

export interface ReleaseCardProps {
    headerColor?: string;
    server_releases?: any;
    client_releases?: any;
    admin_client_releases?: any;
    fileserver_releases?: any;
    gateway_releases?: any;
}
const ReleaseCard = ({
    headerColor,
    server_releases,
    client_releases,
    admin_client_releases,
    fileserver_releases,
    gateway_releases,
}: ReleaseCardProps) => {
    const { t } = useTranslation();

    const renderDescription = (rowData: any) => {
        return rowData.description.split('\n').map((item: any, key: any) => {
            if (item.startsWith('# ') || item.trim() === '') {
                return null;
            }
            return (
                <span key={key}>
                    {item}
                    <br />
                </span>
            );
        });
    };

    return (
        <CustomTabs
            title={t('RELEASES')}
            headerColor={headerColor}
            tabs={[
                {
                    tabName: t('SERVER'),
                    tabIcon: Domain,
                    tabContent: (
                        <CustomMaterialTable
                            columns={[
                                { field: 'name', title: t('VERSION') },
                                { field: 'created_at', title: t('DATE') },
                                {
                                    field: 'description',
                                    title: t('RELEASE_NOTES'),
                                    render: renderDescription,
                                },
                            ]}
                            data={server_releases}
                            title={''}
                            options={{
                                pageSize: 5,
                            }}
                        />
                    ),
                },
                {
                    tabName: t('CLIENT'),
                    tabIcon: DevicesOther,
                    tabContent: (
                        <CustomMaterialTable
                            columns={[
                                { field: 'name', title: t('VERSION') },
                                { field: 'created_at', title: t('DATE') },
                                {
                                    field: 'description',
                                    title: t('RELEASE_NOTES'),
                                    render: renderDescription,
                                },
                            ]}
                            data={client_releases}
                            title={''}
                            options={{
                                pageSize: 5,
                            }}
                        />
                    ),
                },
                {
                    tabName: t('PORTAL'),
                    tabIcon: Web,
                    tabContent: (
                        <CustomMaterialTable
                            columns={[
                                { field: 'name', title: t('VERSION') },
                                { field: 'created_at', title: t('DATE') },
                                {
                                    field: 'description',
                                    title: t('RELEASE_NOTES'),
                                    render: renderDescription,
                                },
                            ]}
                            data={admin_client_releases}
                            title={''}
                            options={{
                                pageSize: 5,
                            }}
                        />
                    ),
                },
                {
                    tabName: t('FILESERVER'),
                    tabIcon: Domain,
                    tabContent: (
                        <CustomMaterialTable
                            columns={[
                                { field: 'name', title: t('VERSION') },
                                { field: 'created_at', title: t('DATE') },
                                {
                                    field: 'description',
                                    title: t('RELEASE_NOTES'),
                                    render: renderDescription,
                                },
                            ]}
                            data={fileserver_releases}
                            title={''}
                            options={{
                                pageSize: 5,
                            }}
                        />
                    ),
                },
                {
                    tabName: t('GATEWAY'),
                    tabIcon: DesktopWindows,
                    tabContent: (
                        <CustomMaterialTable
                            columns={[
                                { field: 'name', title: t('VERSION') },
                                { field: 'created_at', title: t('DATE') },
                                {
                                    field: 'description',
                                    title: t('RELEASE_NOTES'),
                                    render: renderDescription,
                                },
                            ]}
                            data={gateway_releases}
                            title={''}
                            options={{
                                pageSize: 5,
                            }}
                        />
                    ),
                },
            ]}
        />
    );
};

ReleaseCard.defaultProps = {
    headerColor: 'rose',
};

export default ReleaseCard;
