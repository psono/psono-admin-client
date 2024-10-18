import React from 'react';
import {
    Switch,
    Route,
    Redirect,
    matchPath,
    useLocation,
} from 'react-router-dom';
import sidebarRoutes from '../../routes/sidebar';
import eeRoutes from '../../routes/ee';
import ldapRoutes from '../../routes/ldap';
import samlRoutes from '../../routes/saml';
import oidcRoutes from '../../routes/oidc';
import otherRoutes from '../../routes/other';

const SwitchRoutes = (props) => {
    let location = useLocation();
    const { actions, state, store, ...rest } = props;

    let variableLinks = [];
    if (state.server.type === 'EE') {
        eeRoutes.forEach(function (route) {
            variableLinks.push(route);
        });
    }
    if (
        state.server.type === 'EE' &&
        state.server.authentication_methods.indexOf('LDAP') !== -1
    ) {
        ldapRoutes.forEach(function (route) {
            variableLinks.push(route);
        });
    }
    if (
        state.server.type === 'EE' &&
        state.server.authentication_methods.indexOf('SAML') !== -1
    ) {
        samlRoutes.forEach(function (route) {
            variableLinks.push(route);
        });
    }
    if (
        state.server.type === 'EE' &&
        state.server.authentication_methods.indexOf('OIDC') !== -1
    ) {
        oidcRoutes.forEach(function (route) {
            variableLinks.push(route);
        });
    }

    const routes = otherRoutes.concat(variableLinks, sidebarRoutes);

    let match = null;
    for (let i = 0; i < routes.length; i++) {
        match = matchPath(location.pathname, routes[i].path);
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
};

export default SwitchRoutes;
