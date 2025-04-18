import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import { NavLink, useLocation } from 'react-router-dom';

import sidebarStyle from '../../assets/jss/material-dashboard-react/sidebarStyle';

import { HeaderLinks } from '../../components';
import user from '../../services/user';

const Sidebar = (props) => {
    let location = useLocation();
    const activeRoute = (routeName) =>
        location.pathname.indexOf(routeName) > -1;

    const { classes, t, color, logo, image, logoText, routes } = props;

    const links = (
        <List className={classes.list}>
            {routes.map((prop, key) => {
                if (prop.redirect) return null;
                return (
                    <NavLink
                        to={prop.path}
                        className={classes.item}
                        activeClassName="active"
                        key={key}
                    >
                        <ListItem
                            button
                            className={
                                classes.itemLink +
                                (activeRoute(prop.path)
                                    ? ' ' + classes[color]
                                    : '')
                            }
                        >
                            <ListItemIcon
                                className={
                                    classes.itemIcon +
                                    (activeRoute(prop.path)
                                        ? ' ' + classes.whiteFont
                                        : '')
                                }
                            >
                                <prop.icon />
                            </ListItemIcon>
                            <ListItemText
                                primary={t(prop.sidebarName)}
                                className={
                                    classes.itemText +
                                    (activeRoute(prop.path)
                                        ? ' ' + classes.whiteFont
                                        : '')
                                }
                                disableTypography={true}
                            />
                        </ListItem>
                    </NavLink>
                );
            })}
        </List>
    );

    const brand = (
        <div className={classes.logo}>
            <a href="https://www.psono.com" className={classes.logoLink}>
                <div className={classes.logoImage}>
                    <img src={logo} alt="logo" className={classes.img} />
                </div>
                {logoText}
            </a>
        </div>
    );

    return (
        <div>
            <Hidden mdUp>
                <Drawer
                    variant="temporary"
                    anchor="right"
                    open={props.open}
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                    onClose={props.handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                >
                    {brand}
                    <div className={classes.sidebarWrapper}>
                        <HeaderLinks state={props.state} logout={user.logout} />
                        {links}
                    </div>
                    {image !== undefined && (
                        <div
                            className={classes.background}
                            style={{
                                backgroundImage: 'url(' + image + ')',
                            }}
                        />
                    )}
                </Drawer>
            </Hidden>
            <Hidden smDown>
                <Drawer
                    anchor="left"
                    variant="permanent"
                    open
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                >
                    {brand}
                    <div className={classes.sidebarWrapper}>{links}</div>
                    {image !== undefined && (
                        <div
                            className={classes.background}
                            style={{
                                backgroundImage: 'url(' + image + ')',
                            }}
                        />
                    )}
                </Drawer>
            </Hidden>
        </div>
    );
};

Sidebar.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default compose(
    withTranslation(),
    withStyles(sidebarStyle, { withTheme: true })
)(Sidebar);
