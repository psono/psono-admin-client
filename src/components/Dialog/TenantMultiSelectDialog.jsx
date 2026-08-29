import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useTranslation } from 'react-i18next';

import Button from '../CustomButtons/Button.jsx';
import SnackbarContent from '../Snackbar/SnackbarContent.jsx';
import psonoServer from '../../services/api-server';
import store from '../../services/store';

const responseError = (response) => {
    if (typeof response === 'string') return response;
    if (!response) return 'ERROR';
    const data = response.data || response;
    const value = data.non_field_errors || data.errors || data;
    if (Array.isArray(value)) return value[0];
    if (typeof value === 'string') return value;
    const fieldError = Object.values(value).find(Array.isArray);
    return fieldError ? fieldError[0] : 'ERROR';
};

const TenantMultiSelectDialog = ({ group, onSave, onAbort }) => {
    const { t } = useTranslation();
    const [selectedTenants, setSelectedTenants] = useState(group.tenants || []);
    const [tenantOptions, setTenantOptions] = useState(group.tenants || []);
    const [tenantSearch, setTenantSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        setLoading(true);
        const timer = setTimeout(() => {
            psonoServer
                .admin_identity_provider_tenant(
                    store.getState().user.token,
                    store.getState().user.session_secret_key,
                    {
                        page_size: 5,
                        page: 0,
                        search: tenantSearch,
                    }
                )
                .then(
                    (response) => {
                        if (!active) return;
                        setTenantOptions(response.data.tenants);
                        setLoading(false);
                    },
                    (response) => {
                        if (!active) return;
                        setTenantOptions([]);
                        setLoading(false);
                        setError(responseError(response));
                    }
                );
        }, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [tenantSearch]);

    const options = [
        ...selectedTenants,
        ...tenantOptions.filter(
            (tenant) =>
                !selectedTenants.some((selected) => selected.id === tenant.id)
        ),
    ].filter(
        (tenant) =>
            tenant.is_active !== false ||
            selectedTenants.some((selected) => selected.id === tenant.id)
    );

    const save = () => {
        setError('');
        setSaving(true);
        onSave(selectedTenants.map((tenant) => tenant.id)).then(
            () => onAbort(),
            (response) => {
                setSaving(false);
                setError(responseError(response));
            }
        );
    };

    return (
        <Dialog open fullWidth maxWidth="sm" onClose={onAbort}>
            <DialogTitle>{t('TENANTS')}</DialogTitle>
            <DialogContent>
                <Autocomplete
                    multiple
                    autoHighlight
                    filterSelectedOptions
                    limitTags={5}
                    filterOptions={(values) => values}
                    inputValue={tenantSearch}
                    loading={loading}
                    options={options}
                    getOptionLabel={(tenant) => tenant.name}
                    getOptionSelected={(option, value) =>
                        option.id === value.id
                    }
                    value={selectedTenants}
                    onChange={(event, tenants) => {
                        setTenantSearch('');
                        setSelectedTenants(tenants);
                    }}
                    onInputChange={(event, value, reason) => {
                        if (reason === 'input' || reason === 'clear') {
                            setTenantSearch(value);
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            fullWidth
                            margin="normal"
                            label={t('TENANTS')}
                            inputProps={{
                                ...params.inputProps,
                                autoComplete: 'new-password',
                            }}
                        />
                    )}
                />
                {error && <SnackbarContent message={t(error)} color="danger" />}
            </DialogContent>
            <DialogActions>
                <Button onClick={onAbort}>{t('ABORT')}</Button>
                <Button color="primary" disabled={saving} onClick={save}>
                    {t('SAVE')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

TenantMultiSelectDialog.propTypes = {
    group: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onAbort: PropTypes.func.isRequired,
};

export default TenantMultiSelectDialog;
