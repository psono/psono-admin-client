import React from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Typography,
} from '@mui/material';
import { withStyles } from '@mui/styles';

import profileCardStyle from '../../assets/jss/material-dashboard-react/profileCardStyle';

export interface ProfileCardProps {
    classes: Record<string, string>;
    subtitle?: any;
    title?: React.ReactNode;
    description?: React.ReactNode;
    footer?: React.ReactNode;
    avatar?: string;
}
const ProfileCard = ({
    classes,
    subtitle,
    title,
    description,
    footer,
    avatar,
}: ProfileCardProps) => {
    return (
        <Card className={classes.card}>
            <CardHeader
                classes={{
                    root: classes.cardHeader,
                    avatar: classes.cardAvatar,
                }}
                avatar={<img src={avatar} alt="..." className={classes.img} />}
            />
            <CardContent className={classes.textAlign}>
                {subtitle && (
                    <Typography component="h6" className={classes.cardSubtitle}>
                        {subtitle}
                    </Typography>
                )}
                {title && (
                    <Typography component="h4" className={classes.cardTitle}>
                        {title}
                    </Typography>
                )}
                {description && (
                    <Typography
                        component="p"
                        className={classes.cardDescription}
                    >
                        {description}
                    </Typography>
                )}
            </CardContent>
            <CardActions
                className={`${classes.textAlign} ${classes.cardActions}`}
            >
                {footer}
            </CardActions>
        </Card>
    );
};

export default withStyles(profileCardStyle)(ProfileCard);
