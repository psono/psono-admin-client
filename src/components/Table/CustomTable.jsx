import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Table, {
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel
} from 'material-ui/Table';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Checkbox from 'material-ui/Checkbox';
import IconButton from 'material-ui/IconButton';
import Tooltip from 'material-ui/Tooltip';
import { lighten } from 'material-ui/styles/colorManipulator';

class CustomTableHead extends React.Component {
    createSortHandler = property => event => {
        this.props.onRequestSort(event, property);
    };

    render() {
        const {
            onSelectAllClick,
            order,
            orderBy,
            numSelected,
            rowCount,
            head,
            headerFunctions
        } = this.props;

        return (
            <TableHead>
                <TableRow>
                    {headerFunctions.length > 0 ? (
                        <TableCell padding="checkbox">
                            <Checkbox
                                indeterminate={
                                    numSelected > 0 && numSelected < rowCount
                                }
                                checked={numSelected === rowCount}
                                onChange={onSelectAllClick}
                            />
                        </TableCell>
                    ) : null}
                    {head.map(column => {
                        return (
                            <TableCell
                                key={column.id}
                                numeric={column.numeric}
                                padding={
                                    column.disablePadding ? 'none' : 'default'
                                }
                                sortDirection={
                                    orderBy === column.id ? order : false
                                }
                            >
                                <Tooltip
                                    title="Sort"
                                    placement={
                                        column.numeric
                                            ? 'bottom-end'
                                            : 'bottom-start'
                                    }
                                    enterDelay={300}
                                >
                                    <TableSortLabel
                                        active={orderBy === column.id}
                                        direction={order}
                                        onClick={this.createSortHandler(
                                            column.id
                                        )}
                                    >
                                        {column.label}
                                    </TableSortLabel>
                                </Tooltip>
                            </TableCell>
                        );
                    }, this)}
                </TableRow>
            </TableHead>
        );
    }
}

CustomTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired
};

const toolbarStyles = theme => ({
    root: {
        paddingRight: theme.spacing.unit
    },
    highlight:
        theme.palette.type === 'light'
            ? {
                  color: theme.palette.secondary.dark,
                  backgroundColor: lighten(theme.palette.secondary.light, 0.4)
              }
            : {
                  color: lighten(theme.palette.secondary.light, 0.4),
                  backgroundColor: theme.palette.secondary.dark
              },
    spacer: {},
    actions: {
        color: theme.palette.text.secondary
    },
    title: {
        flex: '0 0 auto'
    }
});

let CustomTableToolbar = props => {
    const { numSelected, classes, headerFunctions, title } = props;

    return (
        <Toolbar
            className={classNames(classes.root, {
                [classes.highlight]: numSelected > 0
            })}
        >
            <div className={classes.title}>
                {numSelected > 0 ? (
                    <Typography variant="subheading">
                        {numSelected} selected
                    </Typography>
                ) : (
                    <Typography variant="title">{title}</Typography>
                )}
            </div>
            <div className={classes.spacer} />
            <div className={classes.actions}>
                {numSelected > 0 && headerFunctions.length > 0
                    ? headerFunctions.map((headerFunction, index) => {
                          return (
                              <Tooltip title={headerFunction.title} key={index}>
                                  <IconButton
                                      aria-label={headerFunction.title}
                                      onClick={() => {
                                          headerFunction.onClick();
                                      }}
                                  >
                                      {headerFunction.icon}
                                  </IconButton>
                              </Tooltip>
                          );
                      })
                    : null}
            </div>
        </Toolbar>
    );
};

CustomTableToolbar.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired
};

CustomTableToolbar = withStyles(toolbarStyles)(CustomTableToolbar);

const styles = theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing.unit * 3
    },
    table: {
        minWidth: 500
    },
    tableWrapper: {
        overflowX: 'auto'
    }
});

class CustomTable extends React.Component {
    state = {
        order: 'asc',
        orderBy: 'calories',
        selected: [],
        page: 0,
        rowsPerPage: 5
    };

    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        const data =
            order === 'desc'
                ? this.props.data.sort(
                      (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
                  )
                : this.props.data.sort(
                      (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1)
                  );

        this.setState({ data, order, orderBy });
    };

    handleSelectAllClick = (event, checked) => {
        if (checked) {
            this.setState({ selected: this.props.data.map(n => n.id) });
            return;
        }
        this.setState({ selected: [] });
    };

    handleClick = (event, id) => {
        if (!this.props.headerFunctions.length > 0) {
            return;
        }
        const { selected } = this.state;
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }

        this.setState({ selected: newSelected });
    };

    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    loadIndexs = tableData => {
        let indexs = [];

        tableData.forEach(entry => {
            indexs.push(entry.id);
        });

        return indexs;
    };

    headerFunctions = () => {
        const wrappedHeaderFunctions = [];

        this.props.headerFunctions.forEach(func => {
            const { onClick, ...rest } = func;

            const wrapper = {
                onClick: () => {
                    onClick(this.state.selected);
                    this.setState({ selected: [] });
                },
                ...rest
            };

            wrappedHeaderFunctions.push(wrapper);
        });

        return wrappedHeaderFunctions;
    };

    isSelected = id => this.state.selected.indexOf(id) !== -1;

    render() {
        const { classes, head, title, data, rowsPerPage } = this.props;
        const indexs = this.loadIndexs(head);
        const { order, orderBy, selected, page } = this.state;
        const emptyRows =
            rowsPerPage -
            Math.min(rowsPerPage, data.length - page * rowsPerPage);

        return (
            <Paper className={classes.root}>
                <CustomTableToolbar
                    numSelected={selected.length}
                    headerFunctions={this.headerFunctions()}
                    title={title}
                />
                <div className={classes.tableWrapper}>
                    <Table className={classes.table}>
                        <CustomTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={this.handleSelectAllClick}
                            onRequestSort={this.handleRequestSort}
                            rowCount={data.length}
                            head={head}
                            headerFunctions={this.props.headerFunctions}
                        />
                        <TableBody>
                            {data
                                .slice(
                                    page * rowsPerPage,
                                    page * rowsPerPage + rowsPerPage
                                )
                                .map((n, index) => {
                                    const isSelected = this.isSelected(n.id);
                                    return (
                                        <TableRow
                                            hover
                                            onClick={event =>
                                                this.handleClick(event, n.id)
                                            }
                                            role="checkbox"
                                            aria-checked={isSelected}
                                            tabIndex={-1}
                                            key={index}
                                            selected={isSelected}
                                        >
                                            {this.props.headerFunctions.length >
                                            0 ? (
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={isSelected}
                                                    />
                                                </TableCell>
                                            ) : null}
                                            {indexs.map(i => {
                                                return (
                                                    <TableCell key={i}>
                                                        {n[i]}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 49 * emptyRows }}>
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    colSpan={6}
                                    count={data.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    backIconButtonProps={{
                                        'aria-label': 'Previous Page'
                                    }}
                                    nextIconButtonProps={{
                                        'aria-label': 'Next Page'
                                    }}
                                    onChangePage={this.handleChangePage}
                                    onChangeRowsPerPage={
                                        this.handleChangeRowsPerPage
                                    }
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </Paper>
        );
    }
}

CustomTable.defaultProps = {
    rowsPerPage: 10,
    checkBox: false,
    title: '',
    headerFunctions: []
};

CustomTable.propTypes = {
    classes: PropTypes.object.isRequired,
    head: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
    title: PropTypes.string,
    headerFunctions: PropTypes.array,
    rowsPerPage: PropTypes.number,
    checkBox: PropTypes.bool
};

export default withStyles(styles)(CustomTable);