import React from 'react';
import PropTypes from 'prop-types';

import {
    InfoOutline,
    Warning,
    Done,
    Update,
    ThumbUp
} from 'material-ui-icons/index';

import StatsCard from './StatsCard';

class VersionCard extends React.Component {
    render() {
        const { used_version, latest_version, title } = this.props;
        if (!used_version || !latest_version) {
            return (
                <StatsCard
                    icon={Update}
                    iconColor="orange"
                    title={title}
                    description="waiting ..."
                    statIcon={Update}
                    statIconColor="gray"
                    statText="Waiting for version ..."
                />
            );
        } else if (used_version === latest_version) {
            return (
                <StatsCard
                    icon={ThumbUp}
                    iconColor="green"
                    title={title}
                    description={used_version}
                    statIcon={Done}
                    statText="Up to date, good job admin!"
                />
            );
        } else {
            return (
                <StatsCard
                    icon={InfoOutline}
                    iconColor="red"
                    title={title}
                    description={used_version}
                    statIcon={Warning}
                    statIconColor="danger"
                    statText={'Version ' + latest_version + ' available'}
                />
            );
        }
    }
}

VersionCard.defaultProps = {
    iconColor: 'purple',
    statIconColor: 'gray'
};

VersionCard.propTypes = {
    title: PropTypes.node.isRequired,
    used_version: PropTypes.node.isRequired,
    latest_version: PropTypes.node.isRequired
};

export default VersionCard;
