import React, { Component } from 'react';
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { PersistGate } from 'redux-persist/integration/react'
import { HashLoader } from 'react-spinners'
import { createBrowserHistory } from 'history';

import {
    Router,
    Route,
    Switch
} from 'react-router-dom';

import 'chartist/dist/chartist.min.css';
import 'chartist/dist/chartist.min.js';

import '../assets/css/material-dashboard-react.css';
import indexRoutes from '../routes/index.jsx';
import rootReducer from '../reducers'

const hist = createBrowserHistory();
const loggerMiddleware = createLogger();

const persistConfig = {
    key: 'root',
    storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

let store = createStore(
    persistedReducer,
    applyMiddleware(
        thunkMiddleware, // lets us dispatch() functions
        loggerMiddleware // neat middleware that logs actions
    )
);

let persistor = persistStore(store);


class App extends Component {
    render() {
        return (
            <PersistGate loading={<HashLoader />} persistor={persistor}>
                <Router history={hist}>
                    <Switch>
                        {
                            indexRoutes.map((prop,key) => {
                                return (
                                    <Route path={prop.path} render={()=><prop.component store={store} location={hist.location} />}  key={key}/>
                                );
                            })
                        }
                    </Switch>
                </Router>
            </PersistGate>
        );
    }
}

export default App;