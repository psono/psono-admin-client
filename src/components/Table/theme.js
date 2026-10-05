import { createTheme } from '@mui/material/styles';

// Match psono-client's table typography and component overrides.
export default function createTableTheme(theme) {
    return createTheme({
        ...theme,
        typography: {
            fontFamily: '"Open Sans", sans-serif',
            fontSize: 13,
        },
        components: {
            ...theme.components,
            MuiTextField: {
                ...theme.components.MuiTextField,
                defaultProps: {
                    ...theme.components.MuiTextField?.defaultProps,
                    margin: 'dense',
                    size: 'small',
                },
            },
            MuiToolbar: {
                styleOverrides: {
                    regular: {
                        height: '48px',
                        minHeight: '48px',
                        '@media(min-width:600px)': {
                            minHeight: '48px',
                        },
                    },
                },
            },
            MUIDataTable: {
                styleOverrides: {
                    paper: { boxShadow: 'none' },
                },
            },
        },
    });
}
