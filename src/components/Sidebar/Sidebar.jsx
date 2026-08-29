import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Collapse from '@material-ui/core/Collapse';
import withStyles from '@material-ui/core/styles/withStyles';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Settings from '@material-ui/icons/Settings';
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
    const primaryRoutes = routes.filter((route) => !route.sidebarGroup);
    const settingsRoutes = routes
        .filter((route) => route.sidebarGroup === 'SETTINGS')
        .sort((a, b) => (a.sidebarOrder || 0) - (b.sidebarOrder || 0));
    const settingsActive = settingsRoutes.some((route) =>
        activeRoute(route.path)
    );
    const [settingsOpen, setSettingsOpen] = useState(settingsActive);

    useEffect(() => {
        if (settingsActive) setSettingsOpen(true);
    }, [settingsActive]);

    const renderLink = (route, nested = false) => (
        <NavLink
            to={route.path}
            className={classes.item}
            activeClassName="active"
            key={route.path}
        >
            <ListItem
                button
                className={
                    classes.itemLink +
                    (nested ? ' ' + classes.nestedItemLink : '') +
                    (activeRoute(route.path)
                        ? ' ' + (nested ? classes.nestedActive : classes[color])
                        : '')
                }
            >
                <ListItemIcon
                    className={
                        classes.itemIcon +
                        (nested ? ' ' + classes.nestedItemIcon : '') +
                        (activeRoute(route.path) ? ' ' + classes.whiteFont : '')
                    }
                >
                    <route.icon />
                </ListItemIcon>
                <ListItemText
                    primary={t(route.sidebarName)}
                    className={
                        classes.itemText +
                        (nested ? ' ' + classes.nestedItemText : '') +
                        (activeRoute(route.path) ? ' ' + classes.whiteFont : '')
                    }
                    disableTypography={true}
                />
            </ListItem>
        </NavLink>
    );

    const links = (
        <List className={classes.list}>
            {primaryRoutes
                .filter((route) => !route.redirect)
                .map((route) => renderLink(route))}
            {settingsRoutes.length > 0 && (
                <>
                    <ListItem
                        button
                        className={
                            classes.groupLink +
                            (settingsActive
                                ? ' ' + classes.groupLinkActive
                                : '')
                        }
                        onClick={() => setSettingsOpen((open) => !open)}
                        aria-expanded={settingsOpen}
                    >
                        <ListItemIcon
                            className={
                                classes.itemIcon + ' ' + classes.groupIcon
                            }
                        >
                            <Settings />
                        </ListItemIcon>
                        <ListItemText
                            primary={t('SETTINGS')}
                            className={classes.itemText}
                            disableTypography={true}
                        />
                        {settingsOpen ? (
                            <ExpandLess className={classes.groupChevron} />
                        ) : (
                            <ExpandMore className={classes.groupChevron} />
                        )}
                    </ListItem>
                    <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
                        <List
                            component="div"
                            disablePadding
                            className={classes.nestedList}
                        >
                            {settingsRoutes.map((route) =>
                                renderLink(route, true)
                            )}
                        </List>
                    </Collapse>
                </>
            )}
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
