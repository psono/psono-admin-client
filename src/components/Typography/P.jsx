import React from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';

import typographyStyle from '../../assets/jss/material-dashboard-react/typographyStyle';

const P = ({ classes, children }) => {
    return (
        <p className={`${classes.defaultFontStyle} ${classes.pStyle}`}>
            {children}
        </p>
    );
};

P.propTypes = {
    classes: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
};

export default withStyles(typographyStyle)(P);
