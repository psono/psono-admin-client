import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import { Switch, Route, Redirect, matchPath } from 'react-router-dom';
import sidebarRoutes from '../../routes/sidebar';
import ldapRoutes from '../../routes/ldap';
import samlRoutes from '../../routes/saml';
import oidcRoutes from '../../routes/oidc';
import otherRoutes from '../../routes/other';
import appStyle from '../../assets/jss/material-dashboard-react/appStyle';

class switchRoutes extends React.Component {
    render() {
        const { actions, state, store, ...rest } = this.props;

        let variableLinks = [];
        if (state.server.authentication_methods.indexOf('LDAP') !== -1) {
            ldapRoutes.forEach(function(route) {
                variableLinks.push(route);
            });
        }
        if (state.server.authentication_methods.indexOf('SAML') !== -1) {
            samlRoutes.forEach(function(route) {
                variableLinks.push(route);
            });
        }
        if (state.server.authentication_methods.indexOf('OIDC') !== -1) {
            oidcRoutes.forEach(function(route) {
                variableLinks.push(route);
            });
        }

        const routes = otherRoutes.concat(variableLinks, sidebarRoutes);

        let match = null;
        for (let i = 0; i < routes.length; i++) {
            match = matchPath(this.props.location.pathname, routes[i].path);
            if (match !== null) {
                break;
            }
        }

        return (
            <Switch>
                {routes.map((prop, key) => {
                    if (prop.redirect)
                        return (
                            <Redirect
                                from={prop.path}
                                to={prop.to}
                                key={key}
                                {...rest}
                            />
                        );
                    return (
                        <Route
                            path={prop.path}
                            render={() => (
                                <prop.component
                                    actions={actions}
                                    state={state}
                                    store={store}
                                    match={match}
                                />
                            )}
                            key={key}
                            {...rest}
                        />
                    );
                })}
            </Switch>
        );
    }
}

switchRoutes.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(appStyle)(switchRoutes);
