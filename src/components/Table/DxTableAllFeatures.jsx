import React from 'react';
import {
    PagingState,
    IntegratedPaging,
    FilteringState,
    IntegratedFiltering,
    SortingState,
    GroupingState,
    IntegratedSorting,
    IntegratedGrouping,
} from '@devexpress/dx-react-grid';
import PropTypes from 'prop-types';

import {
    Grid as DxGrid,
    Table,
    TableHeaderRow,
    TableFilterRow,
    TableGroupRow,
    PagingPanel,
    GroupingPanel,
    DragDropProvider,
    Toolbar,
} from '@devexpress/dx-react-grid-material-ui';

class DxTableAllFeatures extends React.PureComponent {

    state = {
        grouping: [],
    };

    changeGrouping = (grouping) => {
        this.setState({ grouping });
    };

    render() {
        const { columns, rows } = this.props;
        const { grouping } = this.state;

        return (
            <DxGrid
                columns={columns}
                rows={rows}
            >
                <DragDropProvider />
                <SortingState defaultSorting={[]}/>
                <GroupingState grouping={grouping} onGroupingChange={this.changeGrouping} />
                <PagingState
                    defaultCurrentPage={0}
                    pageSize={25}
                />
                <FilteringState defaultFilters={[]} />
                <IntegratedFiltering />
                <IntegratedPaging />
                <IntegratedSorting />
                <IntegratedGrouping />
                <Table />
                <TableHeaderRow showSortingControls />
                <TableFilterRow />
                <TableGroupRow />
                <Toolbar />
                <GroupingPanel showSortingControls />
                <PagingPanel />
            </DxGrid>
        );
    }
}

DxTableAllFeatures.propTypes = {
    //classes: PropTypes.object.isRequired,
    columns: PropTypes.array.isRequired,
    rows: PropTypes.array,
};



export default DxTableAllFeatures;
