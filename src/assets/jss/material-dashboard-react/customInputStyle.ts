// ##############################
// // // CustomInput styles
// #############################

import {
    primaryColor,
    dangerColor,
    successColor,
    defaultFont,
} from '../material-dashboard-react';

const customInputStyle = createStyles({
    disabled: {
        '&:before': {
            backgroundColor: 'transparent !important',
        },
    },
    underline: {
        '&:hover:not(.Mui-disabled):before,&:before': {
            borderBottom: '1px solid #D2D2D2 !important',
        },
        '&:after': {
            borderBottomColor: primaryColor[0],
        },
    },
    underlineError: {
        '&:after': {
            borderBottomColor: dangerColor[0],
        },
    },
    underlineSuccess: {
        '&:after': {
            borderBottomColor: successColor[0],
        },
    },
    labelRoot: {
        ...defaultFont,
        color: '#AAAAAA',
        fontWeight: '400',
        fontSize: '14px',
        lineHeight: '1.42857',
    },
    labelRootError: {
        color: dangerColor[0],
    },
    labelRootSuccess: {
        color: successColor[0],
    },
    feedback: {
        position: 'absolute',
        top: '18px',
        right: '0',
        zIndex: '2',
        display: 'block',
        width: '24px',
        height: '24px',
        textAlign: 'center',
        pointerEvents: 'none',
    },
    marginTop: {
        marginTop: '16px',
    },
    formControl: {
        paddingBottom: '10px',
        margin: '27px 0 0 0',
        position: 'relative',
    },
});

export default customInputStyle;
import { createStyles } from '@mui/styles';
