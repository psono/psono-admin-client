import React, { useState } from 'react';
import {
    withStyles,
    Checkbox,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Tooltip,
} from '@material-ui/core';
import { Edit, Close, Check } from '@material-ui/icons';
import PropTypes from 'prop-types';

import tasksStyle from '../../assets/jss/material-dashboard-react/tasksStyle';

const Tasks = ({ classes, tasksIndexes, tasks, checkedIndexes }) => {
    const [checked, setChecked] = useState(checkedIndexes);

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    return (
        <Table className={classes.table}>
            <TableBody>
                {tasksIndexes.map((value) => (
                    <TableRow key={value} className={classes.tableRow}>
                        <TableCell className={classes.tableCell}>
                            <Checkbox
                                checked={checked.indexOf(value) !== -1}
                                tabIndex={-1}
                                onClick={handleToggle(value)}
                                checkedIcon={
                                    <Check className={classes.checkedIcon} />
                                }
                                icon={
                                    <Check className={classes.uncheckedIcon} />
                                }
                                classes={{
                                    checked: classes.checked,
                                }}
                            />
                        </TableCell>
                        <TableCell className={classes.tableCell}>
                            {tasks[value]}
                        </TableCell>
                        <TableCell className={classes.tableActions}>
                            <Tooltip
                                id="tooltip-top"
                                title="Edit Task"
                                placement="top"
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <IconButton
                                    aria-label="Edit"
                                    className={classes.tableActionButton}
                                >
                                    <Edit
                                        className={
                                            classes.tableActionButtonIcon +
                                            ' ' +
                                            classes.edit
                                        }
                                    />
                                </IconButton>
                            </Tooltip>
                            <Tooltip
                                id="tooltip-top-start"
                                title="Remove"
                                placement="top"
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <IconButton
                                    aria-label="Close"
                                    className={classes.tableActionButton}
                                >
                                    <Close
                                        className={
                                            classes.tableActionButtonIcon +
                                            ' ' +
                                            classes.close
                                        }
                                    />
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

Tasks.propTypes = {
    classes: PropTypes.object.isRequired,
    tasksIndexes: PropTypes.arrayOf(PropTypes.number),
    tasks: PropTypes.arrayOf(PropTypes.node),
    checkedIndexes: PropTypes.arrayOf(PropTypes.number),
};

export default withStyles(tasksStyle)(Tasks);
