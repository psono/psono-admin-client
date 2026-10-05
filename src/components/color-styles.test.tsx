import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import MuiButton from '@mui/material/Button';
import Button from './CustomButtons/Button';
import Sidebar from './Sidebar/Sidebar';
import theme from '../theme';

jest.mock('../i18n', () => ({ t: (key: string) => key }));
// Responsive visibility is outside this test; jsdom has no media-query layout.
jest.mock('@mui/material/Hidden', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('react-i18next', () => {
    const React = require('react') as typeof import('react');
    return {
        useTranslation: () => ({ t: (key: string) => key }),
        withTranslation:
            () =>
            (Component: React.ComponentType<any>) =>
            (props: Record<string, unknown>) =>
                React.createElement(Component, {
                    ...props,
                    t: (key: string) => key,
                }),
    };
});

describe('dashboard text colors', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        act(() => {
            ReactDOM.unmountComponentAtNode(container);
        });
        container.remove();
    });

    const render = (children: React.ReactNode) => {
        act(() => {
            ReactDOM.render(
                <StyledEngineProvider injectFirst>
                    <ThemeProvider theme={theme}>
                        <MemoryRouter initialEntries={['/users']}>
                            {children}
                        </MemoryRouter>
                    </ThemeProvider>
                </StyledEngineProvider>,
                container
            );
        });
    };

    test('the primary login button has white text on its purple background', () => {
        // Prime Emotion before JSS: jsdom uses stylesheet creation order rather
        // than the DOM insertion order configured by injectFirst in browsers.
        render(<MuiButton>Warm up styles</MuiButton>);
        render(<Button color="primary">LOGIN</Button>);
        const button = container.querySelector('button')!;
        expect(getComputedStyle(button).color).toBe('rgb(255, 255, 255)');
        expect(getComputedStyle(button).backgroundColor).toBe(
            'rgb(156, 39, 176)'
        );
    });

    test('active, inactive, and settings menu labels have white text', () => {
        render(
            <Sidebar
                color="blue"
                logo="/logo.png"
                handleDrawerToggle={() => {}}
                routes={[
                    { path: '/users', sidebarName: 'USERS', icon: () => null },
                    {
                        path: '/groups',
                        sidebarName: 'GROUPS',
                        icon: () => null,
                    },
                    {
                        path: '/tenants',
                        sidebarName: 'TENANTS',
                        sidebarGroup: 'SETTINGS',
                        icon: () => null,
                    },
                ]}
            />
        );
        for (const label of ['USERS', 'GROUPS', 'SETTINGS']) {
            const text = Array.from(
                container.querySelectorAll('.MuiListItemText-root')
            ).find((element) => element.textContent === label);
            expect(text).toBeDefined();
            expect(getComputedStyle(text!).color).toBe('rgb(255, 255, 255)');
        }
    });
});
