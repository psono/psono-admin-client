import React from 'react';
import { withStyles, Button } from '@material-ui/core';
import PropTypes from 'prop-types';

import buttonStyle from '../../assets/jss/material-dashboard-react/buttonStyle';

class RegularButton extends React.Component {
    render() {
        const {
            classes,
            color,
            round,
            children,
            fullWidth,
            disabled,
            ...rest
        } = this.props;
        return (
            <Button
                {...rest}
                className={
                    classes.button +
                    (color ? ' ' + classes[color] : '') +
                    (round ? ' ' + classes.round : '') +
                    (fullWidth ? ' ' + classes.fullWidth : '') +
                    (disabled ? ' ' + classes.disabled : '')
                }
            >
                {children}
            </Button>
        );
    }
}

RegularButton.propTypes = {
    classes: PropTypes.object.isRequired,
    color: PropTypes.oneOf([
        'primary',
        'info',
        'success',
        'warning',
        'danger',
        'rose',
        'white',
        'simple',
        'transparent'
    ]),
    round: PropTypes.bool,
    fullWidth: PropTypes.bool,
    disabled: PropTypes.bool
};

export default withStyles(buttonStyle)(RegularButton);
