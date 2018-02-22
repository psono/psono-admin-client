import React from 'react';
import {
    withStyles
} from 'material-ui';
import {
    LoginForm
} from '../../components';

import image from '../../assets/img/background.jpg';

import PropTypes from 'prop-types';

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
        const { classes, ...rest } = this.props;
        return (
            <div className={classes.wrapper}>
                <div className={classes.content}>
                </div>
                <LoginForm
                    {...rest}
                />
            </div>
        );
    }
}

Login.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(style)(Login);
