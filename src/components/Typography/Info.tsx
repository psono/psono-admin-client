import React from 'react';

import { withStyles } from '@mui/styles';

import typographyStyle from '../../assets/jss/material-dashboard-react/typographyStyle';

export interface InfoProps {
    classes: Record<string, string>;
    children?: React.ReactNode;
}
const Info = ({ classes, children }: InfoProps) => {
    return (
        <div className={`${classes.defaultFontStyle} ${classes.infoText}`}>
            {children}
        </div>
    );
};

export default withStyles(typographyStyle)(Info);
