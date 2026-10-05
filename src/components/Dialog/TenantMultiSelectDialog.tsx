import React, { useEffect, useState } from 'react';

import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useTranslation } from 'react-i18next';

import Button from '../CustomButtons/Button';
import SnackbarContent from '../Snackbar/SnackbarContent';
import psonoServer from '../../services/api-server';
import store from '../../services/store';

export interface TenantMultiSelectDialogProps {
    group?: any;
    onSave: (...args: any[]) => any;
    onAbort: (...args: any[]) => any;
}
const responseError = (response: any) => {
    if (typeof response === 'string') return response;
    if (!response) return 'ERROR';
    const data = response.data || response;
    const value = data.non_field_errors || data.errors || data;
    if (Array.isArray(value)) return value[0];
    if (typeof value === 'string') return value;
    const fieldError = Object.values(value).find(Array.isArray);
    return fieldError ? fieldError[0] : 'ERROR';
};

const TenantMultiSelectDialog = ({
    group,
    onSave,
    onAbort,
}: TenantMultiSelectDialogProps) => {
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
            (tenant: any) =>
                !selectedTenants.some(
                    (selected: any) => selected.id === tenant.id
                )
        ),
    ].filter(
        (tenant) =>
            tenant.is_active !== false ||
            selectedTenants.some((selected: any) => selected.id === tenant.id)
    );

    const save = () => {
        setError('');
        setSaving(true);
        onSave(selectedTenants.map((tenant: any) => tenant.id)).then(
            () => onAbort(),
            (response: any) => {
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
                    filterOptions={(values: any) => values}
                    inputValue={tenantSearch}
                    loading={loading}
                    options={options}
                    getOptionLabel={(tenant: any) => tenant.name}
                    isOptionEqualToValue={(option: any, value: any) =>
                        option.id === value.id
                    }
                    value={selectedTenants}
                    onChange={(event: any, tenants: any) => {
                        setTenantSearch('');
                        setSelectedTenants(tenants);
                    }}
                    onInputChange={(event: any, value: any, reason: any) => {
                        if (reason === 'input' || reason === 'clear') {
                            setTenantSearch(value);
                        }
                    }}
                    renderInput={(params: any) => (
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

export default TenantMultiSelectDialog;
