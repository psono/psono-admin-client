/**
 * Helper Service
 */

/**
 * Checks weather a string is a valid ipv4 address
 *
 * @param {string} address An potential ipv4 address that we want to check as string
 * @returns {boolean} Returns the split up url
 */
function is_ipv4_address(address) {
    return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
        address
    );
}

/**
 * parses an URL and returns an object with all details separated
 *
 * @param {url} url The url to be parsed
 * @returns {SplittedUrl} Returns the split up url
 */
function parse_url(url) {
    let authority;
    let splitted_authority;
    let splitted_domain;
    let full_domain;
    let top_domain;
    let base_url;
    let schema;
    let port = null;

    // According to RFC http://www.ietf.org/rfc/rfc3986.txt Appendix B
    let pattern = new RegExp(
        '^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?'
    );
    let matches = url.match(pattern);

    schema = matches[2];
    base_url = matches[2] + '://';

    if (typeof matches[4] !== 'undefined') {
        base_url = base_url + matches[4];
        authority = matches[4].replace(/^(www\.)/, '');
        splitted_authority = authority.split(':');
    }

    if (
        typeof splitted_authority !== 'undefined' &&
        splitted_authority.length === 2
    ) {
        port = splitted_authority[splitted_authority.length - 1];
    }
    if (typeof splitted_authority !== 'undefined') {
        splitted_domain = splitted_authority[0].split('.');
        full_domain = splitted_authority[0];
    }

    if (
        typeof splitted_domain !== 'undefined' &&
        is_ipv4_address(full_domain)
    ) {
        top_domain = full_domain;
    } else if (typeof splitted_domain !== 'undefined') {
        if (splitted_domain.length > 1) {
            top_domain =
                splitted_domain[splitted_domain.length - 2] +
                '.' +
                splitted_domain[splitted_domain.length - 1];
        } else {
            top_domain = splitted_domain[splitted_domain.length - 1];
        }
    }

    return {
        scheme: schema,
        base_url: base_url,
        authority: authority, //remove leading www.
        full_domain: full_domain,
        top_domain: top_domain,
        port: port,
        path: matches[5],
        query: matches[7],
        fragment: matches[9]
    };
}

/**
 * Parses an URL to get the full domain from it.
 * example: https://docs.google.com -> docs.google.com
 *
 * @param {url} url The URL we want to parse
 * @returns {string} The full domain of the url
 */
function get_domain(url) {
    const parsed_url = parse_url(url);
    return parsed_url.full_domain;
}

/**
 * Checks if array1 starts with array2
 *
 * @param {array} array1 The array that should contain array2
 * @param {array} array2 The array that should be part of array1
 * @returns {boolean} Returns if array1 starts with array2
 */
function array_starts_with(array1, array2) {
    if (!(array1 instanceof Array)) {
        return false;
    }
    if (!(array2 instanceof Array)) {
        return false;
    }

    if (array1.length < array2.length) {
        return false;
    }

    for (let i = 0; i < array1.length; i++) {
        if (i === array2.length) {
            return true;
        }
        if (array1[i] instanceof Array && array2[i] instanceof Array) {
            if (!array1[i].equals(array2[i])) {
                return false;
            }
        } else if (array1[i] !== array2[i]) {
            return false;
        }
    }
    return true;
}

/**
 * Creates a list of items that are in a given datastore tree object
 *
 * @param {object} obj The datastore tree object
 * @param {array} list The list object we want to fill
 */
function create_list(obj, list) {
    let i;
    for (i = 0; obj.items && i < obj.items.length; i++) {
        list.push(obj.items[i]);
    }
    for (i = 0; obj.folders && i < obj.folders.length; i++) {
        create_list(obj.folders[i], list);
    }
}

/**
 * Takes an object and duplicates it
 *
 * @param {*} obj initial object that we want to duplicate
 *
 * @returns {*} Returns a duplicate of object
 */
