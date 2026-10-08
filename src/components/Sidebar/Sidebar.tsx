import React, { useEffect, useState } from 'react';

import Collapse from '@mui/material/Collapse';
import { withStyles } from '@mui/styles';
import Drawer from '@mui/material/Drawer';
import Hidden from '@mui/material/Hidden';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Settings from '@mui/icons-material/Settings';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import { NavLink, useLocation } from 'react-router-dom';

import sidebarStyle from '../../assets/jss/material-dashboard-react/sidebarStyle';

import { HeaderLinks } from '../../components';
import user from '../../services/user';

export interface SidebarProps {
    classes: Record<string, string>;
    t?: any;
    color?: string;
    logo?: any;
    image?: string;
    logoText?: any;
    routes?: any;
    open?: boolean;
    handleDrawerToggle: (...args: any[]) => any;
    state?: any;
}
const Sidebar = (props: SidebarProps) => {
    let location = useLocation();
    const activeRoute = (routeName: any) =>
        location.pathname.indexOf(routeName) > -1;

    const { classes, t, color, logo, image, logoText, routes } = props;
    const primaryRoutes = routes.filter((route: any) => !route.sidebarGroup);
    const settingsRoutes = routes
        .filter((route: any) => route.sidebarGroup === 'SETTINGS')
        .sort(
            (a: any, b: any) => (a.sidebarOrder || 0) - (b.sidebarOrder || 0)
        );
    const settingsActive = settingsRoutes.some((route: any) =>
        activeRoute(route.path)
    );
    const [settingsOpen, setSettingsOpen] = useState(settingsActive);

    useEffect(() => {
        if (settingsActive) setSettingsOpen(true);
    }, [settingsActive]);

    const renderLink = (route: any, nested = false) => (
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
                        ? ' ' +
                          (nested ? classes.nestedActive : classes[color || ''])
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
                .filter((route: any) => !route.redirect)
                .map((route: any) => renderLink(route))}
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
                        onClick={() => setSettingsOpen((open: any) => !open)}
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
                            {settingsRoutes.map((route: any) =>
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

export default withTranslation()(
    withStyles(sidebarStyle, { withTheme: true })(Sidebar)
);
