import React from 'react';

import { withStyles } from '@mui/styles';

import typographyStyle from '../../assets/jss/material-dashboard-react/typographyStyle';

export interface PrimaryProps {
    classes: Record<string, string>;
    children?: React.ReactNode;
}
const Primary = ({ classes, children }: PrimaryProps) => {
    return (
        <div className={`${classes.defaultFontStyle} ${classes.primaryText}`}>
            {children}
        </div>
    );
};

export default withStyles(typographyStyle)(Primary);
