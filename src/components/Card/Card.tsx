import React from 'react';
// nodejs library that concatenates classes
import classNames from 'classnames';
// nodejs library to set properties for components

// MUI styles
import { makeStyles } from '@mui/styles';

// core components
import styles from '../../assets/jss/material-dashboard-react/components/cardStyle';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    children?: React.ReactNode;
    plain?: boolean;
    profile?: boolean;
    chart?: boolean;
}
const useStyles = makeStyles(styles);

export default function Card(props: CardProps) {
    const classes: Record<string, string> = useStyles();
    const { className, children, plain, profile, chart, ...rest } = props;
    const cardClasses = classNames({
        [classes.card]: true,
        [classes.cardPlain]: plain,
        [classes.cardProfile]: profile,
        [classes.cardChart]: chart,
        [className || '']: className !== undefined,
    });
    return (
        <div className={cardClasses} {...rest}>
            {children}
        </div>
    );
}
