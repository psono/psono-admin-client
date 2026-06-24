import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { languages } from '../../i18n';

const useStyles = makeStyles(() => ({
    option: {
        fontSize: 15,
        '& > span': {
            marginRight: 10,
            fontSize: 18,
        },
    },
}));

const SelectFieldLanguage = (props) => {
    const classes = useStyles();
    const { t } = useTranslation();

    const lngs = [];

    Object.entries(languages).forEach(([, value]) => {
        if (value.active) {
            lngs.push({ value: value.code, title: value.lng_title_native });
        }
    });

    const {
        fullWidth,
        variant,
        margin,
        size,
        helperText,
        error,
        required,
        onChange,
        value,
        className,
    } = props;

    let defaultValue = null;
    if (value && lngs && lngs.length) {
        defaultValue =
            lngs.find((language) => language.value === value) || null;
    }

    return (
        <Autocomplete
            options={lngs}
            disableClearable={required}
            classes={{
                option: classes.option,
            }}
            autoHighlight
            getOptionLabel={(option) => {
                return option ? option.title : '';
            }}
            onChange={(event, newValue) => {
                if (newValue) {
                    onChange(newValue.value);
                } else {
                    onChange('');
                }
            }}
            getOptionSelected={(option, value) => {
                if (option) {
                    return option.value === value.value;
                } else {
                    return '';
                }
            }}
            value={defaultValue}
            renderInput={(params) => (
                <TextField
                    className={className}
                    {...params}
                    label={t('LANGUAGE')}
                    required={required}
                    margin={margin}
                    size={size}
                    variant={variant}
                    helperText={helperText}
                    error={error}
                    fullWidth={fullWidth}
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password',
                    }}
                />
            )}
        />
    );
};

SelectFieldLanguage.defaultProps = {
    error: false,
};

SelectFieldLanguage.propTypes = {
    value: PropTypes.string,
    fullWidth: PropTypes.bool,
    error: PropTypes.bool,
    required: PropTypes.bool,
    helperText: PropTypes.string,
    variant: PropTypes.string,
    margin: PropTypes.string,
    size: PropTypes.string,
    onChange: PropTypes.func,
    className: PropTypes.string,
};

export default SelectFieldLanguage;
