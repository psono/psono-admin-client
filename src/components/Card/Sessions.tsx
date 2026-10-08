import React from 'react';

import { Update, Accessibility } from '@mui/icons-material';
import StatsCard from './StatsCard';

export interface SessionsProps {
    users?: any;
    devices?: any;
    total?: any;
}
const Sessions = ({ users, devices, total }: SessionsProps) => {
    if (users === '' || devices === '' || total === '') {
        return (
            <StatsCard
                icon={Update}
                iconColor="orange"
                title="Sessions"
                description=""
                statIcon={Update}
                statIconColor="gray"
                statText="Waiting for data ..."
            />
        );
    } else {
        return (
            <StatsCard
                icon={Accessibility}
                iconColor="green"
                title="Sessions"
                description={`${total}/${users}/${devices}`}
                statIcon={Update}
                statText="Total / Users / Devices"
            />
        );
    }
};

Sessions.defaultProps = {
    iconColor: 'purple',
    statIconColor: 'gray',
};

export default Sessions;
