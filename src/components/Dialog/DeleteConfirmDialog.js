import React from 'react';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';

class DeleteConfirmDialog extends React.Component {
    state = {
        open: true
    };

    handleAbort = () => {
        this.props.onAbort();
    };

    handleConfirm = () => {
        this.props.onConfirm();
    };

    render() {
        const { t, title, children } = this.props;
        return (
            <Dialog
                open={this.state.open}
                onClose={this.handleAbort}
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
                    <Button onClick={this.handleAbort} color="primary">
                        {t('ABORT')}
                    </Button>
                    <Button
                        onClick={this.handleConfirm}
                        color="primary"
                        autoFocus
                    >
                        {t('CONFIRM')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

DeleteConfirmDialog.propTypes = {
    title: PropTypes.string,
    onConfirm: PropTypes.func,
    onAbort: PropTypes.func
};

export default compose(withTranslation())(DeleteConfirmDialog);
