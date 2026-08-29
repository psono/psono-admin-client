import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import { Redirect, useLocation } from 'react-router-dom';
import PerfectScrollbar from 'perfect-scrollbar';
import 'perfect-scrollbar/css/perfect-scrollbar.css';

import store from '../../services/store';
import { Header, Footer, Sidebar, Notification } from '../../components';

import otherLinks from '../../routes/other';
import sidebarLinks from '../../routes/sidebar';
import eeLinks from '../../routes/ee';
import ldapLinks from '../../routes/ldap';
import samlLinks from '../../routes/saml';
import oidcLinks from '../../routes/oidc';
import fileserverLinks from '../../routes/fileserver';
import gatewayLinks from '../../routes/gateway';

import appStyle from '../../assets/jss/material-dashboard-react/appStyle';

import image from '../../assets/img/background.jpg';
import logo from '../../assets/img/logo.png';

import actionCreators from '../../actions/actionCreators';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';

import SwitchRoutes from './SwitchRoutes';
import { authorizedRoutes } from '../../services/authorization';
import psonoServer from '../../services/api-server';
import userService from '../../services/user';

const App = (props) => {
    let location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [authorizationReady, setAuthorizationReady] = useState(false);
    const mainPanelRef = useRef(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const getRoute = () => location.pathname !== '/maps';

    useEffect(() => {
        if (!props.state.user.isLoggedIn) {
            setAuthorizationReady(false);
            return;
        }
        let active = true;
        props.actions.setAuthorization(null);
        psonoServer
            .admin_authorization(
                props.state.user.token,
                props.state.user.session_secret_key
            )
            .then((response) => {
                if (!active) return;
                props.actions.setAuthorization(response.data);
                setAuthorizationReady(true);
            })
            .catch(() => {
                if (active && store.getState().user.isLoggedIn) {
                    userService.logout();
                }
            });
        return () => {
            active = false;
        };
    }, [props.state.user.isLoggedIn, props.state.user.token]);

    useEffect(() => {
        if (!store.getState().user.isLoggedIn) {
            return;
        }
        if (window.innerWidth > 991 && mainPanelRef.current) {
            new PerfectScrollbar(mainPanelRef.current);
        }
    }, [store.getState().user.isLoggedIn]);

    useEffect(() => {
        if (mainPanelRef.current) {
            mainPanelRef.current.scrollTop = 0;
        }
    });

    if (!store.getState().user.isLoggedIn) {
        return <Redirect to="/login" />;
    }

    if (!authorizationReady) {
        return null;
    }

    if (
        store.getState().user.requirePasswordChange &&
        location.pathname !== '/account/change-password'
    ) {
        return <Redirect to="/account/change-password" />;
    }

    const { classes, ...rest } = props;

    let variableLinks = [];
    if (store.getState().server.files) {
        fileserverLinks.forEach((link) => variableLinks.push(link));
    }
    if (store.getState().server.gateway) {
        gatewayLinks.forEach((link) => variableLinks.push(link));
    }
    if (store.getState().server.type === 'EE') {
        eeLinks.forEach((link) => variableLinks.push(link));
    }
    if (
        store.getState().server.type === 'EE' &&
        store.getState().server.authentication_methods.includes('LDAP')
    ) {
        ldapLinks.forEach((link) => variableLinks.push(link));
    }
    if (
        store.getState().server.type === 'EE' &&
        store.getState().server.authentication_methods.includes('SAML')
    ) {
        samlLinks.forEach((link) => variableLinks.push(link));
    }
    if (
        store.getState().server.type === 'EE' &&
        store.getState().server.authentication_methods.includes('OIDC')
    ) {
        oidcLinks.forEach((link) => variableLinks.push(link));
    }

    const authorization = props.state.user.authorization;
    const visibleSidebarLinks = authorizedRoutes(
        sidebarLinks.concat(variableLinks),
        authorization
    );
    const visibleOtherLinks = authorizedRoutes(otherLinks, authorization);
    const headerLinks = visibleOtherLinks.concat(visibleSidebarLinks);

    return (
        <div className={classes.wrapper}>
            <Notification />
            <Sidebar
                routes={visibleSidebarLinks}
                logo={logo}
                image={image}
                handleDrawerToggle={handleDrawerToggle}
                open={mobileOpen}
                color="blue"
                {...rest}
            />
            <div className={classes.mainPanel} ref={mainPanelRef}>
                <Header
                    routes={headerLinks}
                    handleDrawerToggle={handleDrawerToggle}
                    {...rest}
                />
                {getRoute() ? (
                    <div className={classes.content}>
                        <div className={classes.container}>
                            <SwitchRoutes {...rest} />
                        </div>
                    </div>
                ) : (
                    <div className={classes.map}>
                        <SwitchRoutes {...rest} />
                    </div>
                )}
                {getRoute() ? <Footer /> : null}
            </div>
        </div>
    );
};

App.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    state,
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(actionCreators, dispatch),
});

export default compose(
    withStyles(appStyle, { withTheme: true }),
    connect(mapStateToProps, mapDispatchToProps)
)(App);
