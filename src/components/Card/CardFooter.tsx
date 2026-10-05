import React from 'react';
// nodejs library that concatenates classes
import classNames from 'classnames';
// nodejs library to set properties for components

// MUI styles
import { makeStyles } from '@mui/styles';

// core components
import styles from '../../assets/jss/material-dashboard-react/components/cardFooterStyle';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    children?: React.ReactNode;
    plain?: boolean;
    profile?: boolean;
    stats?: React.ReactNode;
    chart?: boolean;
}
const useStyles = makeStyles(styles);

export default function CardFooter(props: CardFooterProps) {
    const classes: Record<string, string> = useStyles();
    const { className, children, plain, profile, stats, chart, ...rest } =
        props;
    const cardFooterClasses = classNames({
        [classes.cardFooter]: true,
        [classes.cardFooterPlain]: plain,
        [classes.cardFooterProfile]: profile,
        [classes.cardFooterStats]: stats,
        [classes.cardFooterChart]: chart,
        [className || '']: className !== undefined,
    });
    return (
        <div className={cardFooterClasses} {...rest}>
            {children}
        </div>
    );
}
