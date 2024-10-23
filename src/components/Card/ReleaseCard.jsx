import React from 'react';
import CustomTabs from '../../components/CustomTabs/CustomTabs.js';
import { useTranslation } from 'react-i18next';
import { Domain, DevicesOther, Web } from '@material-ui/icons';
import PropTypes from 'prop-types';

import { CustomMaterialTable } from '../../components';

const ReleaseCard = ({
    headerColor,
    server_releases,
    client_releases,
    admin_client_releases,
    fileserver_releases,
}) => {
    const { t } = useTranslation();

    const renderDescription = (rowData) => {
        return rowData.description.split('\n').map((item, key) => {
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
            ]}
        />
    );
};

ReleaseCard.defaultProps = {
    headerColor: 'rose',
};

ReleaseCard.propTypes = {
    headerColor: PropTypes.oneOf([
        'warning',
        'success',
        'danger',
        'info',
        'primary',
        'rose',
    ]),
    server_releases: PropTypes.array,
    client_releases: PropTypes.array,
    admin_client_releases: PropTypes.array,
    fileserver_releases: PropTypes.array,
};

export default ReleaseCard;
