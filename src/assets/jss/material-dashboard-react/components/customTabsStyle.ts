import { createStyles } from '@mui/styles';
import { hexToRgb, whiteColor } from '../../material-dashboard-react';

const customTabsStyle = createStyles({
    cardTitle: {
        float: 'left',
        padding: '10px 10px 10px 0px',
        lineHeight: '24px',
    },
    cardTitleRTL: {
        float: 'right',
        padding: '10px 0px 10px 10px !important',
    },
    displayNone: {
        display: 'none !important',
    },
    tabsRoot: {
        minHeight: 'unset !important',
        overflowX: 'visible',
        '& $tabRootButton': {
            fontSize: '12px',
        },
    },
    tabRootButton: {
        minHeight: 'unset !important',
        minWidth: 'unset !important',
        width: 'unset !important',
        height: 'unset !important',
        maxWidth: 'unset !important',
        maxHeight: 'unset !important',
        padding: '10px 15px',
        flexDirection: 'row',
        fontWeight: '500',
        fontSize: '12px',
        '& > svg,& > .material-icons': {
            verticalAlign: 'middle',
            margin: '-1px 5px 0 0 !important',
        },
        borderRadius: '3px',
        lineHeight: '24px',
        border: '0 !important',
        color: whiteColor + ' !important',
        marginLeft: '4px',
        '&:last-child': {
            marginLeft: '0px',
        },
    },
    tabSelected: {
        backgroundColor: 'rgba(' + hexToRgb(whiteColor) + ', 0.2)',
        transition: '0.2s background-color 0.1s',
    },
});

export default customTabsStyle;
