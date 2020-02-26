// ##############################
// // // ChartCard styles
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

const chartCardStyle = {
    card: {
        ...card,
        overflow: 'visible'
    },
    cardHeader: {
        ...cardHeader,
        padding: '0',
        minHeight: '160px',
        ...defaultFont
    },
    orangeCardHeader,
    greenCardHeader,
    redCardHeader,
    blueCardHeader,
    purpleCardHeader,
    cardContent: {
        padding: '15px 20px'
    },
    cardTitle: {
        marginTop: '0',
        marginBottom: '5px',
        ...defaultFont,
        fontSize: '1.175em'
    },
    cardCategory: {
        marginBottom: '0',
        color: grayColor[0],
        ...defaultFont,
        fontSize: '0.9em'
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

export default chartCardStyle;
