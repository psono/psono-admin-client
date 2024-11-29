import React from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';

import typographyStyle from '../../assets/jss/material-dashboard-react/typographyStyle';

const A = ({ classes, children, ...rest }) => {
    return (
        <a
            {...rest}
            className={`${classes.defaultFontStyle} ${classes.aStyle}`}
        >
            {children}
        </a>
    );
};

A.propTypes = {
    classes: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
};

export default withStyles(typographyStyle)(A);
