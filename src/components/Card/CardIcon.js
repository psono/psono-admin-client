import React from 'react';
// nodejs library that concatenates classes
import classNames from 'classnames';
// nodejs library to set properties for components
import PropTypes from 'prop-types';
// MUI styles
import { makeStyles } from '@mui/styles';

// core components
import styles from '../../assets/jss/material-dashboard-react/components/cardIconStyle.js';

const useStyles = makeStyles(styles);

export default function CardIcon(props) {
    const classes = useStyles();
    const { className, children, color, ...rest } = props;
    const cardIconClasses = classNames({
        [classes.cardIcon]: true,
        [classes[color + 'CardHeader']]: color,
        [className]: className !== undefined,
    });
    return (
        <div className={cardIconClasses} {...rest}>
            {children}
        </div>
    );
}

CardIcon.propTypes = {
    className: PropTypes.string,
    color: PropTypes.oneOf([
        'warning',
        'success',
        'danger',
        'info',
        'primary',
        'rose',
    ]),
    children: PropTypes.node,
};
