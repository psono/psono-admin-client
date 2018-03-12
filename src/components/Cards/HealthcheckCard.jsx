import React from 'react';
import PropTypes from 'prop-types';

import { Warning, Done, Update, Favorite } from 'material-ui-icons';

import StatsCard from './StatsCard';

class LicenseCard extends React.Component {
    render() {
        const {
            healthcheck,
            title,
            sub_title_success,
            sub_title_error
        } = this.props;

        const sub_title = healthcheck ? sub_title_success : sub_title_error;

        if (typeof healthcheck === 'undefined') {
            return (
                <StatsCard
                    icon={Update}
                    iconColor="orange"
                    title={title}
                    description="loading"
                    statIcon={Update}
                    statIconColor="gray"
                    statText="Waiting for data ..."
                />
            );
        } else if (!healthcheck) {
            return (
                <StatsCard
                    icon={Favorite}
                    iconColor="red"
                    title={title}
                    description={'Unhealthy'}
                    statIcon={Warning}
                    statIconColor={'danger'}
                    statText={sub_title}
                />
            );
        } else {
            return (
                <StatsCard
                    icon={Favorite}
                    iconColor="green"
                    title={title}
                    description={'Healthy'}
                    statIcon={Done}
                    statIconColor={'gray'}
                    statText={sub_title}
                />
            );
        }
    }
}

LicenseCard.defaultProps = {
    iconColor: 'purple',
    statIconColor: 'gray'
};

LicenseCard.propTypes = {
    title: PropTypes.node,
    sub_title_success: PropTypes.node,
    sub_title_error: PropTypes.node
};

export default LicenseCard;
