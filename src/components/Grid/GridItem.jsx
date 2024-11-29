import React from 'react';
import { withStyles, Grid } from '@material-ui/core';

const style = {
    grid: {
        padding: '0 15px !important',
    },
};

const GridItem = ({ classes, children, ...rest }) => {
    return (
        <Grid item {...rest} className={classes.grid}>
            {children}
        </Grid>
    );
};

export default withStyles(style)(GridItem);
