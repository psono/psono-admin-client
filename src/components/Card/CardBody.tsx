import React from 'react';
// nodejs library that concatenates classes
import classNames from 'classnames';
// nodejs library to set properties for components

// MUI styles
import { makeStyles } from '@mui/styles';

// core components
import styles from '../../assets/jss/material-dashboard-react/components/cardBodyStyle';

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    children?: React.ReactNode;
    plain?: boolean;
    profile?: boolean;
}
const useStyles = makeStyles(styles);

export default function CardBody(props: CardBodyProps) {
    const classes: Record<string, string> = useStyles();
    const { className, children, plain, profile, ...rest } = props;
    const cardBodyClasses = classNames({
        [classes.cardBody]: true,
        [classes.cardBodyPlain]: plain,
        [classes.cardBodyProfile]: profile,
        [className || '']: className !== undefined,
    });
    return (
        <div className={cardBodyClasses} {...rest}>
            {children}
        </div>
    );
}
