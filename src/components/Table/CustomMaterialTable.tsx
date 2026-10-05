import type { ApiRecord } from '../../types/api';
import React, {
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import MUIDataTable from 'mui-datatables';
import type {
    MUIDataTableColumn,
    MUIDataTableOptions,
    MUIDataTableState,
} from 'mui-datatables';
import type {
    TableProps,
    TableQuery,
    TableAction,
    TableActionFactory,
} from '../../types/table';
import type { Theme } from '@mui/material/styles';
import { IconButton, LinearProgress, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import moment from 'moment';

import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import createTableTheme from './theme';
import '../../assets/fonts/opensans.css';

export type CustomMaterialTableProps<Row = ApiRecord> = TableProps<Row>;
const useStyles = makeStyles((theme: Theme) => ({
    muiDataTable: {
        fontFamily: theme.typography.fontFamily,
        '& .MuiToolbar-gutters': { padding: '0 15px' },
        '& .MuiTableCell-head, & .MuiTableCell-body': {
            paddingLeft: '15px',
            paddingRight: '15px',
        },
        '& .MuiTableCell-footer': { padding: 0 },
        // Override the dashboard's global h6 rules for table titles.
        '& .MuiTypography-h6': theme.typography.h6,
    },
}));

// Adapt the dashboard's existing column, action and query contracts to mui-datatables.
const CustomMaterialTable = <Row extends ApiRecord = ApiRecord>({
    title = '',
    columns,
    data,
    options,
    actions,
    tableRef,
}: TableProps<Row>) => {
    const { t } = useTranslation();
    const classes: Record<string, string> = useStyles();
    const remote = typeof data === 'function';
    const [query, setQuery] = useState<TableQuery<Row>>({
        page: 0,
        pageSize: options?.pageSize || 5,
        search: '',
        orderBy: undefined,
        orderDirection: 'asc',
    });
    const [loadedData, setLoadedData] = useState<Row[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(remote);
    const [loadError, setLoadError] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const dataSource = useRef(data);
    dataSource.current = data;

    // Existing views use this handle after creating, updating or deleting rows.
    useImperativeHandle(
        tableRef,
        () => ({ onQueryChange: () => setRefresh((value) => value + 1) }),
        []
    );

    useEffect(() => {
        if (!remote) return undefined;
        let active = true;
        setLoading(true);
        setLoadError(false);
        Promise.resolve()
            .then(() => {
                const source = dataSource.current;
                if (typeof source !== 'function')
                    throw new Error('Remote table data source is unavailable');
                return source(query);
            })
            .then(
                (result) => {
                    if (!active) return;
                    const lastPage = Math.max(
                        0,
                        Math.ceil(result.totalCount / query.pageSize) - 1
                    );
                    if (query.page > lastPage) {
                        setQuery((current) => ({ ...current, page: lastPage }));
                        return;
                    }
                    setLoadedData(result.data);
                    setCount(result.totalCount);
                    setLoading(false);
                },
                (error) => {
                    if (!active) return;
                    console.error('Error loading table data:', error);
                    setLoadedData([]);
                    setCount(0);
                    setLoadError(true);
                    setLoading(false);
                }
            );
        return () => {
            active = false;
        };
    }, [remote, query, refresh]);

    const rows = remote ? loadedData : Array.isArray(data) ? data : [];
    const rowActions = (actions || []).filter(
        (action): action is TableAction<Row> | TableActionFactory<Row> =>
            Boolean(action && !action.isFreeAction)
    );
    const toolbarActions = (actions || []).filter(
        (action): action is TableAction<Row> =>
            Boolean(
                action && typeof action !== 'function' && action.isFreeAction
            )
    );
    const renderAction = (
        definition: TableAction<Row> | TableActionFactory<Row>,
        row: Row | undefined,
        key: React.Key
    ) => {
        const action =
            typeof definition === 'function' ? definition(row!) : definition;
        if (!action || action.hidden) return null;
        const Icon = action.icon;
        return (
            <Tooltip key={key} title={action.tooltip || ''}>
                <span>
                    <IconButton
                        size="large"
                        aria-label={action.tooltip}
                        disabled={action.disabled}
                        onClick={(event: any) => {
                            event.stopPropagation();
                            action.onClick(event, row);
                        }}
                    >
                        {React.isValidElement(Icon)
                            ? Icon
                            : React.createElement(Icon as React.ComponentType)}
                    </IconButton>
                </span>
            </Tooltip>
        );
    };

    // Keep original row objects for renderers, permission checks and actions.
    const tableColumns: MUIDataTableColumn[] = columns.map((column) => ({
        name: column.field,
        label: column.title,

        options: {
            sort: column.sorting !== false,
            display: column.hidden ? 'false' : 'true',
            ...(column.render && {
                customBodyRenderLite: (dataIndex: number) =>
                    column.render!(rows[dataIndex]),
            }),
        },
    }));
    if (rowActions.length) {
        tableColumns.push({
            name: '__actions',
            label: t('MATERIAL_TABLE_ACTIONS'),
            options: {
                sort: false,
                filter: false,
                viewColumns: false,
                empty: true,
                customHeadLabelRender: () => null,
                customBodyRenderLite: (dataIndex: any) => (
                    <div style={{ whiteSpace: 'nowrap' }}>
                        {rowActions.map((action: any, index: any) =>
                            renderAction(action, rows[dataIndex], index)
                        )}
                    </div>
                ),
            },
        });
    }

    const tableOptions: MUIDataTableOptions = {
        filter: false,
        print: false,
        download: false,
        selectableRows: 'none',
        rowsPerPage: query.pageSize,
        rowsPerPageOptions: [5, 10, 20],
        enableNestedDataAccess: '.',
        setTableProps: () => ({ padding: 'normal', size: 'small' }),
        textLabels: {
            body: {
                noMatch: loading
                    ? t('LOADING')
                    : loadError
                    ? t('ERROR')
                    : t('MATERIAL_TABLE_NO_RECORD_TO_DISPLAY'),
                toolTip: t('TABLE_BODY_TOOL_TIP'),
                columnHeaderTooltip: (column: any) =>
                    `${t('TABLE_BODY_TOOL_TIP')} ${column.label}`,
            },
            pagination: {
                next: t('MATERIAL_TABLE_NEXT_PAGE'),
                previous: t('MATERIAL_TABLE_PREVIOUS_PAGE'),
                rowsPerPage: t('MATERIAL_TABLE_ROWS_PER_PAGE'),
                displayRows: t('TABLE_PAGINATION_DISPLAY_ROWS'),
            },
            toolbar: {
                search: t('MATERIAL_TABLE_SEARCH'),
                viewColumns: t('MATERIAL_TABLE_SHOW_COLUMNS'),
            },
            viewColumns: {
                title: t('MATERIAL_TABLE_ADD_OR_REMOVE_COLUMNS'),
                titleAria: t('MATERIAL_TABLE_SHOW_COLUMNS'),
            },
        },
        onChangeRowsPerPage: (pageSize: any) =>
            setQuery((current) => ({ ...current, pageSize, page: 0 })),
        ...(options || {}),
    };
    if (remote) {
        Object.assign(tableOptions, {
            serverSide: true,
            count,
            page: query.page,
            searchText: query.search || null,
            sortOrder: query.orderBy
                ? { name: query.orderBy.field, direction: query.orderDirection }
                : {},
            onTableChange: (action: string, state: MUIDataTableState) => {
                if (
                    ![
                        'changePage',
                        'changeRowsPerPage',
                        'search',
                        'sort',
                    ].includes(action)
                ) {
                    return;
                }
                setQuery({
                    page: action === 'changePage' ? state.page : 0,
                    pageSize: state.rowsPerPage,
                    search: state.searchText || '',
                    orderBy: columns.find(
                        (column: any) => column.field === state.sortOrder?.name
                    ),
                    orderDirection:
                        state.sortOrder?.direction === 'desc' ? 'desc' : 'asc',
                });
            },
        });
    } else if (columns.some((column: any) => column.customSort)) {
        tableOptions.customSort = (
            tableData: any,
            columnIndex: any,
            direction: any
        ) => {
            const column = columns[columnIndex];
            return [...tableData].sort((a, b) => {
                const result = column.customSort
                    ? column.customSort(rows[a.index], rows[b.index])
                    : String(a.data[columnIndex] ?? '').localeCompare(
                          String(b.data[columnIndex] ?? ''),
                          undefined,
                          { numeric: true }
                      );
                return direction === 'desc' ? -result : result;
            });
        };
    }

    const downloaddataAsCsv = async (pageSize = 100) => {
        let allData = [];
        let currentPage = 0;
        let hasMoreData = true;

        try {
            // Handle case where data is already an array
            if (typeof data !== 'function') {
                if (!Array.isArray(data)) {
                    throw new Error(
                        'Data must be either a function or an array'
                    );
                }

                allData = data;
                if (!allData.length) {
                    return;
                }

                const headers = Object.keys(allData[0] || {}).sort();
                return generateAndDownloadCsv(allData, headers);
            }

            // Handle case where data is a function
            const firstPageQuery = {
                page: currentPage,
                pageSize: pageSize,
                search: '',
            };

            const firstPageResponse = await data(firstPageQuery);
            if (!firstPageResponse.data.length) {
                return;
            }

            // Get headers from first item and sort alphabetically
            const headers = Object.keys(firstPageResponse.data[0]).sort();
            allData = [...firstPageResponse.data];

            // Continue fetching if there's more data
            hasMoreData =
                firstPageResponse.data.length === pageSize &&
                allData.length < firstPageResponse.totalCount;
            currentPage++;

            // Fetch remaining pages
            while (hasMoreData) {
                const query = {
                    page: currentPage,
                    pageSize: pageSize,
                    search: '',
                };

                const response = await data(query);
                allData = [...allData, ...response.data];

                hasMoreData =
                    response.data.length === pageSize &&
                    allData.length < response.totalCount;
                currentPage++;
            }

            return generateAndDownloadCsv(allData, headers);
        } catch (error) {
            console.error('Error downloading data:', error);
            throw error;
        }
    };

    // Helper function to generate and download CSV
    const generateAndDownloadCsv = (allData: any, headers: any) => {
        // Convert data to CSV format
        const csvContent = [
            // Add headers
            headers.join(','),
            // Add data rows, handling missing fields
            ...allData.map((item: any) =>
                headers
                    .map((header: any) => {
                        const value = item[header] ?? '';
                        // Handle special cases like arrays and objects
                        const processedValue =
                            typeof value === 'object'
                                ? JSON.stringify(value)
                                : String(value);
                        // Escape commas, quotes, and newlines
                        const escapedValue = processedValue
                            .replace(/"/g, '""')
                            .replace(/\n/g, ' ');
                        return `"${escapedValue}"`;
                    })
                    .join(',')
            ),
        ].join('\n');

        // Create and download the CSV file
        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute(
            'download',
            `download_${moment().format('YYYY-MM-DD_HH-mm-ss')}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return {
            totalItems: allData.length,
            columns: headers,
        };
    };

    const downloadActionExists = toolbarActions.some(
        (action: any) =>
            action.icon === CloudDownloadIcon && action.isFreeAction === true
    );

    if (!downloadActionExists) {
        toolbarActions.push({
            tooltip: t('DOWNLOAD'),
            icon: CloudDownloadIcon,
            isFreeAction: true,
            onClick: (evt: any) => downloaddataAsCsv(),
        });
    }
    tableOptions.customToolbar = () =>
        toolbarActions.map((action: any, index: any) =>
            renderAction(action, undefined, index)
        );

    return (
        <div className={classes.muiDataTable}>
            {loading && <LinearProgress />}
            <MUIDataTable
                title={title}
                columns={tableColumns}
                data={rows}
                options={tableOptions}
            />
        </div>
    );
};

export default function ThemedCustomMaterialTable<
    Row extends ApiRecord = ApiRecord
>(props: TableProps<Row>) {
    const theme = useTheme();
    const tableTheme = useMemo(() => createTableTheme(theme), [theme]);
    return (
        <ThemeProvider theme={tableTheme}>
            <CustomMaterialTable {...props} />
        </ThemeProvider>
    );
}
