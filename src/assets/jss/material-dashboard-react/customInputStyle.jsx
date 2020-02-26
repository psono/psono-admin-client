// ##############################
// // // CustomInput styles
// #############################

import {
    primaryColor,
    dangerColor,
    successColor,
    defaultFont
} from '../material-dashboard-react.js';

const customInputStyle = {
    disabled: {
        '&:before': {
            backgroundColor: 'transparent !important'
        }
    },
    underline: {
        '&:hover:not($disabled):before,&:before': {
            backgroundColor: '#D2D2D2',
            height: '1px !important'
        },
        '&:after': {
            backgroundColor: primaryColor[0]
        }
    },
    underlineError: {
        '&:after': {
            backgroundColor: dangerColor[0]
        }
    },
    underlineSuccess: {
        '&:after': {
            backgroundColor: successColor[0]
        }
    },
    labelRoot: {
        ...defaultFont,
        color: '#AAAAAA',
        fontWeight: '400',
        fontSize: '14px',
        lineHeight: '1.42857'
    },
    labelRootError: {
        color: dangerColor[0]
    },
    labelRootSuccess: {
        color: successColor[0]
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
        pointerEvents: 'none'
    },
    marginTop: {
        marginTop: '16px'
    },
    formControl: {
        paddingBottom: '10px',
        margin: '27px 0 0 0',
        position: 'relative'
    }
};

export default customInputStyle;
