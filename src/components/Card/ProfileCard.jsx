import React from 'react';
import {
    withStyles,
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Typography,
} from '@material-ui/core';
import PropTypes from 'prop-types';

import profileCardStyle from '../../assets/jss/material-dashboard-react/profileCardStyle';

const ProfileCard = ({
    classes,
    subtitle,
    title,
    description,
    footer,
    avatar,
}) => {
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

ProfileCard.propTypes = {
    classes: PropTypes.object.isRequired,
    title: PropTypes.node,
    subtitle: PropTypes.node,
    description: PropTypes.node,
    footer: PropTypes.node,
    avatar: PropTypes.string,
};

export default withStyles(profileCardStyle)(ProfileCard);
