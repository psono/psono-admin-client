import React from 'react';
import PropTypes from 'prop-types';

import {Update, Accessibility} from "material-ui-icons/index";

import StatsCard from './StatsCard';

class Sessions extends React.Component{
    render(){
        const { users, devices, total } = this.props;

        if (users === '' || devices === '' || total === '') {
            return <StatsCard
                icon={Update}
                iconColor="orange"
                title="Sessions"
                description="waiting ..."
                statIcon={Update}
                statIconColor="gray"
                statText="Waiting for data ..."
            />
        } else {
            return <StatsCard
                icon={Accessibility}
                iconColor="green"
                title="Sessions"
                description={total + '/' + users + '/' + devices}
                statIcon={Update}
                statText="Total / Users / Devices"
            />

        }
    }
}

Sessions.defaultProps = {
    iconColor: 'purple',
    statIconColor: 'gray'
};

Sessions.propTypes = {
    users: PropTypes.node,
    devices: PropTypes.node,
    total: PropTypes.node,
};

export default Sessions;
