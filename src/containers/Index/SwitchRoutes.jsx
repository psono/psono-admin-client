import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui';
import { Switch, Route, Redirect } from 'react-router-dom';
import matchPath from 'react-router/matchPath';
import sidebarRoutes from '../../routes/sidebar';
import ldapRoutes from '../../routes/ldap';
import otherRoutes from '../../routes/other';
import { appStyle } from '../../variables/styles';

class switchRoutes extends React.Component {
    render() {
        const { actions, state, store, ...rest } = this.props;

        let variableLdapRoutes = [];
        if (state.server.authentication_methods.indexOf('LDAP')) {
            variableLdapRoutes = ldapRoutes;
        }

        const routes = otherRoutes.concat(variableLdapRoutes, sidebarRoutes);

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
