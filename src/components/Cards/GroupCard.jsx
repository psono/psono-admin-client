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
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
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
            t,
            memberships,
            ldap_groups,
            saml_groups,
            onDeleteMemberships
        } = this.props;

        const has_ldap_groups = ldap_groups && ldap_groups.length > 0;
        const has_saml_groups = saml_groups && saml_groups.length > 0;

        var ldap_index = 1;
        var saml_index = 2;

        if (!has_ldap_groups && has_saml_groups) {
            ldap_index = 99;
            saml_index = 1;
        }

        return (
            <Card className={classes.card}>
                <CardHeader
                    classes={{
                        root: classes.cardHeader,
                        title: classes.cardTitle,
                        content: classes.cardHeaderContent
                    }}
                    title={t('GROUP_DETAILS')}
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
                                label={t('MEMBERSHIPS')}
                            />
                            {has_ldap_groups ? (
                                <Tab
                                    classes={{
                                        wrapper: classes.tabWrapper,
                                        rootLabelIcon: classes.labelIcon,
                                        label: classes.label,
                                        rootInheritSelected:
                                            classes.rootInheritSelected
                                    }}
                                    icon={<Group className={classes.tabIcon} />}
                                    label={t('LDAP_GROUPS')}
                                />
                            ) : null}
                            {has_saml_groups ? (
                                <Tab
                                    classes={{
                                        wrapper: classes.tabWrapper,
                                        rootLabelIcon: classes.labelIcon,
                                        label: classes.label,
                                        rootInheritSelected:
                                            classes.rootInheritSelected
                                    }}
                                    icon={<Group className={classes.tabIcon} />}
                                    label={t('SAML_GROUPS')}
                                />
                            ) : null}
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
                                        title: t('DELETE_MEMBERSHIP_S'),
                                        onClick: onDeleteMemberships,
                                        icon: <Delete />
                                    }
                                ]}
                                head={[
                                    { id: 'username', label: t('USERNAME') },
                                    {
                                        id: 'create_date',
                                        label: t('JOINED')
                                    },
                                    { id: 'accepted', label: t('ACCEPTED') },
                                    { id: 'admin', label: t('GROUP_ADMIN') }
                                ]}
                                data={memberships}
                            />
                        </Typography>
                    )}
                    {this.state.value === ldap_index && (
                        <Typography component="div">
                            <CustomTable
                                title={t('MAPPED_LDAP_GROUPS')}
                                head={[
                                    { id: 'mapped', label: t('MAPPED') },
                                    { id: 'dn', label: t('DN') },
                                    {
                                        id: 'has_group_admin',
                                        label: t('GROUP_ADMIN')
                                    },
                                    {
                                        id: 'has_share_admin',
                                        label: t('SHARE_ADMIN')
                                    },
                                    { id: 'domain', label: t('DOMAIN') }
                                ]}
                                data={ldap_groups}
                            />
                        </Typography>
                    )}
                    {(this.state.value === saml_index ||
                        (this.state.value === 1 &&
                            (!ldap_groups || ldap_groups.length < 1))) && (
                        <Typography component="div">
                            <CustomTable
                                title={t('MAPPED_SAML_GROUPS')}
                                head={[
                                    { id: 'mapped', label: t('MAPPED') },
                                    { id: 'saml_name', label: t('NAME') },
                                    {
                                        id: 'has_group_admin',
                                        label: t('GROUP_ADMIN')
                                    },
                                    {
                                        id: 'has_share_admin',
                                        label: t('SHARE_ADMIN')
                                    },
                                    {
                                        id: 'saml_provider_id',
                                        label: t('POVIDER_ID')
                                    }
                                ]}
                                data={saml_groups}
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

export default compose(withTranslation(), withStyles(tasksCardStyle))(
    GroupCard
);
