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
import { Person, Group, ImportExport } from 'material-ui-icons';
import PropTypes from 'prop-types';

import { CustomTable, Button } from '../../components';

import { tasksCardStyle } from '../../variables/styles';

class LDAPCard extends React.Component {
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
            ldap_users,
            ldap_groups,
            onImportUsers,
            onSyncGroupsLdap
        } = this.props;
        return (
            <Card className={classes.card}>
                <CardHeader
                    classes={{
                        root: classes.cardHeader,
                        title: classes.cardTitle,
                        content: classes.cardHeaderContent
                    }}
                    title="LDAP Management:"
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
                                title="LDAP Users"
                                headerFunctions={[
                                    {
                                        title: 'Import User(s)',
                                        onClick: onImportUsers,
                                        icon: <ImportExport />
                                    }
                                ]}
                                head={[
                                    { id: 'username', label: t('USERNAME') },
                                    {
                                        id: 'create_date',
                                        label: t('IMPORTED')
                                    },
                                    { id: 'email', label: t('EMAIL') },
                                    { id: 'dn', label: t('DN') }
                                ]}
                                data={ldap_users}
                            />
                        </Typography>
                    )}
                    {this.state.value === 1 && (
                        <Typography component="div">
                            <Button
                                color="info"
                                onClick={() => {
                                    onSyncGroupsLdap();
                                }}
                            >
                                Sync with LDAP
                            </Button>
                            <CustomTable
                                title={t('LDAP_GROUPS')}
                                headerFunctions={[]}
                                head={[
                                    { id: 'dn', label: 'DN' },
                                    { id: 'domain', label: 'Domain' },
                                    { id: 'groups', label: 'Mapped Groups' }
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

LDAPCard.propTypes = {
    classes: PropTypes.object.isRequired,
    ldap_users: PropTypes.array,
    sessions: PropTypes.array,
    ldap_groups: PropTypes.array
};

export default compose(withTranslation(), withStyles(tasksCardStyle))(LDAPCard);