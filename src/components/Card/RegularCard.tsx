import React from 'react';
import classNames from 'classnames';

// MUI components
import { withStyles } from '@mui/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
// core components
import regularCardStyle from '../../assets/jss/material-dashboard-react/regularCardStyle';

function RegularCard({ ...props }) {
    const {
        classes,
        headerColor,
        plainCard,
        cardTitle,
        cardSubtitle,
        content,
        footer,
    } = props;
    const plainCardClasses = classNames({
        [' ' + classes.cardPlain]: plainCard,
    });
    const cardPlainHeaderClasses = classNames({
        [' ' + classes.cardPlainHeader]: plainCard,
    });
    return (
        <Card className={classes.card + plainCardClasses}>
            <CardHeader
                classes={{
                    root:
                        classes.cardHeader +
                        ' ' +
                        classes[headerColor + 'CardHeader'] +
                        cardPlainHeaderClasses,
                    title: classes.cardTitle,
                    subheader: classes.cardSubtitle,
                }}
                title={cardTitle}
                subheader={cardSubtitle}
            />
            <CardContent>{content}</CardContent>
            {footer !== undefined ? (
                <CardActions className={classes.cardActions}>
                    {footer}
                </CardActions>
            ) : null}
        </Card>
    );
}

RegularCard.defaultProps = {
    headerColor: 'purple',
};

export default withStyles(regularCardStyle)(RegularCard);
