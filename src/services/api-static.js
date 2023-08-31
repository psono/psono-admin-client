/**
 * Gitlab service, that implements the Gitlab API
 */

import axios from 'axios';
//import store from './store';

const BASE_URL = 'https://static.psono.com';

/**
 *
 * Ajax GET request to download a ressource from static.psono.com
 *
 * @param {string} ressource The "url" part to return
 *
 * @returns {Promise<AxiosResponse<any>>} promise
 */
function get(ressource) {
    return axios.get(BASE_URL + ressource);
}

const service = {
    get,
};

export default service;
