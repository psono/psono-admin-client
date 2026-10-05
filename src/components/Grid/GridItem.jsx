import React from 'react';
import { Grid } from '@mui/material';
import { withStyles } from '@mui/styles';

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
