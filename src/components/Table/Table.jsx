import React from 'react';
import {
    withStyles,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
} from '@material-ui/core';
import PropTypes from 'prop-types';

import tableStyle from '../../assets/jss/material-dashboard-react/tableStyle';

const CustomTable = ({ classes, tableHead, tableData, tableHeaderColor }) => {
    return (
        <div className={classes.tableResponsive}>
            <Table className={classes.table}>
                {tableHead !== undefined ? (
                    <TableHead
                        className={classes[`${tableHeaderColor}TableHeader`]}
                    >
                        <TableRow>
                            {tableHead.map((prop, key) => (
                                <TableCell
                                    className={`${classes.tableCell} ${classes.tableHeadCell}`}
                                    key={key}
                                >
                                    {prop}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                ) : null}
                <TableBody>
                    {tableData.map((row, key) => (
                        <TableRow key={key}>
                            {row.map((cell, cellKey) => (
                                <TableCell
                                    className={classes.tableCell}
                                    key={cellKey}
                                >
                                    {cell}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

CustomTable.defaultProps = {
    tableHeaderColor: 'gray',
};

CustomTable.propTypes = {
    classes: PropTypes.object.isRequired,
    tableHeaderColor: PropTypes.oneOf([
        'warning',
        'primary',
        'danger',
        'success',
        'info',
        'rose',
        'gray',
    ]),
    tableHead: PropTypes.arrayOf(PropTypes.string),
    tableData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
};

export default withStyles(tableStyle)(CustomTable);
