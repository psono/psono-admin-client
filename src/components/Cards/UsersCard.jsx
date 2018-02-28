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
import { Person, DevicesOther } from 'material-ui-icons';
import PropTypes from 'prop-types';

import { CustomPaginationActionsTable } from '../../components';

import { tasksCardStyle } from '../../variables/styles';

class UsersCard extends React.Component {
    state = {
        value: 0
    };
    handleChange = (event, value) => {
        this.setState({ value });
    };
    render() {
        const { classes, users, sessions } = this.props;
        return (
            <Card className={classes.card}>
                <CardHeader
                    classes={{
                        root: classes.cardHeader,
                        title: classes.cardTitle,
                        content: classes.cardHeaderContent
                    }}
                    title="Releases:"
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
                                icon={<Person className={classes.tabIcon} />}
                                label={'User'}
                            />
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
                        </Tabs>
                    }
                />
                <CardContent>
                    {this.state.value === 0 && (
                        <Typography component="div">
                            <CustomPaginationActionsTable
                                tableHead={[
                                    { name: 'username', title: 'Username' },
                                    {
                                        name: 'create_date',
                                        title: 'Registered'
                                    },
                                    { name: 'is_active', title: 'Active' },
                                    {
                                        name: 'is_email_active',
                                        title: 'Email Active'
                                    },
                                    { name: 'yubikey_2fa', title: 'Yubikey' },
                                    { name: 'ga_2fa', title: 'Google Auth' },
                                    { name: 'duo_2fa', title: 'Duo Auth' }
                                ]}
                                tableData={users}
                            />
                        </Typography>
                    )}
                    {this.state.value === 1 && (
                        <Typography component="div">
                            <CustomPaginationActionsTable
                                tableHead={[
                                    { name: 'username', title: 'Username' },
                                    {
                                        name: 'create_date',
                                        title: 'Logged in at'
                                    },
                                    { name: 'valid_till', title: 'Valid till' },
                                    {
                                        name: 'device_description',
                                        title: 'Device Description'
                                    },
                                    {
                                        name: 'device_fingerprint',
                                        title: 'Device'
                                    },
                                    { name: 'active', title: 'Active' }
                                ]}
                                tableData={sessions}
                            />
                        </Typography>
                    )}
                </CardContent>
            </Card>
        );
    }
}

UsersCard.propTypes = {
    classes: PropTypes.object.isRequired,
    users: PropTypes.array.isRequired,
    sessions: PropTypes.array.isRequired
};

export default withStyles(tasksCardStyle)(UsersCard);
