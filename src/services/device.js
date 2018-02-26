import client_js from './clientjs'

let fingerprint;

activate();
function activate() {
    get_device_fingerprint_async().then(function(local_fingerprint){
        fingerprint = local_fingerprint;
    })
}


/**
 * Returns the device fingerprint
 *
 * @returns Promise<AxiosResponse<any>> Returns promise with the device fingerprint
 */
function get_device_fingerprint_async() {

    return new Promise((resolve, reject) => {
        resolve(client_js.getFingerprint());
    });
}

/**
 * Returns the device fingerprint
 *
 * @returns {string} Fingerprint of the device
 */
function get_device_fingerprint() {
    if (fingerprint) {
        return fingerprint;
    }
    fingerprint = client_js.getFingerprint();
    return fingerprint;
}

/**
 * Returns weather we have an IE or not
 *
 * @returns {boolean} Is this an IE user
 */
function is_ie() {
    return client_js.isIE();
}

/**
 * Returns weather we have a Chrome or not
 *
 * @returns {boolean} Is this an Chrome user
 */
function is_chrome() {
    return client_js.isChrome();
}

/**
 * Returns weather we have a Firefox or not
 *
 * @returns {boolean} Is this an Firefox user
 */
function is_firefox() {
    return client_js.isFirefox();
}

/**
 * Returns weather we have a Safari or not
 *
 * @returns {boolean} Is this an Safari user
 */
function is_safari() {
    return client_js.isSafari();
}

/**
 * Returns weather we have a Opera or not
 *
 * @returns {boolean} Is this an Opera user
 */
function is_opera() {
    return client_js.isOpera();
}

/**
 * Generates the Device description out of the Vendor, OS, Version and others
 *
 * @returns {string} Returns the device's description
 */
function get_device_description() {
    let description = '';
    if (typeof(client_js.getDeviceVendor()) !== 'undefined') {
        description = description + client_js.getDeviceVendor() + ' ';
    }
    if (typeof(client_js.getDevice()) !== 'undefined') {
        description = description + client_js.getDevice() + ' ';
    }
    if (typeof(client_js.getOS()) !== 'undefined') {
        description = description + client_js.getOS() + ' ';
    }
    if (typeof(client_js.getOSVersion()) !== 'undefined') {
        description = description + client_js.getOSVersion() + ' ';
    }
    if (typeof(client_js.getBrowser()) !== 'undefined') {
        description = description + client_js.getBrowser() + ' ';
    }
    if (typeof(client_js.getBrowserVersion()) !== 'undefined') {
        description = description + client_js.getBrowserVersion() + ' ';
    }
    return description
}


const service = {
    get_device_fingerprint: get_device_fingerprint,
    is_ie: is_ie,
    is_chrome: is_chrome,
    is_firefox: is_firefox,
    is_safari: is_safari,
    is_opera: is_opera,
    get_device_description: get_device_description,
};

export default service;
