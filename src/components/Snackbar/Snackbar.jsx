import React from 'react';
import { withStyles, Snackbar as Snack, IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import PropTypes from 'prop-types';

import snackbarContentStyle from '../../assets/jss/material-dashboard-react/snackbarContentStyle';

class Snackbar extends React.Component {
    render() {
        const {
            classes,
            message,
            color,
            close,
            icon,
            place,
            open
        } = this.props;
        var action = [];
        if (close !== undefined) {
            action = [
                <IconButton
                    className={classes.iconButton}
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    onClick={() => this.props.closeNotification()}
                >
                    <Close className={classes.close} />
                </IconButton>
            ];
        }
        return (
            <Snack
                anchorOrigin={{
                    vertical: place.indexOf('t') === -1 ? 'bottom' : 'top',
                    horizontal:
                        place.indexOf('l') !== -1
                            ? 'left'
                            : place.indexOf('c') !== -1 ? 'center' : 'right'
                }}
                open={open}
                message={
                    <div>
                        {icon !== undefined ? (
                            <this.props.icon className={classes.icon} />
                        ) : null}
                        <span
                            className={
                                icon !== undefined ? classes.iconMessage : ''
                            }
                        >
                            {message}
                        </span>
                    </div>
                }
                action={action}
                ContentProps={{
                    classes: {
                        root: classes.root + ' ' + classes[color],
                        message: classes.message
                    }
                }}
            />
        );
    }
}

Snackbar.propTypes = {
    classes: PropTypes.object.isRequired,
    message: PropTypes.node.isRequired,
    color: PropTypes.oneOf([
        'warning',
        'success',
        'danger',
        'info',
        'primary',
        'rose'
    ]),
    close: PropTypes.bool,
    icon: PropTypes.object,
    place: PropTypes.oneOf(['tl', 'tr', 'tc', 'br', 'bl', 'bc']),
    open: PropTypes.bool
};

export default withStyles(snackbarContentStyle)(Snackbar);
