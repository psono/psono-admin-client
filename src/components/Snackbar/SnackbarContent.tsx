import React from 'react';
import { SnackbarContent as Snack, IconButton } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Close } from '@mui/icons-material';

import snackbarContentStyle from '../../assets/jss/material-dashboard-react/snackbarContentStyle';

export interface SnackbarContentProps {
    classes: Record<string, string>;
    message?: React.ReactNode;
    color?: string;
    close?: any;
    icon?: any;
}
const SnackbarContent = ({
    classes,
    message,
    color,
    close,
    icon: Icon,
}: SnackbarContentProps) => {
    const action = [];
    if (close !== undefined) {
        action.push(
            <IconButton
                className={classes.iconButton}
                key="close"
                aria-label="Close"
                color="inherit"
            >
                <Close className={classes.close} />
            </IconButton>
        );
    }

    return (
        <Snack
            message={
                <div>
                    {Icon !== undefined ? (
                        <Icon className={classes.icon} />
                    ) : null}
                    <span
                        className={
                            Icon !== undefined ? classes.iconMessage : ''
                        }
                    >
                        {message}
                    </span>
                </div>
            }
            classes={{
                root: `${classes.root} ${classes[color || '']}`,
                message: classes.message,
            }}
            action={action}
        />
    );
};

export default withStyles(snackbarContentStyle)(SnackbarContent);
