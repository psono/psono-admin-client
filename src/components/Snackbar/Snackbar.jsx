import React from 'react';
import { Snackbar as Snack, IconButton } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Close } from '@mui/icons-material';
import PropTypes from 'prop-types';

import snackbarContentStyle from '../../assets/jss/material-dashboard-react/snackbarContentStyle';

const Snackbar = ({
    classes,
    message,
    color,
    close,
    icon: Icon,
    place,
    open,
    closeNotification,
}) => {
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
                    root: `${classes.root} ${classes[color]}`,
                    message: classes.message,
                },
            }}
        />
    );
};

Snackbar.propTypes = {
    classes: PropTypes.object.isRequired,
    message: PropTypes.node.isRequired,
    color: PropTypes.oneOf([
        'warning',
        'success',
        'danger',
        'info',
        'primary',
        'rose',
    ]),
    close: PropTypes.bool,
    icon: PropTypes.elementType,
    place: PropTypes.oneOf(['tl', 'tr', 'tc', 'br', 'bl', 'bc']),
    open: PropTypes.bool,
    closeNotification: PropTypes.func,
};

export default withStyles(snackbarContentStyle)(Snackbar);
