import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withStyles } from 'material-ui';
import PropTypes from 'prop-types';

import { LoginForm } from '../../components';
import actionCreators from '../../actions/actionCreators';
import user from '../../services/user';
import host from '../../services/host';

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
        'align-items': 'center'
    },
    content: {
        width: '100%',
        height: '100%',
        'z-index': '3',
        content: '',
        opacity: '.8',
        position: 'absolute',
        background: '#000'
    }
};

class Login extends React.Component {
    render() {
        const { classes, ...rest } = this.props;

        return (
            <div className={classes.wrapper}>
                <div className={classes.content} />
                <LoginForm
                    {...rest}
                    initiate_login={user.initiate_login}
                    approve_host={host.approve_host}
                    login={user.login}
                    activate_token={user.activate_token}
                    logout={user.logout}
                    yubikey_otp_verify={user.yubikey_otp_verify}
                    duo_verify={user.duo_verify}
                    ga_verify={user.ga_verify}
                />
            </div>
        );
    }
}

Login.propTypes = {
    store: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
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