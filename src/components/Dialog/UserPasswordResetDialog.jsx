import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import Button from '../CustomButtons/Button.jsx';
import SnackbarContent from '../Snackbar/SnackbarContent.jsx';
import psonoServer from '../../services/api-server';
import store from '../../services/store';
import { apiErrorCode } from '../../services/api-error';
import { createAdminRecoveryResetPayload } from '../../services/user-password-reset';

const UserPasswordResetDialog = ({ user, onSuccess, onAbort }) => {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [adminRecoveryPrivateKey, setAdminRecoveryPrivateKey] = useState('');
    const [requirePasswordChange, setRequirePasswordChange] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const passwordsMatch = password === passwordRepeat;

    const close = (force = false) => {
        if (saving && !force) return;
        setPassword('');
        setPasswordRepeat('');
        setAdminRecoveryPrivateKey('');
        setRequirePasswordChange(true);
        onAbort();
    };

    const save = async () => {
        setError('');
        if (!passwordsMatch) {
            setError('PASSWORDS_DONT_MATCH');
            return;
        }
        if (password.length < 12) {
            setError('PASSWORD_TOO_SHORT');
            return;
        }

        setSaving(true);
        const state = store.getState();
        try {
            const response = await psonoServer.admin_read_user_password_reset(
                state.user.token,
                state.user.session_secret_key,
                user.id
            );
            const payload = createAdminRecoveryResetPayload(
                response.data,
                password,
                adminRecoveryPrivateKey,
                requirePasswordChange
            );

            await psonoServer.admin_reset_user_password(
                state.user.token,
                state.user.session_secret_key,
                user.id,
                payload
            );
            close(true);
            onSuccess();
        } catch (response) {
            setSaving(false);
            setError(
                response instanceof Error
                    ? response.message
                    : apiErrorCode(response)
            );
        }
    };

    return (
        <Dialog open fullWidth maxWidth="sm" onClose={() => close()}>
            <DialogTitle>{t('RESET_USER_PASSWORD')}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t('RESET_USER_PASSWORD_DESCRIPTION')}
                </DialogContentText>
                <TextField
                    autoFocus
                    fullWidth
                    margin="normal"
                    label={t('NEW_PASSWORD')}
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label={t('NEW_PASSWORD_REPEAT')}
                    type="password"
                    autoComplete="new-password"
                    value={passwordRepeat}
                    onChange={(event) => setPasswordRepeat(event.target.value)}
                    error={Boolean(passwordRepeat) && !passwordsMatch}
                    helperText={
                        passwordRepeat && !passwordsMatch
                            ? t('PASSWORDS_DONT_MATCH')
                            : ''
                    }
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label={t('ADMIN_RECOVERY_PRIVATE_KEY')}
                    type="password"
                    autoComplete="off"
                    value={adminRecoveryPrivateKey}
                    onChange={(event) =>
                        setAdminRecoveryPrivateKey(event.target.value)
                    }
                />
                <DialogContentText>
                    {t('ADMIN_RECOVERY_PRIVATE_KEY_LOCAL_ONLY')}
                </DialogContentText>
                <div>
                    <Checkbox
                        checked={requirePasswordChange}
                        onChange={(event) =>
                            setRequirePasswordChange(event.target.checked)
                        }
                    />{' '}
                    {t('REQUIRE_PASSWORD_CHANGE')}
                </div>
                {error && <SnackbarContent message={t(error)} color="danger" />}
            </DialogContent>
            <DialogActions>
                <Button disabled={saving} onClick={close}>
                    {t('ABORT')}
                </Button>
                <Button
                    color="primary"
                    disabled={
                        saving ||
                        !password ||
                        !passwordRepeat ||
                        !passwordsMatch ||
                        !adminRecoveryPrivateKey
                    }
                    onClick={save}
                >
                    {t('RESET_PASSWORD')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

UserPasswordResetDialog.propTypes = {
    user: PropTypes.object.isRequired,
    onSuccess: PropTypes.func.isRequired,
    onAbort: PropTypes.func.isRequired,
};

export default UserPasswordResetDialog;
