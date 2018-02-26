import React from 'react';
import {
    withStyles, Table, TableHead, TableRow, TableBody, TableCell
} from 'material-ui';

import PropTypes from 'prop-types';

import { tableStyle } from '../../variables/styles';

class Releases extends React.Component{
    render(){
        const { classes, releases } = this.props;

        return (
            <div className={classes.tableResponsive}>
                <Table className={classes.table}>
                    <TableHead className={classes["TableHeader"]}>
                        <TableRow>
                            <TableCell className={classes.tableCell + " " + classes.tableHeadCell}>
                                Version
                            </TableCell>
                            <TableCell className={classes.tableCell + " " + classes.tableHeadCell}>
                                Date
                            </TableCell>
                            <TableCell className={classes.tableCell + " " + classes.tableHeadCell}>
                                Changes
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            releases.map((prop,key) => {
                                return (
                                    <TableRow key={key}>
                                        <TableCell className={classes.tableCell}>
                                            {prop.name}
                                        </TableCell>
                                        <TableCell className={classes.tableCell}>
                                            {prop.commit.created_at.replace('.000Z', '').replace('T', ' ')}
                                        </TableCell>
                                        <TableCell className={classes.tableCell}>
                                            {prop.release.description.split('\n').map((item, key) => {
                                                if (item.startsWith('# ') || item.trim() === '') {
                                                    return null;
                                                } else {
                                                    return <span key={key}>{item}<br/></span>
                                                }
                                            })}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        }
                    </TableBody>
                </Table>
            </div>

        );
    }
}

Releases.propTypes = {
    classes: PropTypes.object.isRequired,
    releases: PropTypes.array,
};

export default withStyles(tableStyle)(Releases);
