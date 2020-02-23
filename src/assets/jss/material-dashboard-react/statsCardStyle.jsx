// ##############################
// // // StatsCard styles
// #############################

import {
    card,
    cardHeader,
    defaultFont,
    orangeCardHeader,
    greenCardHeader,
    redCardHeader,
    blueCardHeader,
    purpleCardHeader,
    cardActions,
    grayColor,
    warningColor,
    dangerColor,
    successColor,
    infoColor,
    primaryColor,
    roseColor
} from '../material-dashboard-react.js';

const statsCardStyle = {
    card: {
        ...card,
        overflow: 'visible'
    },
    cardHeader: {
        ...cardHeader,
        float: 'left',
        textAlign: 'center'
    },
    orangeCardHeader,
    greenCardHeader,
    redCardHeader,
    blueCardHeader,
    purpleCardHeader,
    cardContent: {
        textAlign: 'right',
        paddingTop: '10px',
        padding: '15px 20px'
    },
    cardIcon: {
        width: '40px!important',
        height: '36px!important',
        fill: '#fff!important'
    },
    cardAvatar: {
        margin: '8px'
    },
    cardCategory: {
        marginBottom: '0',
        color: grayColor[0],
        margin: '0 0 10px',
        ...defaultFont
    },
    cardTitle: {
        margin: '0',
        ...defaultFont,
        fontSize: '1.625em'
    },
    cardTitleSmall: {
        fontSize: '65%',
        fontWeight: '400',
        lineHeight: '1',
        color: '#777'
    },
    cardActions: {
        ...cardActions,
        padding: '0!important'
    },
    cardStats: {
        lineHeight: '22px',
        color: grayColor[0],
        fontSize: '12px',
        display: 'inline-block',
        margin: '0!important'
    },
    cardStatsIcon: {
        position: 'relative',
        top: '4px',
        width: '16px',
        height: '16px'
    },
    warningCardStatsIcon: {
        color: warningColor[0]
    },
    primaryCardStatsIcon: {
        color: primaryColor[0]
    },
    dangerCardStatsIcon: {
        color: dangerColor[0]
    },
    successCardStatsIcon: {
        color: successColor[0]
    },
    infoCardStatsIcon: {
        color: infoColor[0]
    },
    roseCardStatsIcon: {
        color: roseColor[0]
    },
    grayCardStatsIcon: {
        color: grayColor[0]
    },
    cardStatsLink: {
        color: primaryColor[0],
        textDecoration: 'none',
        ...defaultFont
    }
};

export default statsCardStyle;
