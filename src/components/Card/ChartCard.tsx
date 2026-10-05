import React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardActions,
    Typography,
} from '@mui/material';
import { withStyles } from '@mui/styles';

import FontAwesome from 'react-fontawesome';

import chartCardStyle from '../../assets/jss/material-dashboard-react/chartCardStyle';

export interface ChartCardProps {
    classes: Record<string, string>;
    chartColor?: string;
    statIconColor?: any;
    chart?: React.ReactNode;
    title?: React.ReactNode;
    text?: any;
    statLink?: any;
    statText?: any;
    fontAwesomeStatsIcon?: any;
    statIcon?: any;
}
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
}: ChartCardProps) => {
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
                <Typography component="h4" className={classes.cardTitle}>
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

export default withStyles(chartCardStyle)(ChartCard);
