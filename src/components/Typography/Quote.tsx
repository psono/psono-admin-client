import React from 'react';
import { withStyles } from '@mui/styles';

import typographyStyle from '../../assets/jss/material-dashboard-react/typographyStyle';

export interface QuoteProps {
    classes: Record<string, string>;
    text?: any;
    author?: any;
}
const Quote = ({ classes, text, author }: QuoteProps) => {
    return (
        <blockquote className={`${classes.defaultFontStyle} ${classes.quote}`}>
            <p className={classes.quoteText}>{text}</p>
            <small className={classes.quoteAuthor}>{author}</small>
        </blockquote>
    );
};

export default withStyles(typographyStyle)(Quote);
