import React from 'react';
import {
    withStyles,
    SnackbarContent as Snack,
    IconButton,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import PropTypes from 'prop-types';

import snackbarContentStyle from '../../assets/jss/material-dashboard-react/snackbarContentStyle';

const SnackbarContent = ({ classes, message, color, close, icon: Icon }) => {
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
                root: `${classes.root} ${classes[color]}`,
                message: classes.message,
            }}
            action={action}
        />
    );
};

SnackbarContent.propTypes = {
    classes: PropTypes.object.isRequired,
    message: PropTypes.node.isRequired,
    color: PropTypes.oneOf(['info', 'success', 'warning', 'danger', 'primary']),
    close: PropTypes.bool,
    icon: PropTypes.elementType,
};

export default withStyles(snackbarContentStyle)(SnackbarContent);
