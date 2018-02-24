const helper = {


    /**
     * Checks weather a string is a valid ipv4 address
     *
     * @param {string} address An potential ipv4 address that we want to check as string
     * @returns {boolean} Returns the split up url
     */
    is_ipv4_address(address) {
        return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(address);
    }

    /**
     * parses an URL and returns an object with all details separated
     *
     * @param {url} url The url to be parsed
     * @returns {SplittedUrl} Returns the split up url
     */
    parse_url(url) {
        let authority;
        let splitted_authority;
        let splitted_domain;
        let full_domain;
        let top_domain;
        let port = null;

        // According to RFC http://www.ietf.org/rfc/rfc3986.txt Appendix B
        const pattern = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?");
        const matches =  url.match(pattern);

        if (typeof(matches[4]) !== 'undefined') {
            authority = matches[4].replace(/^(www\.)/,"");
            splitted_authority = authority.split(":");
        }

        if (typeof(splitted_authority) !== 'undefined' && splitted_authority.length === 2) {
            port = splitted_authority[splitted_authority.length - 1];
        }
        if (typeof(splitted_authority) !== 'undefined') {
            splitted_domain = splitted_authority[0].split(".");
            full_domain = splitted_authority[0];
        }

        if (typeof(splitted_domain) !== 'undefined' && is_ipv4_address(full_domain)) {
            top_domain = full_domain
        } else if(typeof(splitted_domain) !== 'undefined') {
            top_domain = splitted_domain[splitted_domain.length - 2] + '.' + splitted_domain[splitted_domain.length - 1];
        }

        return {
            scheme: matches[2],
            authority: authority, //remove leading www.
            full_domain: full_domain,
            top_domain: top_domain,
            port: port,
            path: matches[5],
            query: matches[7],
            fragment: matches[9]
        };
    },
    /**
     *
     * @param url
     * @returns {*}
     */
    get_domain (url) {
        const parsed_url = parse_url(url);
        return parsed_url.full_domain;
    },

    /**
     * Checks that the username does not start with forbidden chars
     *
     * @param {string} username The username
     * @param {Array} forbidden_chars The forbidden chars
     * @returns {string} The error message, if it matches
     */
    validate_username_start(username, forbidden_chars) {
        for (let i = 0; i < forbidden_chars.length; i++) {
            if (username.substring(0, forbidden_chars[i].length) === forbidden_chars[i]) {
                return 'Usernames may not start with "'+ forbidden_chars[i] +'"';
            }
        }
    },

    /**
     * Checks that the username does not end with forbidden chars
     *
     * @param {string} username The username
     * @param {Array} forbidden_chars The forbidden chars
     * @returns {string} The error message, if it matches
     */
    validate_username_end(username, forbidden_chars) {
        for (let i = 0; i < forbidden_chars.length; i++) {
            if (username.substring(username.length - forbidden_chars[i].length) === forbidden_chars[i]) {
                return 'Usernames may not end with "'+ forbidden_chars[i] +'"';
            }
        }
    },

    /**
     * Checks that the username does not contain forbidden chars
     *
     * @param {string} username The username
     * @param {Array} forbidden_chars The forbidden chars
     * @returns {string} The error message, if it matches
     */
    validate_username_contain(username, forbidden_chars) {
        for (let i = 0; i < forbidden_chars.length; i++) {
            if (username.indexOf(forbidden_chars[i]) !== -1) {
                return 'Usernames may not contain "'+ forbidden_chars[i] +'"';
            }
        }
    },

    /**
     * Checks that the group name does not contain forbidden chars
     *
     * @param {string} group_name The group name
     * @param {Array} forbidden_chars The forbidden chars
     * @returns {string} The error message, if it matches
     */
    validate_group_name_contain(group_name, forbidden_chars) {
        for (let i = 0; i < forbidden_chars.length; i++) {
            if (group_name.indexOf(forbidden_chars[i]) !== -1) {
                return 'Group name may not contain "'+ forbidden_chars[i] +'"';
            }
        }
    },

    /**
     * Forms the full username out of the username (potentially already containing an  @domain part) and a domain
     *
     * @param {string} username The username
     * @param {string} domain The domain part of the username
     * @returns {string} The full username
     */
    form_full_username(username, domain) {
        if (username.indexOf('@') === -1){
            return username + '@' + domain;
        } else {
            return username;
        }
    },

    /**
     * Determines if the username is a valid username (validates only the front part before any @).
     * If yes the function returns true. If not, the function returns an error string
     *
     * @param {string} username A string that could be a valid username
     *
     * @returns {boolean|string} Returns true or a string with the error
     */
    is_valid_username(username) {

        const res = username.split("@");
        username = res[0];

        const USERNAME_REGEXP = /^[a-z0-9.\-]*$/i;
        let error;
        if( ! USERNAME_REGEXP.test(username)) {
            return 'Usernames may only contain letters, numbers, periods and dashes';
        }

        if (username.length < 3) {
            return 'Usernames may not be shorter than 3 chars';
        }

        error = validate_username_start(username, [".", "-"]);
        if (error) {
            return error;
        }

        error = validate_username_end(username, [".", "-"]);
        if (error) {
            return error;
        }

        error = validate_username_contain(username, ["..", "--", '.-', '-.']);
        if (error) {
            return error;
        }

        return true;
    },
};

export default helper;