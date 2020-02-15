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
import { DevicesOther, Group, Delete } from '@material-ui/icons';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { CustomTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';

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
            t,
            sessions,
            memberships,
            duos,
            yubikey_otps,
            google_authenticators,
            recovery_codes,
            emergency_codes,
            onDeleteSessions,
            onDeleteMemberships,
            onDeleteDuos,
            onDeleteYubikeyOtps,
            onDeleteGoogleAuthenticators,
            onDeleteRecoveryCodes,
            onDeleteEmergencyCodes
        } = this.props;
        return (
            <Card className={classes.card}>
                <CardHeader
                    classes={{
                        root: classes.cardHeader,
                        title: classes.cardTitle,
                        content: classes.cardHeaderContent
                    }}
                    title={t('USER_DETAILS')}
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
                                icon={
                                    <DevicesOther className={classes.tabIcon} />
                                }
                                label={t('SESSIONS')}
                            />
                            <Tab
                                classes={{
                                    wrapper: classes.tabWrapper,
                                    label: classes.label
                                }}
                                icon={<Group className={classes.tabIcon} />}
                                label={t('MEMBERSHIPS')}
                            />
                            <Tab
                                classes={{
                                    wrapper: classes.tabWrapper,
                                    label: classes.label
                                }}
                                icon={<Group className={classes.tabIcon} />}
                                label={t('DUOS')}
                            />
                            <Tab
                                classes={{
                                    wrapper: classes.tabWrapper,
                                    label: classes.label
                                }}
                                icon={<Group className={classes.tabIcon} />}
                                label={t('YUBIKEYS')}
                            />
                            <Tab
                                classes={{
                                    wrapper: classes.tabWrapper,
                                    label: classes.label
                                }}
                                icon={<Group className={classes.tabIcon} />}
                                label={t('GOOGLE_AUTHS')}
                            />
                            <Tab
                                classes={{
                                    wrapper: classes.tabWrapper,
                                    label: classes.label
                                }}
                                icon={<Group className={classes.tabIcon} />}
                                label={t('RECOVERY_CODES')}
                            />
                            <Tab
                                classes={{
                                    wrapper: classes.tabWrapper,
                                    label: classes.label
                                }}
                                icon={<Group className={classes.tabIcon} />}
                                label={t('EMERGENCY_CODES')}
                            />
                        </Tabs>
                    }
                />
                <CardContent>
                    {this.state.value === 0 && (
                        <Typography component="div">
                            <CustomTable
                                title={t('SESSIONS')}
                                headerFunctions={[
                                    {
                                        title: t('DELETE_SESSION_S'),
                                        onClick: onDeleteSessions,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    {
                                        id: 'create_date',
                                        label: t('LOGGED_IN_AT')
                                    },
                                    {
                                        id: 'valid_till',
                                        label: t('VALID_TILL')
                                    },
                                    {
                                        id: 'device_description',
                                        label: t('DEVICE_DESCRIPTION')
                                    },
                                    {
                                        id: 'device_fingerprint',
                                        label: t('DEVICE')
                                    },
                                    { id: 'active', label: t('ACTIVE') }
                                ]}
                                data={sessions}
                            />
                        </Typography>
                    )}
                    {this.state.value === 1 && (
                        <Typography component="div">
                            <CustomTable
                                title={t('MEMBERSHIPS')}
                                headerFunctions={[
                                    {
                                        title: t('DELETE_MEMBERSHIP_S'),
                                        onClick: onDeleteMemberships,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    { id: 'group_name', label: t('GROUP') },
                                    {
                                        id: 'create_date',
                                        label: t('JOINED_AT')
                                    },
                                    { id: 'accepted', label: t('ACCEPTED') },
                                    { id: 'admin', label: t('GROUP_ADMIN') }
                                ]}
                                data={memberships}
                            />
                        </Typography>
                    )}
                    {this.state.value === 2 && (
                        <Typography component="div">
                            <CustomTable
                                title={t('DUOS')}
                                headerFunctions={[
                                    {
                                        title: t('DELETE_DUO_S'),
                                        onClick: onDeleteDuos,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    { id: 'title', label: t('TITLE') },
                                    {
                                        id: 'create_date',
                                        label: t('CREATED_AT')
                                    },
                                    { id: 'active', label: t('ACTIVE') }
                                ]}
                                data={duos}
                            />
                        </Typography>
                    )}
                    {this.state.value === 3 && (
                        <Typography component="div">
                            <CustomTable
                                title={t('YUBIKEYS')}
                                headerFunctions={[
                                    {
                                        title: t('DELETE_YUBIKEY_S'),
                                        onClick: onDeleteYubikeyOtps,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    { id: 'title', label: t('TITLE') },
                                    {
                                        id: 'create_date',
                                        label: t('CREATED_AT')
                                    },
                                    { id: 'active', label: t('ACTIVE') }
                                ]}
                                data={yubikey_otps}
                            />
                        </Typography>
                    )}
                    {this.state.value === 4 && (
                        <Typography component="div">
                            <CustomTable
                                title={t('GOOGLE_AUTHENTICATORS')}
                                headerFunctions={[
                                    {
                                        title: t('DELETE_GOOGLE_AUTH_S'),
                                        onClick: onDeleteGoogleAuthenticators,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    { id: 'title', label: t('TITLE') },
                                    {
                                        id: 'create_date',
                                        label: t('CREATED_AT')
                                    },
                                    { id: 'active', label: t('ACTIVE') }
                                ]}
                                data={google_authenticators}
                            />
                        </Typography>
                    )}
                    {this.state.value === 5 && (
                        <Typography component="div">
                            <CustomTable
                                title={t('RECOVERY_CODES')}
                                headerFunctions={[
                                    {
                                        title: t('DELETE_RECOVERY_CODE_S'),
                                        onClick: onDeleteRecoveryCodes,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    {
                                        id: 'create_date',
                                        label: t('CREATED_AT')
                                    }
                                ]}
                                data={recovery_codes}
                            />
                        </Typography>
                    )}
                    {this.state.value === 6 && (
                        <Typography component="div">
                            <CustomTable
                                title={t('EMERGENCY_CODES')}
                                headerFunctions={[
                                    {
                                        title: t('DELETE_NOTFALL_CODE_S'),
                                        onClick: onDeleteEmergencyCodes,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    {
                                        id: 'description',
                                        label: t('DESCRIPTION')
                                    },
                                    {
                                        id: 'create_date',
                                        label: t('CREATED_AT')
                                    }
                                ]}
                                data={emergency_codes}
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

export default compose(withTranslation(), withStyles(tasksCardStyle))(UserCard);
