import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import typographyStyle from '../../assets/jss/material-dashboard-react/typographyStyle';

const Info = ({ classes, children }) => {
    return (
        <div className={`${classes.defaultFontStyle} ${classes.infoText}`}>
            {children}
        </div>
    );
};

Info.propTypes = {
    classes: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired,
};

export default withStyles(typographyStyle)(Info);
