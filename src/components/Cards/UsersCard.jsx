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
import {
    Person,
    DevicesOther,
    Group,
    Delete,
    DoNotDisturb,
    CheckBox,
    Edit
} from 'material-ui-icons';
import PropTypes from 'prop-types';

import { CustomTable } from '../../components';

import { tasksCardStyle } from '../../variables/styles';

class UsersCard extends React.Component {
    state = {
        value: 0
    };
    handleChange = (event, value) => {
        this.setState({ value });
    };
    render() {
        const {
            classes,
            users,
            sessions,
            groups,
            onDeleteUsers,
            onEditUser,
            onActivate,
            onDeactivate,
            onDeleteSessions
        } = this.props;
        return (
            <Card className={classes.card}>
                <CardHeader
                    classes={{
                        root: classes.cardHeader,
                        title: classes.cardTitle,
                        content: classes.cardHeaderContent
                    }}
                    title="User Management:"
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
                                label={'Users'}
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
                                title="Users"
                                headerFunctions={[
                                    {
                                        title: 'Edit User',
                                        onClick: onEditUser,
                                        icon: <Edit />,
                                        max_selected: 1
                                    },
                                    {
                                        title: 'Activate User(s)',
                                        onClick: onActivate,
                                        icon: <CheckBox />
                                    },
                                    {
                                        title: 'Deactivate User(s)',
                                        onClick: onDeactivate,
                                        icon: <DoNotDisturb />
                                    },
                                    {
                                        title: 'Delete User(s)',
                                        onClick: onDeleteUsers,
                                        icon: <Delete />
                                    }
                                ]}
                                onDelete={onDeleteUsers}
                                head={[
                                    { id: 'username', label: 'Username' },
                                    {
                                        id: 'create_date',
                                        label: 'Registered'
                                    },
                                    { id: 'is_active', label: 'Active' },
                                    {
                                        id: 'is_email_active',
                                        label: 'Email Active'
                                    },
                                    { id: 'yubikey_2fa', label: 'Yubikey' },
                                    { id: 'ga_2fa', label: 'Google Auth' },
                                    { id: 'duo_2fa', label: 'Duo Auth' }
                                ]}
                                data={users}
                            />
                        </Typography>
                    )}
                    {this.state.value === 1 && (
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
                                    { id: 'username', label: 'Username' },
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
                    {this.state.value === 2 && (
                        <Typography component="div">
                            <CustomTable
                                title="Groups"
                                headerFunctions={[]}
                                head={[
                                    { id: 'name', label: 'Name' },
                                    {
                                        id: 'create_date',
                                        label: 'Created at'
                                    },
                                    {
                                        id: 'member_count',
                                        label: 'Members'
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

UsersCard.propTypes = {
    classes: PropTypes.object.isRequired,
    users: PropTypes.array,
    sessions: PropTypes.array,
    groups: PropTypes.array
};

export default withStyles(tasksCardStyle)(UsersCard);
