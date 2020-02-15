import React from 'react';
import {
    withStyles,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Tabs,
    Tab
} from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import { Domain, DevicesOther, Web } from '@material-ui/icons';
import PropTypes from 'prop-types';

import { CustomTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';

class ReleaseCard extends React.Component {
    state = {
        value: 0
    };
    handleChange = (event, value) => {
        this.setState({ value });
    };
    render() {
        const {
            classes,
            headerColor,
            t,
            server_releases,
            client_releases,
            admin_client_releases,
            fileserver_releases
        } = this.props;
        return (
            <Card className={classes.card}>
                <CardHeader
                    classes={{
                        root:
                            classes.cardHeader +
                            ' ' +
                            classes[headerColor + 'CardHeader'],
                        title: classes.cardTitle,
                        content: classes.cardHeaderContent
                    }}
                    title={t('RELEASES')}
                    action={
                        <Tabs
                            classes={{
                                flexContainer: classes.tabsContainer
                            }}
                            value={this.state.value}
                            onChange={this.handleChange}
                            textColor="inherit"
                        >
                            <Tab
                                classes={{
                                    wrapper: classes.tabWrapper,
                                    label: classes.label
                                }}
                                icon={<Domain className={classes.tabIcon} />}
                                label={t('SERVER')}
                            />
                            <Tab
                                classes={{
                                    wrapper: classes.tabWrapper,
                                    label: classes.label
                                }}
                                icon={
                                    <DevicesOther className={classes.tabIcon} />
                                }
                                label={t('CLIENT')}
                            />
                            <Tab
                                classes={{
                                    wrapper: classes.tabWrapper,
                                    label: classes.label
                                }}
                                icon={<Web className={classes.tabIcon} />}
                                label={t('PORTAL')}
                            />
                            <Tab
                                classes={{
                                    wrapper: classes.tabWrapper,
                                    label: classes.label
                                }}
                                icon={<Domain className={classes.tabIcon} />}
                                label={t('FILESERVER')}
                            />
                        </Tabs>
                    }
                />
                <CardContent>
                    {this.state.value === 0 && (
                        <Typography component="div">
                            <CustomTable
                                head={[
                                    { id: 'name', label: t('VERSION') },
                                    { id: 'created_at', label: t('DATE') },
                                    {
                                        id: 'description',
                                        label: t('RELEASE_NOTES')
                                    }
                                ]}
                                rowsPerPage={5}
                                data={server_releases}
                            />
                        </Typography>
                    )}
                    {this.state.value === 1 && (
                        <Typography component="div">
                            <CustomTable
                                head={[
                                    { id: 'name', label: t('VERSION') },
                                    { id: 'created_at', label: t('DATE') },
                                    {
                                        id: 'description',
                                        label: t('RELEASE_NOTES')
                                    }
                                ]}
                                rowsPerPage={5}
                                data={client_releases}
                            />
                        </Typography>
                    )}
                    {this.state.value === 2 && (
                        <Typography component="div">
                            <CustomTable
                                head={[
                                    { id: 'name', label: t('VERSION') },
                                    { id: 'created_at', label: t('DATE') },
                                    {
                                        id: 'description',
                                        label: t('RELEASE_NOTES')
                                    }
                                ]}
                                rowsPerPage={5}
                                data={admin_client_releases}
                            />
                        </Typography>
                    )}
                    {this.state.value === 3 && (
                        <Typography component="div">
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
                                rowsPerPage={5}
                            />
                        </Typography>
                    )}
                </CardContent>
            </Card>
        );
    }
}

ReleaseCard.defaultProps = {
    headerColor: 'blue'
};

ReleaseCard.propTypes = {
    classes: PropTypes.object.isRequired,
    headerColor: PropTypes.oneOf(['orange', 'green', 'red', 'blue', 'purple']),
    server_releases: PropTypes.array,
    client_releases: PropTypes.array,
    admin_client_releases: PropTypes.array,
    fileserver_releases: PropTypes.array
};

export default compose(withTranslation(), withStyles(tasksCardStyle))(
    ReleaseCard
);
