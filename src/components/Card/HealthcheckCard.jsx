import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { Warning, Done, Update, Favorite } from '@material-ui/icons';

import StatsCard from './StatsCard';

const HealthcheckCard = (props) => {
    const { t } = useTranslation();
    const { healthcheck, title, sub_title_success, sub_title_error } = props;

    const sub_title = healthcheck ? sub_title_success : sub_title_error;

    if (typeof healthcheck === 'undefined') {
        return (
            <StatsCard
                icon={Update}
                iconColor="orange"
                title={title}
                description={t('LOADING')}
                statIcon={Update}
                statIconColor="gray"
                statText={t('WAITING_FOR_DATA')}
            />
        );
    } else if (!healthcheck) {
        return (
            <StatsCard
                icon={Favorite}
                iconColor="red"
                title={title}
                description={t('UNHEALTHY')}
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
                description={t('HEALTHY')}
                statIcon={Done}
                statIconColor={'gray'}
                statText={sub_title}
            />
        );
    }
};

HealthcheckCard.defaultProps = {
    iconColor: 'purple',
    statIconColor: 'gray',
};

HealthcheckCard.propTypes = {
    title: PropTypes.node,
    sub_title_success: PropTypes.node,
    sub_title_error: PropTypes.node,
};

export default HealthcheckCard;
