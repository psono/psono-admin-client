/**
 * Client service for the psono web client
 */

import store from './store';

async function getVersion() {
    const client_url = store.getState().server.web_client;
    const response = await fetch(
        client_url + '/VERSION.txt?t=' + new Date().getTime()
    );
    return await response.text();
}

const service = {
    getVersion,
};

export default service;
