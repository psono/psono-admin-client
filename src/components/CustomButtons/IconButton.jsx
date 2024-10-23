import React from 'react';
import { withStyles, IconButton } from '@material-ui/core';
import PropTypes from 'prop-types';

import iconButtonStyle from '../../assets/jss/material-dashboard-react/iconButtonStyle';

const IconCustomButton = ({
    classes,
    color,
    children,
    customClass,
    ...rest
}) => {
    return (
        <IconButton
            {...rest}
            className={
                classes.button +
                (color ? ` ${classes[color]}` : '') +
                (customClass ? ` ${customClass}` : '')
            }
        >
            {children}
        </IconButton>
    );
};

IconCustomButton.propTypes = {
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
    ]),
    customClass: PropTypes.string,
    disabled: PropTypes.bool,
    children: PropTypes.node.isRequired,
};

export default withStyles(iconButtonStyle)(IconCustomButton);
