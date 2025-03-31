import React, { useState } from 'react';
import MaterialTable from '@material-table/core';
import { withStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import moment from 'moment';

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import Delete from '@material-ui/icons/Delete';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import Save from '@material-ui/icons/Save';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

import { tableStyle } from '../../variables/styles';

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <Delete {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => (
        <ChevronRight {...props} ref={ref} />
    )),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <Save {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => (
        <ChevronLeft {...props} ref={ref} />
    )),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => (
        <ArrowDownward {...props} ref={ref} />
    )),
    ThirdStateCheck: forwardRef((props, ref) => (
        <Remove {...props} ref={ref} />
    )),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

const CustomMaterialTable = ({
    title,
    columns,
    data,
    options,
    actions,
    tableRef,
}) => {
    const { t } = useTranslation();
    const [pageSize, setPageSize] = useState(5);

    const defaultOptions = {
        pageSize,
        headerStyle: {
            fontSize: '12px',
            color: 'rgba(0, 0, 0, 0.54)',
        },
        searchFieldStyle: {
            fontSize: '12px',
            color: 'rgba(0, 0, 0, 0.54)',
        },
    };

    const mergedOptions = { ...defaultOptions, ...options };

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
    const generateAndDownloadCsv = (allData, headers) => {
        // Convert data to CSV format
        const csvContent = [
            // Add headers
            headers.join(','),
            // Add data rows, handling missing fields
            ...allData.map((item) =>
                headers
                    .map((header) => {
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

    if (!actions) {
        actions = [];
    }

    // Check if a download action already exists to prevent duplication
    const downloadActionExists = actions.some(
        (action) =>
            action.icon === CloudDownloadIcon && action.isFreeAction === true
    );

    if (!downloadActionExists) {
        actions.push({
            tooltip: t('DOWNLOAD'),
            icon: CloudDownloadIcon,
            isFreeAction: true,
            onClick: (evt) => downloaddataAsCsv(),
        });
    }

    return (
        <MaterialTable
            onChangeRowsPerPage={setPageSize}
            tableRef={tableRef}
            icons={tableIcons}
            title={title}
            columns={columns}
            data={data}
            options={mergedOptions}
            actions={actions}
            localization={{
                body: {
                    emptyDataSourceMessage: t(
                        'MATERIAL_TABLE_NO_RECORD_TO_DISPLAY'
                    ),
                    addTooltip: t('MATERIAL_TABLE_ADD'),
                    deleteTooltip: t('MATERIAL_TABLE_DELETE'),
                    editTooltip: t('MATERIAL_TABLE_EDIT'),
                    filterRow: {
                        filterTooltip: t('MATERIAL_TABLE_FILTER'),
                    },
                    editRow: {
                        deleteText: t(
                            'MATERIAL_TABLE_ARE_YOU_SURE_DELETE_THIS_ROW'
                        ),
                        cancelTooltip: t('MATERIAL_TABLE_CANCEL'),
                        saveTooltip: t('MATERIAL_TABLE_SAVE'),
                    },
                },
                grouping: {
                    placeholder: t('MATERIAL_TABLE_DRAG_HEADERS'),
                },
                header: {
                    actions: t('MATERIAL_TABLE_ACTIONS'),
                },
                pagination: {
                    labelDisplayedRows: t('MATERIAL_TABLE_FROM_TO_COUNT'),
                    labelRowsSelect: t('MATERIAL_TABLE_ROWS'),
                    labelRowsPerPage: t('MATERIAL_TABLE_ROWS_PER_PAGE'),
                    firstAriaLabel: t('MATERIAL_TABLE_FIRST_PAGE'),
                    firstTooltip: t('MATERIAL_TABLE_FIRST_PAGE'),
                    previousAriaLabel: t('MATERIAL_TABLE_PREVIOUS_PAGE'),
                    previousTooltip: t('MATERIAL_TABLE_PREVIOUS_PAGE'),
                    nextAriaLabel: t('MATERIAL_TABLE_NEXT_PAGE'),
                    nextTooltip: t('MATERIAL_TABLE_NEXT_PAGE'),
                    lastAriaLabel: t('MATERIAL_TABLE_LAST_PAGE'),
                    lastTooltip: t('MATERIAL_TABLE_LAST_PAGE'),
                },
                toolbar: {
                    addRemoveColumns: t('MATERIAL_TABLE_ADD_OR_REMOVE_COLUMNS'),
                    nRowsSelected: t('MATERIAL_TABLE_N_ROWS_SELECTED'),
                    showColumnsTitle: t('MATERIAL_TABLE_SHOW_COLUMNS'),
                    showColumnsAriaLabel: t('MATERIAL_TABLE_SHOW_COLUMNS'),
                    exportTitle: t('MATERIAL_TABLE_EXPORT'),
                    exportAriaLabel: t('MATERIAL_TABLE_EXPORT'),
                    exportName: t('MATERIAL_TABLE_EXPORT_AS_CSV'),
                    searchTooltip: t('MATERIAL_TABLE_SEARCH'),
                    searchPlaceholder: t('MATERIAL_TABLE_SEARCH'),
                },
            }}
        />
    );
};

CustomMaterialTable.propTypes = {
    title: PropTypes.string,
    columns: PropTypes.arrayOf(PropTypes.object),
    data: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.func,
    ]),
    actions: PropTypes.arrayOf(PropTypes.object),
    options: PropTypes.object,
    tableRef: PropTypes.object,
};

export default withStyles(tableStyle)(CustomMaterialTable);
