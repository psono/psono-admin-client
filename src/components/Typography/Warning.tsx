import React from 'react';

import { withStyles } from '@mui/styles';

import typographyStyle from '../../assets/jss/material-dashboard-react/typographyStyle';

export interface WarningProps {
    classes: Record<string, string>;
    children?: React.ReactNode;
}
const Warning = ({ classes, children }: WarningProps) => {
    return (
        <div className={`${classes.defaultFontStyle} ${classes.warningText}`}>
            {children}
        </div>
    );
};

export default withStyles(typographyStyle)(Warning);
