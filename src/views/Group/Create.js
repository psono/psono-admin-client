import React from 'react';
import { Grid, withStyles } from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import { Redirect } from 'react-router-dom';

import {
    RegularCard,
    CustomInput,
    GridItem,
    Button,
    SnackbarContent
} from '../../components/index';
import psono_server from '../../services/api-server';
import customInputStyle from '../../assets/jss/material-dashboard-react/customInputStyle';

class Group extends React.Component {
    state = {
        errors_list: [],
        errors_dict: {},
        redirect_to: '',
        groupname: '',
        createGroupPossible: false
    };

    componentDidMount() {
        const is_ee_server = this.props.state.server.type === 'EE';

        if (!is_ee_server) {
            this.setState({
                redirect_to: '/dashboard'
            });
        }
    }

    onChangeGroupName = event => {
        this.setState({
            groupname: event.target.value,
            createGroupPossible:
                event.target.value.length > 2 &&
                event.target.value.indexOf('@') === -1
        });
    };

    createGroup = () => {
        const onSuccess = data => {
            this.setState({
                redirect_to: '/group/' + data.data.id
            });
        };
        const onError = data => {
            this.setState({
                errors_dict: data.data
            });
        };

        psono_server
            .admin_create_group(
                this.props.state.user.token,
                this.props.state.user.session_secret_key,
                this.state.groupname
            )
            .then(onSuccess, onError);
    };

    render() {
        const { t } = this.props;
        if (this.state.redirect_to) {
            return <Redirect to={this.state.redirect_to} />;
        }
        const errors_dict = this.state.errors_dict;
        return (
            <div>
                <Grid container>
                    <GridItem xs={12} sm={12} md={12}>
                        <RegularCard
                            cardTitle={t('CREATE_GROUP')}
                            cardSubtitle={t('ADD_NECESSARY_DETAILS_BELOW')}
                            content={
                                <div>
                                    <Grid container>
                                        <GridItem xs={12} sm={12} md={7}>
                                            <CustomInput
                                                labelText={t('GROUP_NAME')}
                                                id="groupname"
                                                helperText={
                                                    errors_dict.hasOwnProperty(
                                                        'name'
                                                    )
                                                        ? errors_dict['name']
                                                        : ''
                                                }
                                                formControlProps={{
                                                    fullWidth: true
                                                }}
                                                inputProps={{
                                                    value: this.state.groupname,
                                                    onChange: this
                                                        .onChangeGroupName
                                                }}
                                                error={errors_dict.hasOwnProperty(
                                                    'name'
                                                )}
                                            />
                                        </GridItem>
                                    </Grid>
                                </div>
                            }
                            footer={
                                <div>
                                    <Button
                                        color="primary"
                                        onClick={this.createGroup}
                                        disabled={
                                            !this.state.createGroupPossible
                                        }
                                    >
                                        {t('CREATE_GROUP')}
                                    </Button>
                                    {errors_dict.hasOwnProperty(
                                        'non_field_errors'
                                    ) ? (
                                        <SnackbarContent
                                            message={t(
                                                errors_dict['non_field_errors']
                                            )}
                                            color="danger"
                                        />
                                    ) : (
                                        ''
                                    )}
                                </div>
                            }
                        />
                    </GridItem>
                </Grid>
            </div>
        );
    }
}

export default compose(withTranslation(), withStyles(customInputStyle))(Group);
