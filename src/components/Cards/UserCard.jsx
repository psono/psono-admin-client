import React from 'react';
import {
    withStyles,
    Card,
    CardContent,
    CardHeader,
    Typography,
    Tabs,
    Tab
} from 'material-ui';
import { DevicesOther, Group, Delete } from 'material-ui-icons';
import PropTypes from 'prop-types';

import { CustomTable } from '../../components';

import { tasksCardStyle } from '../../variables/styles';

class UserCard extends React.Component {
    state = {
        value: 0
    };
    handleChange = (event, value) => {
        this.setState({ value });
    };
    render() {
        const { classes, sessions, groups, onDeleteSessions } = this.props;
        return (
            <Card className={classes.card}>
                <CardHeader
                    classes={{
                        root: classes.cardHeader,
                        title: classes.cardTitle,
                        content: classes.cardHeaderContent
                    }}
                    title="User Details:"
                    action={
                        <Tabs
                            classes={{
                                flexContainer: classes.tabsContainer
                            }}
                            value={this.state.value}
                            onChange={this.handleChange}
                            indicatorClassName={classes.displayNone}
                            textColor="inherit"
                        >
                            <Tab
                                classes={{
                                    wrapper: classes.tabWrapper,
                                    rootLabelIcon: classes.labelIcon,
                                    label: classes.label,
                                    rootInheritSelected:
                                        classes.rootInheritSelected
                                }}
                                icon={
                                    <DevicesOther className={classes.tabIcon} />
                                }
                                label={'Sessions'}
                            />
                            <Tab
                                classes={{
                                    wrapper: classes.tabWrapper,
                                    rootLabelIcon: classes.labelIcon,
                                    label: classes.label,
                                    rootInheritSelected:
                                        classes.rootInheritSelected
                                }}
                                icon={<Group className={classes.tabIcon} />}
                                label={'Groups'}
                            />
                        </Tabs>
                    }
                />
                <CardContent>
                    {this.state.value === 0 && (
                        <Typography component="div">
                            <CustomTable
                                title="Sessions"
                                headerFunctions={[
                                    {
                                        title: 'Delete Session(s)',
                                        onClick: onDeleteSessions,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    {
                                        id: 'create_date',
                                        label: 'Logged in at'
                                    },
                                    { id: 'valid_till', label: 'Valid till' },
                                    {
                                        id: 'device_description',
                                        label: 'Device Description'
                                    },
                                    {
                                        id: 'device_fingerprint',
                                        label: 'Device'
                                    },
                                    { id: 'active', label: 'Active' }
                                ]}
                                data={sessions}
                            />
                        </Typography>
                    )}
                    {this.state.value === 1 && (
                        <Typography component="div">
                            <CustomTable
                                title="Groups"
                                headerFunctions={[]}
                                head={[
                                    { id: 'name', label: 'Name' },
                                    {
                                        id: 'create_date',
                                        label: 'Created at'
                                    }
                                ]}
                                data={groups}
                            />
                        </Typography>
                    )}
                </CardContent>
            </Card>
        );
    }
}

UserCard.propTypes = {
    classes: PropTypes.object.isRequired,
    sessions: PropTypes.array,
    groups: PropTypes.array
};

export default withStyles(tasksCardStyle)(UserCard);
