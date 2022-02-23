import React from 'react';
import AddAlert from '@material-ui/icons/AddAlert';
import { useSelector } from 'react-redux';

import notification from '../../services/notification';

import { Snackbar } from '../index';
import { useTranslation } from 'react-i18next';

export default function Notification(props) {
    const { t } = useTranslation();

    const messages = useSelector(state => state.notification.messages);

    return messages.map((message, index) => {
        let icon;
        let color;
        if (message.type === 'info') {
            icon = AddAlert;
            color = 'info';
        } else if (message.type === 'danger') {
            icon = AddAlert;
            color = 'danger';
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
                message={t(message.text)}
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
