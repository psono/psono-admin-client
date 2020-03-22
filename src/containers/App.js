import React, { Component, Suspense } from 'react';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { HashLoader } from 'react-spinners';
import { createBrowserHistory } from 'history';
import { withStyles } from '@material-ui/core';
import { Router, Route, Switch } from 'react-router-dom';
import { matchPath } from 'react-router-dom';
import { compose } from 'redux';

import store from '../services/store';

import 'chartist/dist/chartist.min.css';
import 'chartist/dist/chartist.min.js';
import 'chartist-plugin-axistitle/dist/chartist-plugin-axistitle.min.js';
import 'font-awesome/css/font-awesome.min.css';

import 'clientjs/dist/client.min.js';
import '../assets/css/material-dashboard-react.css';
import mainRoutes from '../routes/main';
import logo from '../assets/img/logo.png';
import image from '../assets/img/background.jpg';

const hist = createBrowserHistory({
    basename: '/portal'
});

let persistor = persistStore(store);

const style = {
    wrapper: {
        position: 'relative',
        top: '0',
        height: '100vh',
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        display: 'flex',
        'justify-content': 'center',
        'align-items': 'center'
    },
    content: {
        width: '100%',
        height: '100%',
        'z-index': '3',
        content: '',
        opacity: '.8',
        position: 'absolute',
        background: '#000'
    }
};

class LoaderClass extends Component {
    render() {
        const { classes } = this.props;
        return (
            <div className={classes.wrapper}>
                <div className={classes.content} />
                <img src={logo} className="App-logo" alt="logo" />
                <div>loading...</div>
            </div>
        );
    }
}

const Loader = compose(withStyles(style))(LoaderClass);

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
            <Suspense fallback={<Loader />}>
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
            </Suspense>
        );
    }
}

export default App;
