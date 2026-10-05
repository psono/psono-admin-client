import React from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
// core components
import statsCardStyle from '../../assets/jss/material-dashboard-react/statsCardStyle';

const useStyles = makeStyles(statsCardStyle);

function StatsCard({ ...props }) {
    const {
        title,
        description,
        statLink,
        small,
        statText,
        statIconColor,
        iconColor,
    } = props;

    const classes: Record<string, string> = useStyles();

    return (
        <Card className={classes.card}>
            <CardHeader
                classes={{
                    root:
                        classes.cardHeader +
                        ' ' +
                        classes[iconColor + 'CardHeader'],
                    avatar: classes.cardAvatar,
                }}
                avatar={<props.icon className={classes.cardIcon} />}
            />
            <CardContent className={classes.cardContent}>
                <Typography component="p" className={classes.cardCategory}>
                    {title}
                </Typography>
                <Typography
                    variant="h2"
                    component="h2"
                    className={classes.cardTitle}
                >
                    {description}{' '}
                    {small !== undefined ? (
                        <small className={classes.cardTitleSmall}>
                            {small}
                        </small>
                    ) : null}
                </Typography>
            </CardContent>
            <CardActions className={classes.cardActions}>
                <div className={classes.cardStats}>
                    <props.statIcon
                        className={
                            classes.cardStatsIcon +
                            ' ' +
                            classes[statIconColor + 'CardStatsIcon']
                        }
                    />{' '}
                    {statLink !== undefined ? (
                        <a
                            href={statLink.href}
                            className={classes.cardStatsLink}
                        >
                            {statLink.text}
                        </a>
                    ) : statText !== undefined ? (
                        statText
                    ) : null}
                </div>
            </CardActions>
        </Card>
    );
}

StatsCard.defaultProps = {
    iconColor: 'purple',
    statIconColor: 'gray',
};

export default StatsCard;
