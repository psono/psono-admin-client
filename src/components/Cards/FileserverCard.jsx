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
import { Domain } from '@material-ui/icons';
import PropTypes from 'prop-types';

import { CustomTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';

class FileserverCard extends React.Component {
    state = {
        value: 0
    };
    handleChange = (event, value) => {
        this.setState({ value });
    };
    render() {
        const { classes, headerColor, t, fileserver } = this.props;
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
                    title={t('FILESERVER_INFO')}
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
                                rowsPerPage={5}
                                data={fileserver}
                            />
                        </Typography>
                    )}
                </CardContent>
            </Card>
        );
    }
}

FileserverCard.defaultProps = {
    headerColor: 'purple'
};

FileserverCard.propTypes = {
    classes: PropTypes.object.isRequired,
    headerColor: PropTypes.oneOf(['orange', 'green', 'red', 'blue', 'purple']),
    fileserver: PropTypes.array
};

export default compose(withTranslation(), withStyles(tasksCardStyle))(
    FileserverCard
);
