import React from 'react';
// nodejs library that concatenates classes
import classNames from 'classnames';
// nodejs library to set properties for components

// MUI styles
import { makeStyles } from '@mui/styles';

// core components
import styles from '../../assets/jss/material-dashboard-react/components/cardIconStyle';

export interface CardIconProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    children?: React.ReactNode;
    color?: string;
}
const useStyles = makeStyles(styles);

export default function CardIcon(props: CardIconProps) {
    const classes: Record<string, string> = useStyles();
    const { className, children, color, ...rest } = props;
    const cardIconClasses = classNames({
        [classes.cardIcon]: true,
        [classes[color + 'CardHeader']]: color,
        [className || '']: className !== undefined,
    });
    return (
        <div className={cardIconClasses} {...rest}>
            {children}
        </div>
    );
}
