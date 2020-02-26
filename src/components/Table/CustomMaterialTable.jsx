import React from 'react';
import MaterialTable from 'material-table';
import { withStyles } from '@material-ui/core';

import { withTranslation } from 'react-i18next';
import { compose } from 'redux';

import PropTypes from 'prop-types';
import { forwardRef } from 'react';

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import Delete from '@material-ui/icons/Delete';
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
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

class CustomMaterialTable extends React.Component {
    render() {
        const { t, title, columns, data, options, actions } = this.props;

        const defaultOptions = {
            headerStyle: {
                fontSize: '12px',
                color: 'rgba(0, 0, 0, 0.54)'
            },
            searchFieldStyle: {
                fontSize: '12px',
                color: 'rgba(0, 0, 0, 0.54)'
            }
        };

        const mergedOptions = { ...defaultOptions, ...options };

        return (
            <MaterialTable
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
                            filterTooltip: t('MATERIAL_TABLE_FILTER')
                        },
                        editRow: {
                            deleteText: t(
                                'MATERIAL_TABLE_ARE_YOU_SURE_DELETE_THIS_ROW'
                            ),
                            cancelTooltip: t('MATERIAL_TABLE_CANCEL'),
                            saveTooltip: t('MATERIAL_TABLE_SAVE')
                        }
                    },
                    grouping: {
                        placeholder: t('MATERIAL_TABLE_DRAG_HEADERS')
                    },
                    header: {
                        actions: t('MATERIAL_TABLE_ACTIONS')
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
                        lastTooltip: t('MATERIAL_TABLE_LAST_PAGE')
                    },
                    toolbar: {
                        addRemoveColumns: t(
                            'MATERIAL_TABLE_ADD_OR_REMOVE_COLUMNS'
                        ),
                        nRowsSelected: t('MATERIAL_TABLE_N_ROWS_SELECTED'),
                        showColumnsTitle: t('MATERIAL_TABLE_SHOW_COLUMNS'),
                        showColumnsAriaLabel: t('MATERIAL_TABLE_SHOW_COLUMNS'),
                        exportTitle: t('MATERIAL_TABLE_EXPORT'),
                        exportAriaLabel: t('MATERIAL_TABLE_EXPORT'),
                        exportName: t('MATERIAL_TABLE_EXPORT_AS_CSV'),
                        searchTooltip: t('MATERIAL_TABLE_SEARCH'),
                        searchPlaceholder: t('MATERIAL_TABLE_SEARCH')
                    }
                }}
            />
        );
    }
}

CustomMaterialTable.propTypes = {
    title: PropTypes.string,
    columns: PropTypes.arrayOf(PropTypes.object),
    data: PropTypes.arrayOf(PropTypes.object),
    actions: PropTypes.arrayOf(PropTypes.object),
    options: PropTypes.object
};

export default compose(withTranslation(), withStyles(tableStyle))(
    CustomMaterialTable
);
