import React from 'react';

import { useTranslation } from 'react-i18next';

import { makeStyles } from '@mui/styles';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { languages } from '../../i18n';

export interface SelectFieldLanguageProps {
    fullWidth?: any;
    variant?: any;
    margin?: any;
    size?: string;
    helperText?: React.ReactNode;
    error?: boolean;
    required?: any;
    onChange: (...args: any[]) => any;
    value?: any;
    className?: string;
    disabled?: boolean;
}
const useStyles = makeStyles(() => ({
    option: {
        fontSize: 15,
        '& > span': {
            marginRight: 10,
            fontSize: 18,
        },
    },
}));

const SelectFieldLanguage = (props: SelectFieldLanguageProps) => {
    const classes: Record<string, string> = useStyles();
    const { t } = useTranslation();

    const lngs: any = [];

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
        disabled,
    } = props;

    let defaultValue = null;
    if (value && lngs && lngs.length) {
        defaultValue =
            lngs.find((language: any) => language.value === value) || null;
    }

    return (
        <Autocomplete
            disabled={disabled}
            options={lngs}
            disableClearable={required}
            classes={{
                option: classes.option,
            }}
            autoHighlight
            getOptionLabel={(option: any) => {
                return option ? option.title : '';
            }}
            onChange={(event: any, newValue: any) => {
                if (newValue) {
                    onChange(newValue.value);
                } else {
                    onChange('');
                }
            }}
            isOptionEqualToValue={(option: any, value: any) => {
                if (option) {
                    return option.value === value.value;
                } else {
                    return false;
                }
            }}
            value={defaultValue}
            renderInput={(params: any) => (
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

export default SelectFieldLanguage;
