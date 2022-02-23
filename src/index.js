import React from 'react';
import ReactDOM from 'react-dom';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import 'moment-timezone';

import i18n from './i18n';

import App from './containers/App';
import worker from './services/worker';
import store from './services/store';

/**
 * @typedef {Object} PublicPrivateKeyPair
 * @property {string} public_key The public key (hex encoded)
 * @property {string} private_key The private key (hex encoded)
 *
 * @typedef {Object} EncryptedValue
 * @property {string} text The public key (hex encoded)
 * @property {string} nonce The private key (hex encoded)
 *
 * @typedef {string} uuid
 *
 * @typedef {Object} SplittedUrl
 * @property {string} scheme The scheme e.g. 'http' or 'ftps'
 * @property {string} authority The scheme e.g. 'test.example.com:6000'
 * @property {string} full_domain The full domain e.g. 'test.example.com'
 * @property {string} top_domain The top level domain e.g. 'example.com'
 * @property {string} port The port e.g. '6000'
 * @property {string} port The path e.g. '/url-part/'
 * @property {string} port The query, evething after '?' e.g. 'myFunnyParameter=test'
 * @property {string} port The query, evething after '#' e.g. 'anotherParameter=test'
 *
 * @typedef {Object} TreeObject
 * @property {uuid} [datastore_id] The datastore id if its the top
 * @property {uuid} [parent_datastore_id] The parent datastore id
 * @property {uuid} [parent_share_id] The parent share id
 * @property {object} [share_rights] All the share rights in an object
 * @property {boolean} [expanded] Is the folder expanded or not
 * @property {Array} [items] The items in the tree object
 * @property {Array} [folders] The folders in the tree object containing other TreeObject
 * @property {Object} [share_index] The share index
 *
 * @typedef {Object} RightObject
 * @property {boolean} read The read rights
 * @property {boolean} write The write rights
 * @property {boolean} grant The grant rights
 * @property {boolean} [delete] The delete rights
 *
 */

import './assets/css/material-dashboard-react.css';

ReactDOM.render(
    <Provider store={store}>
        <I18nextProvider i18n={i18n}>
            <App />
        </I18nextProvider>
    </Provider>,
    document.getElementById('root')
);
worker.register();
