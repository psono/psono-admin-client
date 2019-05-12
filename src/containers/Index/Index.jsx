import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui';
import { Redirect } from 'react-router-dom';
// creates a beautiful scrollbar
import PerfectScrollbar from 'perfect-scrollbar';
import 'perfect-scrollbar/css/perfect-scrollbar.css';

import { Header, Footer, Sidebar } from '../../components';

import otherLinks from '../../routes/other';
import sidebarLinks from '../../routes/sidebar';
import ldapLinks from '../../routes/ldap';
import samlLinks from '../../routes/saml';

import { appStyle } from '../../variables/styles';

import image from '../../assets/img/background.jpg';
import logo from '../../assets/img/logo.png';

import actionCreators from '../../actions/actionCreators';
import { bindActionCreators, compose } from 'redux';
import { connect } from 'react-redux';

import SwitchRoutes from './SwitchRoutes';

class App extends React.Component {
    state = {
        mobileOpen: false
    };
    handleDrawerToggle = () => {
        this.setState({ mobileOpen: !this.state.mobileOpen });
    };
    getRoute() {
        return this.props.location.pathname !== '/maps';
    }
    componentDidMount() {
        if (!this.props.state.user.isLoggedIn) {
            return;
        }
        if (window.innerWidth > 991) {
            // eslint-disable-next-line
            const ps = new PerfectScrollbar(this.refs.mainPanel);
        }
    }
    componentDidUpdate() {
        if (this.refs.mainPanel) {
            this.refs.mainPanel.scrollTop = 0;
        }
    }
    render() {
        if (!this.props.state.user.isLoggedIn) {
            return <Redirect to="/login" />;
        }
        const { classes, ...rest } = this.props;

        let variableLinks = [];
        if (
            this.props.state.server.authentication_methods.indexOf('LDAP') !==
            -1
        ) {
            ldapLinks.forEach(function(link) {
                variableLinks.push(link);
            });
        }
        if (
            this.props.state.server.authentication_methods.indexOf('SAML') !==
            -1
        ) {
            samlLinks.forEach(function(link) {
                variableLinks.push(link);
            });
        }

        const headerLinks = otherLinks.concat(variableLinks, sidebarLinks);

        return (
            <div className={classes.wrapper}>
                <Sidebar
                    routes={sidebarLinks.concat(variableLinks)}
                    logoText={'Admin'}
                    logo={logo}
                    image={image}
                    handleDrawerToggle={this.handleDrawerToggle}
                    open={this.state.mobileOpen}
                    color="blue"
                    {...rest}
                />
                <div className={classes.mainPanel} ref="mainPanel">
                    <Header
                        routes={otherLinks.concat(headerLinks)}
                        handleDrawerToggle={this.handleDrawerToggle}
                        {...rest}
                    />
                    {/* On the /maps route we want the map to be on full screen - this is not possible if the content and conatiner classes are present because they have some paddings which would make the map smaller */}
                    {this.getRoute() ? (
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
                    {this.getRoute() ? <Footer /> : null}
                </div>
            </div>
        );
    }
}

App.propTypes = {
    store: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return { state: state };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actionCreators, dispatch)
    };
}

export default compose(
    withStyles(appStyle, { withTheme: true }),
    connect(mapStateToProps, mapDispatchToProps)
)(App);
