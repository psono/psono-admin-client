/**
 * Gitlab service, that implements the Gitlab API
 */

const BASE_URL = 'https://static.psono.com';

/**
 *
 * Ajax GET request to download a ressource from static.psono.com
 *
 * @param {string} ressource The "url" part to return
 *
 * @returns {Promise<string>} promise
 */
async function get(ressource) {
    const response = await fetch(BASE_URL + ressource);
    return await response.json();
}

const service = {
    get,
};

export default service;
