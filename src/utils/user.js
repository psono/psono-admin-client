const user = {
    /**
     * Login Request
     *
     * @param username {string} username The username of the user
     * @param password {string} password The password of the user
     * @param callback {Function} callback Called after a user was logged in on the remote server
     */
    login(username, password, callback) {
        if (this.loggedIn()) {
            callback(true);
            return;
        }
        callback(true);
        // request.post('/login', { username, password }, (response) => {
        //     if (response.authenticated) {
        //         localStorage.token = response.token;
        //         callback(true);
        //     } else {
        //         callback(false, response.error);
        //     }
        // });
    },

    /**
     * Logout request
     * @param callback {Function} callback Called after a user was logged out on the remote server
     */
    logout(callback) {
        callback(true);
        // request.post('/logout', {}, () => {
        //     callback(true);
        // });
    },
    /**
     * Checks if the user is logged in
     *
     * @return {boolean} True if there is a logged in user, otherwise false
     */
    isLoggedIn() {
	return true;
        return !!localStorage.token;
    },
};

export default user;
