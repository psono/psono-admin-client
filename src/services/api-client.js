/**
 * Client service for the psono web client
 */

import axios from 'axios';
import action from '../actions/boundActionCreators';
import store from './store';

function get_version() {
    const client_url = store.getState().client.url;
    return axios.get(client_url + '/VERSION.txt?t=' + new Date().getTime());
}

function set_url(url) {
    action.set_client_url(url);
}

const service = {
    get_version,
    set_url,
};

export default service;
