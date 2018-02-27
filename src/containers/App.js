import React, { Component } from 'react';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { HashLoader } from 'react-spinners';
import { createBrowserHistory } from 'history';
import { Router, Route, Switch } from 'react-router-dom';

import store from '../services/store';

import 'chartist/dist/chartist.min.css';
import 'chartist/dist/chartist.min.js';
import 'clientjs/dist/client.min.js';

import '../assets/css/material-dashboard-react.css';
import indexRoutes from '../routes/index.jsx';

const hist = createBrowserHistory();

let persistor = persistStore(store);

class App extends Component {
    render() {
        return (
            <PersistGate loading={<HashLoader />} persistor={persistor}>
                <Router history={hist}>
                    <Switch>
                        {indexRoutes.map((prop, key) => {
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
