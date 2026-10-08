import React from 'react';

import { withStyles } from '@mui/styles';

import typographyStyle from '../../assets/jss/material-dashboard-react/typographyStyle';

export interface SmallProps {
    classes: Record<string, string>;
    children?: React.ReactNode;
}
const Small = ({ classes, children }: SmallProps) => {
    return (
        <div className={`${classes.defaultFontStyle} ${classes.smallText}`}>
            {children}
        </div>
    );
};

export default withStyles(typographyStyle)(Small);
