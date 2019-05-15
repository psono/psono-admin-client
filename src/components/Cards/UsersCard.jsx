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
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { CustomTable, Button } from '../../components';

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
            t,
            users,
            sessions,
            groups,
            onDeleteUsers,
            onEditUser,
            onEditGroup,
            onActivate,
            onDeactivate,
            onDeleteSessions,
            onDeleteGroups,
            onCreateGroup,
            show_create_group_button
        } = this.props;
        return (
            <Card className={classes.card}>
                <CardHeader
                    classes={{
                        root: classes.cardHeader,
                        title: classes.cardTitle,
                        content: classes.cardHeaderContent
                    }}
                    title={t('USER_MANAGEMENT') + ':'}
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
                                label={t('USERS')}
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
                                label={t('SESSIONS')}
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
                                label={t('GROUPS')}
                            />
                        </Tabs>
                    }
                />
                <CardContent>
                    {this.state.value === 0 && (
                        <Typography component="div">
                            <CustomTable
                                title={t('USERS')}
                                headerFunctions={[
                                    {
                                        title: t('EDIT_USER_S'),
                                        onClick: onEditUser,
                                        icon: <Edit />,
                                        max_selected: 1
                                    },
                                    {
                                        title: t('ACTIVATE_USER_S'),
                                        onClick: onActivate,
                                        icon: <CheckBox />
                                    },
                                    {
                                        title: t('DEACTIVATE_USER_S'),
                                        onClick: onDeactivate,
                                        icon: <DoNotDisturb />
                                    },
                                    {
                                        title: t('DELETE_USER_S'),
                                        onClick: onDeleteUsers,
                                        icon: <Delete />
                                    }
                                ]}
                                onDelete={onDeleteUsers}
                                head={[
                                    { id: 'username', label: t('USERNAME') },
                                    {
                                        id: 'create_date',
                                        label: t('CREATED_AT')
                                    },
                                    { id: 'is_active', label: t('ACTIVE') },
                                    {
                                        id: 'is_email_active',
                                        label: t('EMAIL_ACTIVE')
                                    },
                                    { id: 'yubikey_2fa', label: t('YUBIKEY') },
                                    {
                                        id: 'ga_2fa',
                                        label: t('GOOGLE_AUTHENTICATOR')
                                    },
                                    {
                                        id: 'duo_2fa',
                                        label: t('DUO_AUTHENTICATION')
                                    }
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
                                        title: t('DELETE_SESSION_S'),
                                        onClick: onDeleteSessions,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    { id: 'username', label: t('USERNAME') },
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
                    {this.state.value === 2 && (
                        <Typography component="div">
                            {show_create_group_button ? (
                                <Button
                                    color="info"
                                    onClick={() => {
                                        onCreateGroup();
                                    }}
                                >
                                    {t('CREATE_GROUP')}
                                </Button>
                            ) : null}
                            <CustomTable
                                title="Groups"
                                headerFunctions={[
                                    {
                                        title: t('EDIT_GROUP'),
                                        onClick: onEditGroup,
                                        icon: <Edit />,
                                        max_selected: 1
                                    },
                                    {
                                        title: t('DELETE_GROUP_S'),
                                        onClick: onDeleteGroups,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    { id: 'name', label: t('NAME') },
                                    {
                                        id: 'create_date',
                                        label: t('CREATED_AT')
                                    },
                                    {
                                        id: 'member_count',
                                        label: t('MEMBERS')
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

export default compose(withTranslation(), withStyles(tasksCardStyle))(
    UsersCard
);
