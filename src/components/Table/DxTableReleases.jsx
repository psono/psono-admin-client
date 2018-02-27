import React from 'react';
import {
    PagingState,
    RowDetailState,
    IntegratedPaging,
} from '@devexpress/dx-react-grid';
import PropTypes from 'prop-types';

import {
    Grid as DxGrid,
    Table,
    TableHeaderRow,
    TableRowDetail,
    PagingPanel,
} from '@devexpress/dx-react-grid-material-ui';

const RowDetail = ({ row }) => (
    <div>{row.description}</div>
);

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
                    pageSize={10}
                />
                <RowDetailState />
                <IntegratedPaging />
                <Table />
                <TableHeaderRow />
                <TableRowDetail
                    contentComponent={RowDetail}
                />
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
