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
        const {
            classes,
            sessions,
            memberships,
            duos,
            yubikey_otps,
            google_authenticators,
            recovery_codes,
            onDeleteSessions,
            onDeleteMemberships,
            onDeleteDuos,
            onDeleteYubikeyOtps,
            onDeleteGoogleAuthenticators,
            onDeleteRecoveryCodes
        } = this.props;
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
                                label={'Memberships'}
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
                                label={'Duos'}
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
                                label={'Yubikeys'}
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
                                label={'Google Auths'}
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
                                label={'Recovery Codes'}
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
                                title="Memberships"
                                headerFunctions={[
                                    {
                                        title: 'Delete Membership(s)',
                                        onClick: onDeleteMemberships,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    { id: 'group_name', label: 'Group' },
                                    {
                                        id: 'create_date',
                                        label: 'Joined at'
                                    },
                                    { id: 'accepted', label: 'Accepted' },
                                    { id: 'admin', label: 'Group Admin' }
                                ]}
                                data={memberships}
                            />
                        </Typography>
                    )}
                    {this.state.value === 2 && (
                        <Typography component="div">
                            <CustomTable
                                title="Duos"
                                headerFunctions={[
                                    {
                                        title: 'Delete Duo(s)',
                                        onClick: onDeleteDuos,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    { id: 'title', label: 'Title' },
                                    {
                                        id: 'create_date',
                                        label: 'Created at'
                                    },
                                    { id: 'active', label: 'Active' }
                                ]}
                                data={duos}
                            />
                        </Typography>
                    )}
                    {this.state.value === 3 && (
                        <Typography component="div">
                            <CustomTable
                                title="Yubikeys"
                                headerFunctions={[
                                    {
                                        title: 'Delete Yubikey(s)',
                                        onClick: onDeleteYubikeyOtps,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    { id: 'title', label: 'Title' },
                                    {
                                        id: 'create_date',
                                        label: 'Created at'
                                    },
                                    { id: 'active', label: 'Active' }
                                ]}
                                data={yubikey_otps}
                            />
                        </Typography>
                    )}
                    {this.state.value === 4 && (
                        <Typography component="div">
                            <CustomTable
                                title="Google Authenticators"
                                headerFunctions={[
                                    {
                                        title: 'Delete Google Auth(s)',
                                        onClick: onDeleteGoogleAuthenticators,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    { id: 'title', label: 'Title' },
                                    {
                                        id: 'create_date',
                                        label: 'Created at'
                                    },
                                    { id: 'active', label: 'Active' }
                                ]}
                                data={google_authenticators}
                            />
                        </Typography>
                    )}
                    {this.state.value === 5 && (
                        <Typography component="div">
                            <CustomTable
                                title="Recovery Codes"
                                headerFunctions={[
                                    {
                                        title: 'Delete Recovery Code(s)',
                                        onClick: onDeleteRecoveryCodes,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    {
                                        id: 'create_date',
                                        label: 'Created at'
                                    }
                                ]}
                                data={recovery_codes}
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
