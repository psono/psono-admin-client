import React from 'react';
import { AddAlert } from 'material-ui-icons';

import notification from '../../services/notification';

import { Snackbar } from '../index';

class Notifications extends React.Component {
    render() {
        const messages = this.props.state.notification.messages;

        return messages.map((message, index) => {
            let icon;
            let color;
            if (message.type === 'info') {
                icon = AddAlert;
                color = 'info';
            } else {
                console.log(message);
                // TODO add other notification types
            }

            return (
                <Snackbar
                    place="tr"
                    color={color}
                    icon={icon}
                    key={index}
                    message={message.text}
                    open={message.text !== ''}
                    closeNotification={() => {
                        const new_messages = messages;
                        new_messages.splice(index, 1);
                        notification.set(new_messages);
                    }}
                    close
                />
            );
        }, this);
    }
}

export default Notifications;
