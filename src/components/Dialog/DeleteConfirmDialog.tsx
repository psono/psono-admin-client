import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export interface DeleteConfirmDialogProps {
    title?: React.ReactNode;
    children?: React.ReactNode;
    onConfirm: (...args: any[]) => any;
    onAbort: (...args: any[]) => any;
}
const DeleteConfirmDialog = ({
    title,
    children,
    onConfirm,
    onAbort,
}: DeleteConfirmDialogProps) => {
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

export default DeleteConfirmDialog;
