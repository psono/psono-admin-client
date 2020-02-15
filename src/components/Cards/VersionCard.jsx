import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { compose } from 'redux';

import {
    InfoOutline,
    Warning,
    Done,
    Update,
    ThumbUp
} from '@material-ui/icons';

import StatsCard from './StatsCard';

class VersionCard extends React.Component {
    render() {
        const { t, used_version, latest_version, title } = this.props;
        if (!used_version || !latest_version) {
            return (
                <StatsCard
                    icon={Update}
                    iconColor="orange"
                    title={title}
                    description={t('LOADING')}
                    statIcon={Update}
                    statIconColor="gray"
                    statText={t('WAITING_FOR_VERSION')}
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
                    statText={t('UP_TO_DATE_GOOD_JOB_ADMIN')}
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
                    statText={
                        <Trans
                            i18nKey="VERSION_X_AVAILABLE"
                            latest_version={latest_version}
                        >
                            Version {{ latest_version }} available
                        </Trans>
                    }
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

export default compose(withTranslation())(VersionCard);
