import React, { Component } from 'react';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { HashLoader } from 'react-spinners';
import { createBrowserHistory } from 'history';
import { Router, Route, Switch } from 'react-router-dom';
import matchPath from 'react-router/matchPath';

import store from '../services/store';

import 'chartist/dist/chartist.min.css';
import 'chartist/dist/chartist.min.js';
import 'chartist-plugin-axistitle/dist/chartist-plugin-axistitle.min.js';
import 'font-awesome/css/font-awesome.min.css';

import 'clientjs/dist/client.min.js';
import '../assets/css/material-dashboard-react.css';
import mainRoutes from '../routes/main';

const hist = createBrowserHistory({
    basename: '/portal'
});

let persistor = persistStore(store);

class App extends Component {
    render() {
        let match = null;
        for (let i = 0; i < mainRoutes.length; i++) {
            match = matchPath(hist.location.pathname, mainRoutes[i].path);
            if (match !== null) {
                break;
            }
        }
        return (
            <PersistGate loading={<HashLoader />} persistor={persistor}>
                <Router history={hist} basename="/portal">
                    <Switch>
                        {mainRoutes.map((prop, key) => {
                            return (
                                <Route
                                    path={prop.path}
                                    render={() => (
                                        <prop.component
                                            store={store}
                                            location={hist.location}
                                        />
                                    )}
                                    key={key}
                                />
                            );
                        })}
                    </Switch>
                </Router>
            </PersistGate>
        );
    }
}

export default App;
