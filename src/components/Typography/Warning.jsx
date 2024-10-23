import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';

import typographyStyle from '../../assets/jss/material-dashboard-react/typographyStyle';

const Warning = ({ classes, children }) => {
    return (
        <div className={`${classes.defaultFontStyle} ${classes.warningText}`}>
            {children}
        </div>
    );
};

Warning.propTypes = {
    classes: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
};

export default withStyles(typographyStyle)(Warning);
