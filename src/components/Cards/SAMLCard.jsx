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
import { Group } from 'material-ui-icons';
import PropTypes from 'prop-types';

import { CustomTable } from '../../components';

import { tasksCardStyle } from '../../variables/styles';

class SAMLCard extends React.Component {
    state = {
        value: 0
    };
    handleChange = (event, value) => {
        this.setState({ value });
    };
    render() {
        const { classes, saml_groups } = this.props;
        return (
            <Card className={classes.card}>
                <CardHeader
                    classes={{
                        root: classes.cardHeader,
                        title: classes.cardTitle,
                        content: classes.cardHeaderContent
                    }}
                    title="SAML Management:"
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
                                label={'Groups'}
                            />
                        </Tabs>
                    }
                />
                <CardContent>
                    {this.state.value === 0 && (
                        <Typography component="div">
                            <CustomTable
                                title="SAML Groups"
                                headerFunctions={[]}
                                head={[
                                    { id: 'saml_name', label: 'Name' },
                                    {
                                        id: 'saml_provider_id',
                                        label: 'Provider ID'
                                    },
                                    { id: 'groups', label: 'Mapped Groups' }
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

export default withStyles(tasksCardStyle)(SAMLCard);
