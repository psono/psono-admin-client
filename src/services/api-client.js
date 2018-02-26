/**
 * Client service for the psono web client
 */

import axios from 'axios';
import store from './store'

function get_version() {
    console.log(store.getState().user.web_client);
}

const client = {
    get_version,
};

export default client;