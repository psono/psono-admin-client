import action from '../actions/boundActionCreators';

/**
 * Sends an info message
 *
 * @param {array} message The message to send
 */
function info_send(message) {
    action.sendNotification(message, 'info');
}

/**
 * Sends an info message
 *
 * @param {array} message The message to send
 */
function error_send(message) {
    action.sendNotification(message, 'danger');
}

/**
 * Resets messages
 */
function reset() {
    action.setNotifications([]);
}

/**
 * Resets messages
 */
function set(messages) {
    action.setNotifications(messages);
}

const service = {
    info_send,
    error_send,
    reset,
    set,
};

export default service;
