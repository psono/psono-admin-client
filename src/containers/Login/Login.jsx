import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators, compose} from 'redux';
import { withStyles } from 'material-ui';
import PropTypes from 'prop-types';

import { LoginForm } from '../../components';
import * as actionCreators from '../../actions/actionCreators'

import image from '../../assets/img/background.jpg';
const style = {
    wrapper: {
        position: 'relative',
        top: '0',
        height: '100vh',
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        display: 'flex',
        'justify-content': 'center',
        'align-items': 'center',
    },
    content: {
        width: '100%',
        height: '100%',
        'z-index': '3',
        content: "",
        opacity: '.8',
        position: 'absolute',
        background: '#000',
    },
};


class Login extends React.Component{
    render(){
        const { classes, actions, ...rest } = this.props;
        function login(username, password) {
            actions.login(username, password);
        }
        return (
            <div className={classes.wrapper}>
                <div className={classes.content}>
                </div>
                <LoginForm
                    {...rest}
                    login={login}
                />
            </div>
        );
    }
}

Login.propTypes = {
    store: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    return {state: state}
}

function mapDispatchToProps(dispatch) {
    return {actions: bindActionCreators(actionCreators, dispatch)}
}

export default compose(
    withStyles(style),
    connect(mapStateToProps, mapDispatchToProps)
)(Login);
