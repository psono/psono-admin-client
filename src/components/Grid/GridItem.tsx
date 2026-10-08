import { createStyles } from '@mui/styles';
import React from 'react';
import { Grid } from '@mui/material';
import type { GridProps } from '@mui/material';
import { withStyles } from '@mui/styles';

export interface GridItemProps extends Omit<GridProps, 'classes'> {
    classes: Record<string, string>;
    children?: React.ReactNode;
}
const style = createStyles({
    grid: {
        padding: '0 15px !important',
    },
});

const GridItem = ({ classes, children, ...rest }: GridItemProps) => {
    return (
        <Grid item {...rest} className={classes.grid}>
            {children}
        </Grid>
    );
};

export default withStyles(style)(GridItem);
