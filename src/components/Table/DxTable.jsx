import React from 'react';
import {
    PagingState,
    IntegratedPaging,
} from '@devexpress/dx-react-grid';
import PropTypes from 'prop-types';


import {
    Grid as DxGrid,
    Table,
    TableHeaderRow,
    PagingPanel,
} from '@devexpress/dx-react-grid-material-ui';

class DxTable extends React.PureComponent {

    render() {
        const { columns, rows } = this.props;

        return (
            <DxGrid
                columns={columns}
                rows={rows}
            >
                <PagingState
                    defaultCurrentPage={0}
                    pageSize={25}
                />
                <IntegratedPaging />
                <Table />
                <TableHeaderRow />
                <PagingPanel />
            </DxGrid>
        );
    }
}

DxTable.propTypes = {
    //classes: PropTypes.object.isRequired,
    columns: PropTypes.array.isRequired,
    rows: PropTypes.array,
};



export default DxTable;
