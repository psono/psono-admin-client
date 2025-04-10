import React from 'react';
import PropTypes from 'prop-types';
import { Trans, useTranslation } from 'react-i18next';

import {
    InfoOutlined,
    Warning,
    Done,
    Update,
    ThumbUp,
} from '@material-ui/icons';

import StatsCard from './StatsCard';

function VersionCard(props) {
    const { t } = useTranslation();
    const { used_version, latest_version, title } = props;
    if (!used_version || !latest_version) {
        return (
            <StatsCard
                icon={Update}
                iconColor="orange"
                title={title}
                description={used_version || t('LOADING')}
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
                icon={InfoOutlined}
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

VersionCard.defaultProps = {
    iconColor: 'purple',
    statIconColor: 'gray',
};

VersionCard.propTypes = {
    title: PropTypes.node.isRequired,
    used_version: PropTypes.node.isRequired,
    latest_version: PropTypes.node.isRequired,
};

export default VersionCard;
