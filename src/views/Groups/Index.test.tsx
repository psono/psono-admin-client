import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import GroupsView from './Index';
import api from '../../services/api-server';
import store from '../../services/store';

jest.mock('../../services/api-server', () => ({ admin_group: jest.fn() }));
jest.mock('../../services/store', () => ({ getState: jest.fn() }));
jest.mock('../../components/Dialog/DeleteConfirmDialog', () => () => null);
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) =>
            require('../../../public/locales/locale-en.json')[key] || key,
    }),
}));
jest.mock('@mui/material', () => {
    const React = require('react');
    return {
        ...jest.requireActual('@mui/material'),
        Tooltip: ({ title, children }: any) => (
            <span data-tooltip={title}>{children}</span>
        ),
    };
});
jest.mock('../../components', () => {
    const React = require('react') as typeof import('react');
    return {
        GridItem: ({ children }: any) => <div>{children}</div>,
        RegularCard: ({ content }: any) => <section>{content}</section>,
        SnackbarContent: ({ message, color }: any) => (
            <div role="status" data-color={color}>
                {message}
            </div>
        ),
        CustomMaterialTable: ({ columns, data }: any) => {
            const [rows, setRows] = React.useState<any[]>([]);
            React.useEffect(() => {
                let active = true;
                data({ page: 0, pageSize: 5, search: '' }).then(
                    (result: any) => {
                        if (active) setRows(result.data);
                    }
                );
                return () => {
                    active = false;
                };
            }, [data]);
            return (
                <table>
                    <thead>
                        <tr>
                            {columns.map((column: any) => (
                                <th key={column.field}>{column.title}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row: any) => (
                            <tr key={row.id}>
                                {columns.map((column: any) => (
                                    <td key={column.field}>
                                        {column.render
                                            ? column.render(row)
                                            : row[column.field]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        },
    };
});

describe('group overview key health', () => {
    let container: HTMLDivElement;
    let state: any;
    const group = {
        id: 'group-1',
        name: 'Test group',
        create_date: '2026-01-01',
        member_count: 1,
        is_managed: false,
        tenant_ids: [],
    };

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        state = {
            server: { type: 'EE', admin_recovery_public_key_configured: true },
            user: {
                token: 'token',
                session_secret_key: 'session',
                authorization: {
                    is_superuser: true,
                    capabilities: [],
                },
            },
        };
        jest.mocked(store.getState).mockImplementation(() => state);
        jest.mocked(api.admin_group).mockResolvedValue({
            data: { count: 1, groups: [{ ...group }] },
        });
    });

    afterEach(() => {
        act(() => {
            ReactDOM.unmountComponentAtNode(container);
        });
        container.remove();
        jest.clearAllMocks();
    });

    async function render() {
        await act(async () => {
            ReactDOM.render(
                <MemoryRouter>
                    <GroupsView />
                </MemoryRouter>,
                container
            );
        });
    }

    test('shows summaries and details without DB_SECRET backup information on EE', async () => {
        jest.mocked(api.admin_group).mockResolvedValue({
            data: {
                count: 3,
                groups: [
                    {
                        ...group,
                        id: 'users',
                        has_active_user_key_copies: true,
                        admin_recovery_exists: true,
                    },
                    {
                        ...group,
                        id: 'escrow',
                        has_active_user_key_copies: false,
                        admin_recovery_exists: true,
                    },
                    {
                        ...group,
                        id: 'none',
                        has_active_user_key_copies: false,
                        admin_recovery_exists: false,
                    },
                ],
            },
        });
        await render();

        expect(container.textContent).toContain('Key recovery');
        expect(container.textContent).toContain('User key copies available');
        expect(container.textContent).toContain(
            'Administrator recovery available'
        );
        expect(container.textContent).toContain(
            'No user copies or administrator escrow'
        );
        const details = Array.from(
            container.querySelectorAll('[data-tooltip]')
        ).map((element) => element.getAttribute('data-tooltip'));
        expect(details[0]).toContain('Active-user key copies: Yes');
        expect(details[0]).toContain('Administrator escrow: Yes');
        expect(details[1]).toContain('Active-user key copies: No');
        expect(details[2]).toContain('Administrator escrow: No');
        expect(details.join(' ')).not.toContain('DB_SECRET');
    });

    test('shows missing administrator configuration as an informational message', async () => {
        state.server.admin_recovery_public_key_configured = false;
        await render();

        const message = container.querySelector('[role="status"]');
        expect(message?.textContent).toContain(
            'ADMIN_RECOVERY_PUBLIC_KEY is missing'
        );
        expect(message?.getAttribute('data-color')).toBe('info');
    });

    test.each([true, undefined])(
        'does not show the configuration message for %p',
        async (configured) => {
            state.server.admin_recovery_public_key_configured = configured;
            await render();
            expect(container.querySelector('[role="status"]')).toBeNull();
        }
    );

    test('shows not reported for an older EE response without health fields', async () => {
        await render();
        expect(container.textContent).toContain('Not reported');
        expect(container.textContent).not.toContain(
            'No user copies or administrator escrow'
        );
    });

    test.each([true, false, undefined])(
        'omits the health column and configuration message entirely on CE: %p',
        async (configured) => {
            state.server = {
                type: 'CE',
                admin_recovery_public_key_configured: configured,
            };
            await render();

            expect(container.textContent).toContain('Test group');
            expect(container.textContent).not.toContain('Key recovery');
            expect(container.textContent).not.toContain('Not reported');
            expect(container.querySelector('[data-tooltip]')).toBeNull();
            expect(container.querySelector('[role="status"]')).toBeNull();
        }
    );
});
