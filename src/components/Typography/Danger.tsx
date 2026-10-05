import React from 'react';

import { withStyles } from '@mui/styles';

import typographyStyle from '../../assets/jss/material-dashboard-react/typographyStyle';

export interface DangerProps {
    classes: Record<string, string>;
    children?: React.ReactNode;
}
const Danger = ({ classes, children }: DangerProps) => {
    return (
        <div className={`${classes.defaultFontStyle} ${classes.dangerText}`}>
            {children}
        </div>
    );
};

export default withStyles(typographyStyle)(Danger);
