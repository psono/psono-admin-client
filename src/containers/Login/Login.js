import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';

import { LoginForm, Notification } from '../../components';
import actionCreators from '../../actions/actionCreators';
import user from '../../services/user';
import host from '../../services/host';
import browserClient from '../../services/browser-client';

import image from '../../assets/img/background.jpg';
import store from '../../services/store';
import { Redirect } from 'react-router-dom';
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
        content: '',
        opacity: '.8',
        position: 'absolute',
        background: '#000',
    },
};

class Login extends React.Component {
    render() {
        const { classes, ...rest } = this.props;

        if (store.getState().user.isLoggedIn) {
            return <Redirect to="/" />;
        }

        return (
            <div className={classes.wrapper}>
                <div className={classes.content} />
                <Notification />
                <LoginForm
                    {...rest}
                    initiateLogin={user.initiateLogin}
                    samlLogin={user.samlLogin}
                    initiateSamlLogin={user.initiateSamlLogin}
                    get_saml_redirect_url={user.get_saml_redirect_url}
                    oidcLogin={user.oidcLogin}
                    checkHost={host.checkHost}
                    initiateOidcLogin={user.initiateOidcLogin}
                    get_oidc_redirect_url={user.get_oidc_redirect_url}
                    login={user.login}
                    activateToken={user.activateToken}
                    logout={user.logout}
                    yubikey_otp_verify={user.yubikey_otp_verify}
                    duo_verify={user.duo_verify}
                    ga_verify={user.ga_verify}
                    approveHost={host.approveHost}
                    get_config={browserClient.get_config}
                />
            </div>
        );
    }
}

Login.propTypes = {
    classes: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    return { state: state };
}

function mapDispatchToProps(dispatch) {
    return { actions: bindActionCreators(actionCreators, dispatch) };
}

export default compose(
    withStyles(style),
    connect(mapStateToProps, mapDispatchToProps)
)(Login);
