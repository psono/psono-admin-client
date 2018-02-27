import React from 'react';
import PropTypes from 'prop-types';

import {Warning, Done, Update, Accessibility} from "material-ui-icons/index";

import StatsCard from './StatsCard';

class LicenseCard extends React.Component{
    render(){
        const { active, licensed, total } = this.props;

        let ratio = '' + active + '/' + total;
        let ratio_text = 'Active / Total';
        if (licensed) {
            ratio = ratio + '/' + licensed;
            ratio_text = ratio_text + '/ Licensed';
        }

        if (active === '') {
            return <StatsCard
                icon={Update}
                iconColor="orange"
                title="Users"
                description="waiting ..."
                statIcon={Update}
                statIconColor="gray"
                statText="Waiting for data ..."
            />
        } else if (licensed && active === licensed) {
            return <StatsCard
                icon={Accessibility}
                iconColor="red"
                title="Users"
                description={ratio}
                statIcon={Warning}
                statIconColor={'danger'}
                statLink={{text: ratio_text, href:"https://psono.com"}}
            />
        } else {
            return <StatsCard
                icon={Accessibility}
                iconColor="green"
                title="Users"
                description={ratio}
                statIcon={Done}
                statIconColor={'gray'}
                statText={ratio_text}
            />
        }
    }
}

LicenseCard.defaultProps = {
    iconColor: 'purple',
    statIconColor: 'gray'
};

LicenseCard.propTypes = {
    active: PropTypes.node,
    total: PropTypes.node,
    licensed: PropTypes.node,
    valid_from: PropTypes.node,
    valid_till: PropTypes.node,
};

export default LicenseCard;
