import React from 'react';
import { withStyles } from '@mui/styles';

import typographyStyle from '../../assets/jss/material-dashboard-react/typographyStyle';

export interface AProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    classes: Record<string, string>;
    children?: React.ReactNode;
}
const A = ({ classes, children, ...rest }: AProps) => {
    return (
        <a
            {...rest}
            className={`${classes.defaultFontStyle} ${classes.aStyle}`}
        >
            {children}
        </a>
    );
};

export default withStyles(typographyStyle)(A);
