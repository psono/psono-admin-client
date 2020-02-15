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
import { Group } from '@material-ui/icons';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import { CustomTable } from '../../components';

import tasksCardStyle from '../../assets/jss/material-dashboard-react/tasksCardStyle';

class SAMLCard extends React.Component {
    state = {
        value: 0
    };
    handleChange = (event, value) => {
        this.setState({ value });
    };
    render() {
        const { classes, t, saml_groups } = this.props;
        return (
            <Card className={classes.card}>
                <CardHeader
                    classes={{
                        root: classes.cardHeader,
                        title: classes.cardTitle,
                        content: classes.cardHeaderContent
                    }}
                    title={t('SAML_MANAGEMENT')}
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
                                title={t('SAML_GROUPS')}
                                headerFunctions={[]}
                                head={[
                                    { id: 'saml_name', label: t('NAME') },
                                    {
                                        id: 'saml_provider_id',
                                        label: t('POVIDER_ID')
                                    },
                                    { id: 'groups', label: t('MAPPED_GROUPS') }
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

SAMLCard.propTypes = {
    classes: PropTypes.object.isRequired,
    sessions: PropTypes.array,
    saml_groups: PropTypes.array
};

export default compose(withTranslation(), withStyles(tasksCardStyle))(SAMLCard);
