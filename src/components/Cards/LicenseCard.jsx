import React from 'react';
import PropTypes from 'prop-types';

import {Warning, Done, Update, Accessibility} from "material-ui-icons/index";

import StatsCard from './StatsCard';

class LicenseCard extends React.Component{
    render(){
        const { current_users, max_users } = this.props;

        if (! current_users) {
            return <StatsCard
                icon={Update}
                iconColor="orange"
                title="Registrations"
                description="waiting ..."
                statIcon={Update}
                statIconColor="gray"
                statText="Waiting for users ..."
            />
        } else if (max_users && current_users === max_users) {
            return <StatsCard
                icon={Accessibility}
                iconColor="orange"
                title="Registrations"
                description={this.state.server_license_ratio}
                small="users"
                statIcon={Warning}
                statIconColor={this.state.server_license_stat_icon}
                statLink={{text: "Upgrade your license...", href:"https://psono.com"}}
            />
        } else if (max_users) {
            return <StatsCard
                icon={Accessibility}
                iconColor="orange"
                title="Registrations"
                description={this.state.server_license_ratio}
                small="users"
                statIcon={Warning}
                statIconColor={this.state.server_license_stat_icon}
                statText={'Registered users'}
            />
        } else {
            return <StatsCard
                icon={Accessibility}
                iconColor="orange"
                title="Registrations"
                description={current_users}
                small="users"
                statIcon={Done}
                statText={'Registered users'}
            />

        }
    }
}

LicenseCard.defaultProps = {
    iconColor: 'purple',
    statIconColor: 'gray'
};

LicenseCard.propTypes = {
    current_users: PropTypes.node.isRequired,
    max_users: PropTypes.node,
    valid_from: PropTypes.node,
    valid_till: PropTypes.node,
};

export default LicenseCard;
