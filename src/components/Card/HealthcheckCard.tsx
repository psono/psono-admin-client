import React from 'react';

import { useTranslation } from 'react-i18next';

import { Warning, Done, Update, Favorite } from '@mui/icons-material';

import StatsCard from './StatsCard';

export interface HealthcheckCardProps {
    healthcheck?: any;
    title?: React.ReactNode;
    sub_title_success?: any;
    sub_title_error?: any;
}
const HealthcheckCard = (props: HealthcheckCardProps) => {
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

export default HealthcheckCard;
