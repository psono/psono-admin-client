import action from '../actions/boundActionCreators';

/**
 * Sends an info message
 *
 * @param {array} message The message to send
 */
function info_send(message) {
    action.send_notification(message, 'info');
}

/**
 * Sends an info message
 *
 * @param {array} message The message to send
 */
function error_send(message) {
    action.send_notification(message, 'danger');
}

/**
 * Resets messages
 */
function reset() {
    action.set_notifications([]);
}

/**
 * Resets messages
 */
function set(messages) {
    action.set_notifications(messages);
}

const service = {
    info_send,
    error_send,
    reset,
    set,
};

export default service;
