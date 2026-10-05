import React from 'react';
import { FormControl, InputLabel, Input, FormHelperText } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Clear, Check } from '@mui/icons-material';
import PropTypes from 'prop-types';

import customInputStyle from '../../assets/jss/material-dashboard-react/customInputStyle';

const CustomInput = ({
    classes,
    formControlProps,
    helperText,
    labelText,
    id,
    labelProps,
    inputProps,
    error,
    success,
}) => {
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

CustomInput.propTypes = {
    classes: PropTypes.object.isRequired,
    helperText: PropTypes.node,
    labelText: PropTypes.node,
    labelProps: PropTypes.object,
    id: PropTypes.string,
    inputProps: PropTypes.object,
    formControlProps: PropTypes.object,
    error: PropTypes.bool,
    success: PropTypes.bool,
};

export default withStyles(customInputStyle)(CustomInput);
