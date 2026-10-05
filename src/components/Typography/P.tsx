import React from 'react';
import { withStyles } from '@mui/styles';

import typographyStyle from '../../assets/jss/material-dashboard-react/typographyStyle';

export interface PProps {
    classes: Record<string, string>;
    children?: React.ReactNode;
}
const P = ({ classes, children }: PProps) => {
    return (
        <p className={`${classes.defaultFontStyle} ${classes.pStyle}`}>
            {children}
        </p>
    );
};

export default withStyles(typographyStyle)(P);
