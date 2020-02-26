import React from 'react';
import {
    withStyles,
    FormControl,
    InputLabel,
    Input,
    FormHelperText
} from '@material-ui/core';
import { Clear, Check } from '@material-ui/icons';
import PropTypes from 'prop-types';

import customInputStyle from '../../assets/jss/material-dashboard-react/customInputStyle';

class CustomInput extends React.Component {
    render() {
        const {
            classes,
            formControlProps,
            helperText,
            labelText,
            id,
            labelProps,
            inputProps,
            error,
            success
        } = this.props;
        return (
            <FormControl
                {...formControlProps}
                className={
                    formControlProps.className + ' ' + classes.formControl
                }
                error={error}
            >
                {labelText !== undefined ? (
                    <InputLabel
                        classes={{
                            root:
                                classes.labelRoot +
                                (error
                                    ? ' ' + classes.labelRootError
                                    : success
                                        ? ' ' + classes.labelRootSuccess
                                        : '')
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
                        underline: classes.underline,
                        inkbar: error
                            ? classes.inkbarError
                            : success ? classes.inkbarSuccess : classes.inkbar
                    }}
                    id={id}
                    {...inputProps}
                />
                {helperText ? (
                    <FormHelperText>{helperText}</FormHelperText>
                ) : null}
                {error ? (
                    <Clear
                        className={
                            classes.feedback + ' ' + classes.labelRootError
                        }
                    />
                ) : success ? (
                    <Check
                        className={
                            classes.feedback + ' ' + classes.labelRootSuccess
                        }
                    />
                ) : null}
            </FormControl>
        );
    }
}

CustomInput.propTypes = {
    classes: PropTypes.object.isRequired,
    helperText: PropTypes.node,
    labelText: PropTypes.node,
    labelProps: PropTypes.object,
    id: PropTypes.string,
    inputProps: PropTypes.object,
    formControlProps: PropTypes.object,
    error: PropTypes.bool,
    success: PropTypes.bool
};

export default withStyles(customInputStyle)(CustomInput);
