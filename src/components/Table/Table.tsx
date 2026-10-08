import React from 'react';
import {
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
} from '@mui/material';
import { withStyles } from '@mui/styles';

import tableStyle from '../../assets/jss/material-dashboard-react/tableStyle';

export interface CustomTableProps {
    classes: Record<string, string>;
    tableHead?: any;
    tableData?: any;
    tableHeaderColor?: string;
}
const CustomTable = ({
    classes,
    tableHead,
    tableData,
    tableHeaderColor,
}: CustomTableProps) => {
    return (
        <div className={classes.tableResponsive}>
            <Table className={classes.table}>
                {tableHead !== undefined ? (
                    <TableHead
                        className={classes[`${tableHeaderColor}TableHeader`]}
                    >
                        <TableRow>
                            {tableHead.map((prop: any, key: any) => (
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
                    {tableData.map((row: any, key: any) => (
                        <TableRow key={key}>
                            {row.map((cell: any, cellKey: any) => (
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

export default withStyles(tableStyle)(CustomTable);
