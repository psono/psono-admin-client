import type { ApiRecord } from '../../types/api';
import React from 'react';
import { FormControl, InputLabel, Input, FormHelperText } from '@mui/material';
import type {
    FormControlProps,
    InputLabelProps,
    InputProps,
} from '@mui/material';
import { withStyles } from '@mui/styles';
import { Clear, Check } from '@mui/icons-material';

import customInputStyle from '../../assets/jss/material-dashboard-react/customInputStyle';

export interface CustomInputProps {
    classes: Record<string, string>;
    formControlProps?: FormControlProps;
    helperText?: React.ReactNode;
    labelText?: React.ReactNode;
    id?: string;
    labelProps?: InputLabelProps;
    inputProps?: InputProps;
    error?: boolean;
    success?: boolean;
}
const CustomInput = ({
    classes,
    formControlProps = {},
    helperText,
    labelText,
    id,
    labelProps,
    inputProps,
    error,
    success,
}: CustomInputProps) => {
    return (
        <FormControl
            {...formControlProps}
            className={`${formControlProps.className} ${classes.formControl}`}
            error={error}
        >
            {labelText !== undefined ? (
                <InputLabel
                    classes={{
                        root:
                            classes.labelRoot +
                            (error
                                ? ` ${classes.labelRootError}`
                                : success
                                ? ` ${classes.labelRootSuccess}`
                                : ''),
                    }}
                    htmlFor={id}
                    {...labelProps}
                >
                    {labelText}
                </InputLabel>
            ) : null}
            <Input
                classes={{
                    root: labelText !== undefined ? '' : classes.marginTop,
                    disabled: classes.disabled,
                    underline: `${classes.underline} ${
                        error
                            ? classes.underlineError
                            : success
                            ? classes.underlineSuccess
                            : ''
                    }`,
                }}
                id={id}
                {...inputProps}
            />
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
            {error ? (
                <Clear
                    className={`${classes.feedback} ${classes.labelRootError}`}
                />
            ) : success ? (
                <Check
                    className={`${classes.feedback} ${classes.labelRootSuccess}`}
                />
            ) : null}
        </FormControl>
    );
};

export default withStyles(customInputStyle)(CustomInput);
