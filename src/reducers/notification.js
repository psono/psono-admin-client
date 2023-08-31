import { NOTIFICATION_SEND, NOTIFICATION_SET } from '../actions/actionTypes';

function notification(
    state = {
        messages: [],
    },
    action
) {
    switch (action.type) {
        case NOTIFICATION_SEND:
            const new_messages = state.messages;
            new_messages.push({
                text: action.message,
                type: action.message_type,
            });

            return Object.assign({}, state, {
                messages: new_messages,
            });
        case NOTIFICATION_SET:
            return Object.assign({}, state, {
                messages: action.messages,
            });
        default:
            return state;
    }
}

export default notification;
