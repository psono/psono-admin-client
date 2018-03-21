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
import { Group, Delete } from 'material-ui-icons';
import PropTypes from 'prop-types';

import { CustomTable } from '../../components';

import { tasksCardStyle } from '../../variables/styles';

class GroupCard extends React.Component {
    state = {
        value: 0
    };
    handleChange = (event, value) => {
        this.setState({ value });
    };
    render() {
        const {
            classes,
            memberships,
            ldap_groups,
            onDeleteMemberships
        } = this.props;
        return (
            <Card className={classes.card}>
                <CardHeader
                    classes={{
                        root: classes.cardHeader,
                        title: classes.cardTitle,
                        content: classes.cardHeaderContent
                    }}
                    title="Group Details:"
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
                                icon={<Group className={classes.tabIcon} />}
                                label={'Memberships'}
                            />
                            {ldap_groups && ldap_groups.length > 0 ? (
                                <Tab
                                    classes={{
                                        wrapper: classes.tabWrapper,
                                        rootLabelIcon: classes.labelIcon,
                                        label: classes.label,
                                        rootInheritSelected:
                                            classes.rootInheritSelected
                                    }}
                                    icon={<Group className={classes.tabIcon} />}
                                    label={'LDAP Groups'}
                                />
                            ) : null}
                        </Tabs>
                    }
                />
                <CardContent>
                    {this.state.value === 0 && (
                        <Typography component="div">
                            <CustomTable
                                title="Users:"
                                headerFunctions={[
                                    {
                                        title: 'Delete Membership(s)',
                                        onClick: onDeleteMemberships,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    { id: 'username', label: 'Username' },
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
                    {this.state.value === 1 && (
                        <Typography component="div">
                            <CustomTable
                                title="Mapped LDAP groups:"
                                head={[
                                    { id: 'mapped', label: 'Mapped' },
                                    { id: 'dn', label: 'DN' },
                                    {
                                        id: 'has_group_admin',
                                        label: 'Group Admin'
                                    },
                                    {
                                        id: 'has_share_admin',
                                        label: 'Share Admin'
                                    },
                                    { id: 'domain', label: 'Domain' }
                                ]}
                                data={ldap_groups}
                            />
                        </Typography>
                    )}
                </CardContent>
            </Card>
        );
    }
}

GroupCard.propTypes = {
    classes: PropTypes.object.isRequired,
    sessions: PropTypes.array,
    groups: PropTypes.array
};

export default withStyles(tasksCardStyle)(GroupCard);
