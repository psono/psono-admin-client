import type {
    ComponentType,
    MouseEvent,
    ReactElement,
    ReactNode,
    Ref,
} from 'react';
import type { MUIDataTableOptions } from 'mui-datatables';
import type { ApiRecord } from './api';

export interface TableHandle {
    onQueryChange(): void;
}

export interface TableColumn<Row = ApiRecord> {
    title: string;
    field: string;
    hidden?: boolean;
    sorting?: boolean;
    render?: (row: Row) => ReactNode;
    customSort?: (a: Row, b: Row) => number;
    [key: string]: unknown;
}

export interface TableQuery<Row = ApiRecord> {
    page: number;
    pageSize: number;
    search: string;
    orderBy?: TableColumn<Row>;
    orderDirection?: 'asc' | 'desc';
}

export interface TableResult<Row = ApiRecord> {
    data: Row[];
    page: number;
    totalCount: number;
}

export interface TableAction<Row = ApiRecord> {
    icon: ComponentType<any> | ReactElement;
    tooltip?: string;
    isFreeAction?: boolean;
    hidden?: boolean;
    disabled?: boolean;
    onClick: (
        event: MouseEvent<HTMLButtonElement>,
        row: Row | Row[] | undefined
    ) => void;
}

export type TableActionFactory<Row = ApiRecord> = ((
    row: Row
) => TableAction<Row> | null | false) & {
    isFreeAction?: boolean;
};

export interface TableProps<Row = ApiRecord> {
    title?: string;
    columns: TableColumn<Row>[];
    data: Row[] | ((query: TableQuery<Row>) => Promise<TableResult<Row>>);
    options?: MUIDataTableOptions & {
        pageSize?: number;
        [key: string]: unknown;
    };
    actions?: (TableAction<Row> | TableActionFactory<Row> | null | false)[];
    tableRef?: Ref<TableHandle>;
}
