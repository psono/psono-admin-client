import React from 'react';
import { Grid, withStyles } from 'material-ui';
import { Redirect } from 'react-router-dom';

import {
    RegularCard,
    CustomInput,
    ItemGrid,
    Button
} from '../../components/index';
import psono_server from '../../services/api-server';
import { customInputStyle } from '../../variables/styles';

class User extends React.Component {
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
        if (this.state.redirect_to) {
            return <Redirect to={this.state.redirect_to} />;
        }
        const errors_dict = this.state.errors_dict;
        return (
            <div>
                <Grid container>
                    <ItemGrid xs={12} sm={12} md={12}>
                        <RegularCard
                            cardTitle="Create Group"
                            cardSubtitle="Add the necessary details below"
                            content={
                                <div>
                                    <Grid container>
                                        <ItemGrid xs={12} sm={12} md={7}>
                                            <CustomInput
                                                labelText="Group Name"
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
                                                        .onChangeGroupName,
                                                    helpertext: 'asdf'
                                                }}
                                                error={errors_dict.hasOwnProperty(
                                                    'name'
                                                )}
                                            />
                                        </ItemGrid>
                                    </Grid>
                                </div>
                            }
                            footer={
                                <Button
                                    color="primary"
                                    onClick={this.createGroup}
                                    disabled={!this.state.createGroupPossible}
                                >
                                    Create Group
                                </Button>
                            }
                        />
                    </ItemGrid>
                </Grid>
            </div>
        );
    }
}

export default withStyles(customInputStyle)(User);
