import React from 'react';
import { Snackbar as Snack, IconButton } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Close } from '@mui/icons-material';

import snackbarContentStyle from '../../assets/jss/material-dashboard-react/snackbarContentStyle';

export interface SnackbarProps {
    classes: Record<string, string>;
    message?: React.ReactNode;
    color?: string;
    close?: any;
    icon?: any;
    place?: any;
    open?: boolean;
    closeNotification?: any;
}
const Snackbar = ({
    classes,
    message,
    color,
    close,
    icon: Icon,
    place,
    open,
    closeNotification,
}: SnackbarProps) => {
    const action = close
        ? [
              <IconButton
                  className={classes.iconButton}
                  key="close"
                  aria-label="Close"
                  color="inherit"
                  onClick={closeNotification}
              >
                  <Close className={classes.close} />
              </IconButton>,
          ]
        : [];

    return (
        <Snack
            anchorOrigin={{
                vertical: place.indexOf('t') === -1 ? 'bottom' : 'top',
                horizontal:
                    place.indexOf('l') !== -1
                        ? 'left'
                        : place.indexOf('c') !== -1
                        ? 'center'
                        : 'right',
            }}
            open={open}
            message={
                <div>
                    {Icon ? <Icon className={classes.icon} /> : null}
                    <span className={Icon ? classes.iconMessage : ''}>
                        {message}
                    </span>
                </div>
            }
            action={action}
            ContentProps={{
                classes: {
                    root: `${classes.root} ${classes[color || '']}`,
                    message: classes.message,
                },
            }}
        />
    );
};

export default withStyles(snackbarContentStyle)(Snackbar);
