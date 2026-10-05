import React from 'react';
import { matchPath, useLocation } from 'react-router-dom';

import { Menu } from '@mui/icons-material';
import { AppBar, Toolbar, IconButton, Hidden, Button } from '@mui/material';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';

import headerStyle from '../../assets/jss/material-dashboard-react/headerStyle';
import user from '../../services/user';

import HeaderLinks from './HeaderLinks';

export interface HeaderProps {
    routes?: any;
    t?: any;
    classes: Record<string, string>;
    color?: string;
    handleDrawerToggle: (...args: any[]) => any;
}
const Header = (props: HeaderProps) => {
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
                (color !== undefined ? ' ' + classes[color || ''] : '')
            }
        >
            <Toolbar className={classes.container}>
                <div className={classes.flex}>
                    {/* Here we create navbar brand, based on route name */}
                    <Button href="#" className={classes.title}>
                        {makeBrand()}
                    </Button>
                </div>
                <Hidden mdDown implementation="css">
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

export default withTranslation()(
    withStyles(headerStyle, { withTheme: true })(Header)
);
