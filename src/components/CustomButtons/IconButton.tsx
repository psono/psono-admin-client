import React from 'react';
import { IconButton } from '@mui/material';
import { withStyles } from '@mui/styles';

import iconButtonStyle from '../../assets/jss/material-dashboard-react/iconButtonStyle';

export interface IconCustomButtonProps {
    classes: Record<string, string>;
    color?: string;
    children?: React.ReactNode;
    customClass?: any;
}
const IconCustomButton = ({
    classes,
    color,
    children,
    customClass,
    ...rest
}: IconCustomButtonProps) => {
    return (
        <IconButton
            {...rest}
            className={
                classes.button +
                (color ? ` ${classes[color || '']}` : '') +
                (customClass ? ` ${customClass}` : '')
            }
        >
            {children}
        </IconButton>
    );
};

export default withStyles(iconButtonStyle)(IconCustomButton);
