import React from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';

import typographyStyle from '../../assets/jss/material-dashboard-react/typographyStyle';

const Quote = ({ classes, text, author }) => {
    return (
        <blockquote className={`${classes.defaultFontStyle} ${classes.quote}`}>
            <p className={classes.quoteText}>{text}</p>
            <small className={classes.quoteAuthor}>{author}</small>
        </blockquote>
    );
};

Quote.propTypes = {
    classes: PropTypes.object.isRequired,
    text: PropTypes.node,
    author: PropTypes.node,
};

export default withStyles(typographyStyle)(Quote);
