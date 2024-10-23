import React from 'react';
import {
    withStyles,
    Card,
    CardContent,
    CardHeader,
    CardActions,
    Typography,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';

import chartCardStyle from '../../assets/jss/material-dashboard-react/chartCardStyle';

const ChartCard = ({
    classes,
    chartColor,
    statIconColor,
    chart,
    title,
    text,
    statLink,
    statText,
    fontAwesomeStatsIcon,
    statIcon: StatIcon,
}) => {
    return (
        <Card className={classes.card}>
            <CardHeader
                classes={{
                    root:
                        classes.cardHeader +
                        ' ' +
                        classes[chartColor + 'CardHeader'],
                }}
                subheader={chart}
            />
            <CardContent className={classes.cardContent}>
                <Typography
                    type="title"
                    component="h4"
                    className={classes.cardTitle}
                >
                    {title}
                </Typography>
                <Typography component="p" className={classes.cardCategory}>
                    {text}
                </Typography>
            </CardContent>
            <CardActions className={classes.cardActions}>
                <div className={classes.cardStats}>
                    {fontAwesomeStatsIcon ? (
                        <FontAwesome name={fontAwesomeStatsIcon} />
                    ) : (
                        <StatIcon
                            className={
                                classes.cardStatsIcon +
                                ' ' +
                                classes[statIconColor + 'CardStatsIcon']
                            }
                        />
                    )}
                    {statLink ? (
                        <a
                            href={statLink.href}
                            className={classes.cardStatsLink}
                        >
                            {statLink.text}
                        </a>
                    ) : statText ? (
                        statText
                    ) : null}
                </div>
            </CardActions>
        </Card>
    );
};

ChartCard.defaultProps = {
    statIconColor: 'gray',
    chartColor: 'purple',
};

ChartCard.propTypes = {
    classes: PropTypes.object.isRequired,
    chart: PropTypes.object.isRequired,
    title: PropTypes.node,
    text: PropTypes.node,
    statIcon: PropTypes.elementType,
    fontAwesomeStatsIcon: PropTypes.node,
    statIconColor: PropTypes.oneOf([
        'warning',
        'primary',
        'danger',
        'success',
        'info',
        'rose',
        'gray',
    ]),
    chartColor: PropTypes.oneOf(['orange', 'green', 'red', 'blue', 'purple']),
    statLink: PropTypes.object,
    statText: PropTypes.node,
};

export default withStyles(chartCardStyle)(ChartCard);
