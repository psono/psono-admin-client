import React from 'react';
// nodejs library that concatenates classes
import classNames from 'classnames';
// nodejs library to set properties for components

// material-ui components
import { makeStyles } from '@mui/styles';
import Button from '@mui/material/Button';
import type { ButtonProps } from '@mui/material/Button';

import styles from '../../assets/jss/material-dashboard-react/components/buttonStyle';

export interface RegularButtonProps
    extends Omit<ButtonProps, 'color' | 'size'> {
    color?: string;
    round?: boolean;
    children?: React.ReactNode;
    disabled?: boolean;
    simple?: boolean;
    size?: string;
    block?: boolean;
    link?: boolean;
    justIcon?: boolean;
    className?: string;
    muiClasses?: ButtonProps['classes'];
}
const useStyles = makeStyles(styles);

export default function RegularButton(props: RegularButtonProps) {
    const classes: Record<string, string> = useStyles();
    const {
        color,
        round,
        children,
        disabled,
        simple,
        size,
        block,
        link,
        justIcon,
        className,
        muiClasses,
        ...rest
    } = props;
    const btnClasses = classNames({
        [classes.button]: true,
        [classes[size || '']]: size,
        [classes[color || '']]: color,
        [classes.round]: round,
        [classes.disabled]: disabled,
        [classes.simple]: simple,
        [classes.block]: block,
        [classes.link]: link,
        [classes.justIcon]: justIcon,
        [className || '']: className,
    });
    return (
        <Button {...rest} classes={muiClasses} className={btnClasses}>
            {children}
        </Button>
    );
}
