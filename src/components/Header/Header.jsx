import React from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Menu } from '@material-ui/icons';
import {
    withStyles,
    AppBar,
    Toolbar,
    IconButton,
    Hidden,
    Button,
} from '@material-ui/core';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';

import headerStyle from '../../assets/jss/material-dashboard-react/headerStyle';
import user from '../../services/user';

import HeaderLinks from './HeaderLinks';

const Header = (props) => {
    let location = useLocation();
    const makeBrand = () => {
        for (let i = 0; i < props.routes.length; i++) {
            if (matchPath(location.pathname, props.routes[i].path) !== null) {
                return props.t(props.routes[i].navbarName);
            }
        }
        return null;
    };

    const { classes, color, ...rest } = props;

    return (
        <AppBar
            className={
                classes.appBar +
                (color !== undefined ? ' ' + classes[color] : '')
            }
        >
            <Toolbar className={classes.container}>
                <div className={classes.flex}>
                    {/* Here we create navbar brand, based on route name */}
                    <Button href="#" className={classes.title}>
                        {makeBrand()}
                    </Button>
                </div>
                <Hidden smDown implementation="css">
                    <HeaderLinks {...rest} logout={user.logout} />
                </Hidden>
                <Hidden mdUp>
                    <IconButton
                        className={classes.appResponsive}
                        color="inherit"
                        aria-label="open drawer"
                        onClick={props.handleDrawerToggle}
                    >
                        <Menu />
                    </IconButton>
                </Hidden>
            </Toolbar>
        </AppBar>
    );
};

Header.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    color: PropTypes.oneOf(['primary', 'info', 'success', 'warning', 'danger']),
};

export default compose(
    withTranslation(),
    withStyles(headerStyle, { withTheme: true })
)(Header);
