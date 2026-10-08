import React from 'react';

import { withStyles } from '@mui/styles';

import typographyStyle from '../../assets/jss/material-dashboard-react/typographyStyle';

export interface SuccessProps {
    classes: Record<string, string>;
    children?: React.ReactNode;
}
const Success = ({ classes, children }: SuccessProps) => {
    return (
        <div className={`${classes.defaultFontStyle} ${classes.successText}`}>
            {children}
        </div>
    );
};

export default withStyles(typographyStyle)(Success);
