import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';

const DeleteConfirmDialog = ({ title, children, onConfirm, onAbort }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(true);

    const handleAbort = () => {
        setOpen(false);
        onAbort();
    };

    const handleConfirm = () => {
        setOpen(false);
        onConfirm();
    };

    return (
        <Dialog
            open={open}
            onClose={handleAbort}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {children}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleAbort} color="primary">
                    {t('ABORT')}
                </Button>
                <Button onClick={handleConfirm} color="primary" autoFocus>
                    {t('CONFIRM')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

DeleteConfirmDialog.propTypes = {
    title: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onAbort: PropTypes.func.isRequired,
    children: PropTypes.node,
};

export default DeleteConfirmDialog;
