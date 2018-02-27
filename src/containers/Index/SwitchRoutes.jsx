import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui';
import { Switch, Route, Redirect } from 'react-router-dom';
import appRoutes from '../../routes/app';
import { appStyle } from '../../variables/styles';

class switchRoutes extends React.Component {
    render() {
        const { actions, state, store, ...rest } = this.props;
        return (
            <Switch>
                {appRoutes.map((prop, key) => {
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
