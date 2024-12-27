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

import appStyle from '../../assets/jss/material-dashboard-react/appStyle';

import image from '../../assets/img/background.jpg';
import logo from '../../assets/img/logo.png';

import actionCreators from '../../actions/actionCreators';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';

import SwitchRoutes from './SwitchRoutes';

const App = (props) => {
    let location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const mainPanelRef = useRef(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const getRoute = () => location.pathname !== '/maps';

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

    const { classes, ...rest } = props;

    let variableLinks = [];
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

    const headerLinks = otherLinks.concat(variableLinks, sidebarLinks);

    return (
        <div className={classes.wrapper}>
            <Notification />
            <Sidebar
                routes={sidebarLinks.concat(variableLinks)}
                logo={logo}
                image={image}
                handleDrawerToggle={handleDrawerToggle}
                open={mobileOpen}
                color="blue"
                {...rest}
            />
            <div className={classes.mainPanel} ref={mainPanelRef}>
                <Header
                    routes={otherLinks.concat(headerLinks)}
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