function duplicate_object(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Checks that the username does not start with forbidden chars
 *
 * @param {string} username The username
 * @param {Array} forbidden_chars The forbidden chars
 * @returns {string} The error message, if it matches
 */
function validate_username_start(username, forbidden_chars) {
    for (let i = 0; i < forbidden_chars.length; i++) {
        if (
            username.substring(0, forbidden_chars[i].length) ===
            forbidden_chars[i]
        ) {
            return 'Usernames may not start with "' + forbidden_chars[i] + '"';
        }
    }
}

/**
 * Checks that the username does not end with forbidden chars
 *
 * @param {string} username The username
 * @param {Array} forbidden_chars The forbidden chars
 * @returns {string} The error message, if it matches
 */
function validate_username_end(username, forbidden_chars) {
    for (let i = 0; i < forbidden_chars.length; i++) {
        if (
            username.substring(username.length - forbidden_chars[i].length) ===
            forbidden_chars[i]
        ) {
            return 'Usernames may not end with "' + forbidden_chars[i] + '"';
        }
    }
}

/**
 * Checks that the username does not contain forbidden chars
 *
 * @param {string} username The username
 * @param {Array} forbidden_chars The forbidden chars
 * @returns {string} The error message, if it matches
 */
function validate_username_contain(username, forbidden_chars) {
    for (let i = 0; i < forbidden_chars.length; i++) {
        if (username.indexOf(forbidden_chars[i]) !== -1) {
            return 'Usernames may not contain "' + forbidden_chars[i] + '"';
        }
    }
}

/**
 * Checks that the group name does not contain forbidden chars
 *
 * @param {string} group_name The group name
 * @param {Array} forbidden_chars The forbidden chars
 * @returns {string} The error message, if it matches
 */
function validate_group_name_contain(group_name, forbidden_chars) {
    for (let i = 0; i < forbidden_chars.length; i++) {
        if (group_name.indexOf(forbidden_chars[i]) !== -1) {
            return 'Group name may not contain "' + forbidden_chars[i] + '"';
        }
    }
}

/**
 * Forms the full username out of the username (potentially already containing an  @domain part) and a domain
 *
 * @param {string} username The username
 * @param {string} domain The domain part of the username
 * @returns {string} The full username
 */
function form_full_username(username, domain) {
    if (username.indexOf('@') === -1) {
        return username + '@' + domain;
    } else {
        return username;
    }
}

/**
 * Determines if the username is a valid username (validates only the front part before any @).
 * If yes the function returns true. If not, the function returns an error string
 *
 * @param {string} username A string that could be a valid username
 *
 * @returns {boolean|string} Returns true or a string with the error
 */
function is_valid_username(username) {
    const res = username.split('@');
    username = res[0];

    const USERNAME_REGEXP = /^[a-z0-9.-]*$/i;
    let error;
    if (!USERNAME_REGEXP.test(username)) {
        return 'Usernames may only contain letters, numbers, periods and dashes';
    }

    if (username.length < 3) {
        return 'Usernames may not be shorter than 3 chars';
    }

    error = validate_username_start(username, ['.', '-']);
    if (error) {
        return error;
    }

    error = validate_username_end(username, ['.', '-']);
    if (error) {
        return error;
    }

    error = validate_username_contain(username, ['..', '--', '.-', '-.']);
    if (error) {
        return error;
    }

    return true;
}

/**
 * Determines if the group name is a valid group name. It should not contain "@" and be shorter than 3 chars
 *
 * @param {string} group_name A string that could be a valid group name
 *
 * @returns {boolean|string} Returns true or a string with the error
 */
function is_valid_group_name(group_name) {
    let error;

    if (group_name.length < 3) {
        return 'Group name may not be shorter than 3 chars';
    }

    error = validate_group_name_contain(group_name, ['@']);
    if (error) {
        return error;
    }

    return true;
}

/**
 * Determines if the password is a valid password.
 * If yes the function returns true. If not, the function returns an error string
 *
 * @param {string} password A string that could be a valid password
 * @param {string} password2 The second password that needs to match the first
 *
 * @returns {boolean|string} Returns true or a string with the error
 */
function is_valid_password(password, password2) {
    if (password.length < 12) {
        return 'Password too short (min 12 chars).';
    }

    if (password !== password2) {
        return "Passwords don't match.";
    }
    return true;
}

/**
 * Splits a string into several chunks
 *
 * @param {string} str The string to split
 * @param {int} len The length of the chunks
 *
 * @returns {Array} Returns the chunks with length "len" as array
 */
function split_string_in_chunks(str, len) {
    const size = Math.ceil(str.length / len);
    const chunks = new Array(size);
    let offset = 0;

    for (let i = 0; i < size; ++i, offset += len) {
        chunks[i] = str.substring(offset, offset + len);
    }

    return chunks;
}

/**
 * Search an array for an item
 *
 * @param {Array} array The array to search
 * @param {*} search The item to remove
 * @param {function|undefined} [cmp_fct] (optional) Compare function
 */
function remove_from_array(array, search, cmp_fct) {
    if (!array) {
        return;
    }
    if (typeof cmp_fct === 'undefined') {
        cmp_fct = function(a, b) {
            return a === b;
        };
    }
    for (let i = array.length - 1; i >= 0; i--) {
        if (cmp_fct(array[i], search)) {
            array.splice(i, 1);
        }
    }
}

/**
 * Copies some content to the clipboard
 *
 * @param {string} content The content to copy
 */
function copy_to_clipboard(content) {
    const copy = function(e) {
        e.preventDefault();
        if (e.clipboardData) {
            e.clipboardData.setData('text/plain', content);
        } else if (window.clipboardData) {
            window.clipboardData.setData('Text', content);
        }
    };

    document.addEventListener('copy', copy);
    document.execCommand('copy');
    document.removeEventListener('copy', copy);
}

/**
 * Checks if a string ends with a special suffix
 *
 * @param {string} to_test The string to test if it ends with the provided suffix
 * @param {string} suffix The suffix we want the string to end with
 *
 * @returns {boolean} Whether the string ends with the suffix or not
 */
function endsWith(to_test, suffix) {
    return (
        suffix !== '' &&
        to_test.indexOf(suffix, to_test.length - suffix.length) !== -1
    );
}

/**
 * Returns a test function that can be used to filter according to the name and urlfilter
 *
 * @param {string} test Testable string
 */
function get_password_filter(test) {
    const regex = new RegExp(
        test.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1'),
        'i'
    );

    return function(datastore_entry) {
        return (
            regex.test(datastore_entry.name) ||
            regex.test(datastore_entry.urlfilter)
        );
    };
}

const service = {
    parse_url,
    get_domain,
    array_starts_with,
    create_list,
    duplicate_object,
    form_full_username,
    validate_group_name_contain,
    is_valid_username,
    is_valid_group_name,
    is_valid_password,
    split_string_in_chunks,
    remove_from_array,
    copy_to_clipboard,
    endsWith,
    get_password_filter
};

export default service;
