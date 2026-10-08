import React from 'react';

import { withStyles } from '@mui/styles';

import typographyStyle from '../../assets/jss/material-dashboard-react/typographyStyle';

export interface MutedProps {
    classes: Record<string, string>;
    children?: React.ReactNode;
}
const Muted = ({ classes, children }: MutedProps) => {
    return (
        <div className={`${classes.defaultFontStyle} ${classes.mutedText}`}>
            {children}
        </div>
    );
};

export default withStyles(typographyStyle)(Muted);
