import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';

import typographyStyle from '../../assets/jss/material-dashboard-react/typographyStyle';

const Primary = ({ classes, children }) => {
    return (
        <div className={`${classes.defaultFontStyle} ${classes.primaryText}`}>
            {children}
        </div>
    );
};

Primary.propTypes = {
    classes: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
};

export default withStyles(typographyStyle)(Primary);
