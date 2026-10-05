import React from 'react';
import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { ThemeProvider } from '@mui/material/styles';
import Edit from '@mui/icons-material/Edit';
import CustomMaterialTable from './CustomMaterialTable';
import theme from '../../theme';
import translations from '../../../public/locales/locale-en.json';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) =>
            require('../../../public/locales/locale-en.json')[key] || key,
    }),
}));

describe('MUI data tables', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        act(() => {
            ReactDOM.unmountComponentAtNode(container);
        });
        container.remove();
        jest.restoreAllMocks();
    });

    const render = async (props) => {
        await act(async () => {
            ReactDOM.render(
                <ThemeProvider theme={theme}>
                    <CustomMaterialTable {...props} />
                </ThemeProvider>,
                container
            );
        });
    };

    const click = async (selector) => {
        const button = container.querySelector(selector);
        expect(button).not.toBeNull();
        await act(async () => Simulate.click(button));
    };

    const search = async (value) => {
        if (!container.querySelector('input[aria-label="Search"]')) {
            await click('button[aria-label="Search"]');
        }
        await act(async () => {
            Simulate.change(
                container.querySelector('input[aria-label="Search"]'),
                {
                    target: { value },
                }
            );
        });
    };

    test('local sorting and pagination keep custom renderers and permission-aware actions attached to original rows', async () => {
        const rows = Array.from({ length: 8 }, (_, id) => ({
            id,
            name: `User ${id}`,
            rank: 8 - id,
            mapped: <span>Mapped {id}</span>,
        }));
        const onEdit = jest.fn();
        const actions = [
            (row) => ({
                icon: Edit,
                tooltip: 'Edit',
                hidden: row.id === 7,
                onClick: (event, originalRow) => onEdit(originalRow),
            }),
        ];
        await render({
            columns: [
                {
                    field: 'mapped',
                    title: 'Mapped',
                    customSort: (a, b) => a.rank - b.rank,
                },
                {
                    field: 'name',
                    title: 'Name',
                    render: (row) => <a href={`/user/${row.id}`}>{row.name}</a>,
                },
            ],
            data: rows,
            actions,
        });

        await click('th button');
        expect(container.querySelector('tbody a').getAttribute('href')).toBe(
            '/user/7'
        );
        expect(
            container.querySelectorAll('button[aria-label="Edit"]')
        ).toHaveLength(4);
        await click('button[aria-label="Edit"]');
        expect(onEdit).toHaveBeenLastCalledWith(rows[6]);

        await click('[data-testid="pagination-next"]');
        expect(container.querySelector('tbody a').getAttribute('href')).toBe(
            '/user/2'
        );
        await click('button[aria-label="Edit"]');
        expect(onEdit).toHaveBeenLastCalledWith(rows[2]);
        expect(actions).toHaveLength(1);
        expect(rows[0].id).toBe(0);
    });

    test('remote tables preserve paging, sorting, searching and refresh queries', async () => {
        const tableRef = React.createRef();
        const source = jest.fn(async (query) => ({
            data: [{ id: query.page, name: `Page ${query.page}` }],
            totalCount: 12,
        }));
        await render({
            columns: [{ field: 'name', title: 'Name' }],
            data: source,
            tableRef,
        });
        expect(source).toHaveBeenLastCalledWith(
            expect.objectContaining({ page: 0, pageSize: 5, search: '' })
        );

        await click('[data-testid="pagination-next"]');
        expect(source).toHaveBeenLastCalledWith(
            expect.objectContaining({ page: 1, pageSize: 5 })
        );
        await click('th button');
        expect(source).toHaveBeenLastCalledWith(
            expect.objectContaining({
                page: 0,
                orderBy: expect.objectContaining({ field: 'name' }),
                orderDirection: 'asc',
            })
        );
        await search('alice');
        expect(source).toHaveBeenLastCalledWith(
            expect.objectContaining({ page: 0, search: 'alice' })
        );

        const lastQuery = source.mock.calls[source.mock.calls.length - 1][0];
        const calls = source.mock.calls.length;
        await act(async () => tableRef.current.onQueryChange());
        expect(source).toHaveBeenCalledTimes(calls + 1);
        expect(source).toHaveBeenLastCalledWith(lastQuery);
    });

    test('an older remote response cannot overwrite newer search results', async () => {
        const pending = [];
        const source = jest.fn(
            () => new Promise((resolve) => pending.push(resolve))
        );
        await render({
            columns: [{ field: 'name', title: 'Name' }],
            data: source,
        });
        await search('new');
        expect(pending).toHaveLength(2);

        await act(async () =>
            pending[1]({ data: [{ name: 'New result' }], totalCount: 1 })
        );
        await act(async () =>
            pending[0]({ data: [{ name: 'Old result' }], totalCount: 1 })
        );
        expect(container.textContent).toContain('New result');
        expect(container.textContent).not.toContain('Old result');
    });

    test('refreshing after deleting the last row of a page loads the previous page', async () => {
        const tableRef = React.createRef();
        let count = 6;
        const source = jest.fn(async () => ({
            data: [{ name: 'User' }],
            totalCount: count,
        }));
        await render({
            columns: [{ field: 'name', title: 'Name' }],
            data: source,
            tableRef,
        });
        await click('[data-testid="pagination-next"]');
        count = 5;
        await act(async () => tableRef.current.onQueryChange());
        expect(source).toHaveBeenLastCalledWith(
            expect.objectContaining({ page: 0 })
        );
    });

    test('CSV download fetches every remote page rather than exporting only visible rows', async () => {
        const rows = Array.from({ length: 101 }, (_, id) => ({
            id,
            name: `User "${id}"`,
        }));
        const source = jest.fn(async ({ page, pageSize }) => ({
            data: rows.slice(page * pageSize, (page + 1) * pageSize),
            totalCount: rows.length,
        }));
        let exportedBlob;
        const originalCreate = URL.createObjectURL;
        const originalRevoke = URL.revokeObjectURL;
        URL.createObjectURL = jest.fn((blob) => {
            exportedBlob = blob;
            return 'blob:csv';
        });
        URL.revokeObjectURL = jest.fn();
        jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
            () => {}
        );
        try {
            await render({
                columns: [{ field: 'name', title: 'Name' }],
                data: source,
            });
            await click(`button[aria-label="${translations.DOWNLOAD}"]`);
            expect(source).toHaveBeenCalledWith({
                page: 0,
                pageSize: 100,
                search: '',
            });
            expect(source).toHaveBeenCalledWith({
                page: 1,
                pageSize: 100,
                search: '',
            });
            const csv = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsText(exportedBlob);
            });
            expect(csv.split('\n')).toHaveLength(102);
            expect(csv).toContain('"100","User ""100"""');
            expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:csv');
        } finally {
            URL.createObjectURL = originalCreate;
            URL.revokeObjectURL = originalRevoke;
        }
    });
});
