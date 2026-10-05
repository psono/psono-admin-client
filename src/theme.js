import { createTheme } from '@mui/material/styles';

// Keep the dashboard's existing colors, form variants and responsive layout.
const theme = createTheme({
    palette: {
        primary: { main: '#3f51b5' },
        secondary: { main: '#f50057' },
    },
    breakpoints: {
        values: { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 },
    },
    components: {
        MuiTextField: { defaultProps: { variant: 'standard' } },
        MuiFormControl: { defaultProps: { variant: 'standard' } },
        MuiSelect: { defaultProps: { variant: 'standard' } },
        MuiIconButton: { defaultProps: { size: 'large' } },
    },
});

export default theme;
