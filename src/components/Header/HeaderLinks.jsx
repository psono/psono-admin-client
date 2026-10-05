import React from 'react';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { makeStyles, withStyles } from '@mui/styles';
import { MenuItem, ListItemIcon, Hidden } from '@mui/material';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Button from '../CustomButtons/Button.jsx';
import headerLinksStyle from '../../assets/jss/material-dashboard-react/headerLinksStyle';
import store from '../../services/store';

const useStyles = makeStyles((theme) => ({
    listItemIcon: {
        minWidth: theme.spacing(4),
    },
    flex: {
        flex: 1,
    },
    icon: {
        fontSize: '18px',
    },
    topMenuButton: {
        textTransform: 'none',
        position: 'absolute',
        bottom: '8px',
        right: '8px',
    },
    signInText: {
        marginRight: '10px',
        display: 'inline',
    },
    accountCircleIcon: {
        color: '#FFF',
    },
}));

const HeaderLinks = (props) => {
    const { t } = props;
    const classes = useStyles();
    const history = useHistory();
    const [anchorTopMenuEl, setAnchorTopMenuEl] = React.useState(null);

    const openTopMenu = (event) => {
        setAnchorTopMenuEl(event.currentTarget);
    };
    const closeTopMenu = () => {
        setAnchorTopMenuEl(null);
    };

    const logout = () => {
        props.logout();
    };

    const openAccount = () => {
        closeTopMenu();
        history.push('/account/change-password');
    };

    return (
        <div className={classes.flex}>
            <div style={{ float: 'right' }}>
                <Hidden mdUp>
                    <IconButton
                        variant="contained"
                        onClick={openTopMenu}
                        className={classes.topMenuButton}
                    >
                        <AccountCircleIcon
                            className={classes.accountCircleIcon}
                        />
                    </IconButton>
                </Hidden>
                <Hidden smDown>
                    <div className={classes.signInText}>
                        {t('SIGNED_IN_AS')}
                    </div>
                    <Button
                        variant="contained"
                        aria-controls="top-menu"
                        aria-haspopup="true"
                        onClick={openTopMenu}
                        color="primary"
                        disableElevation
                        className={classes.topMenuButton}
                        endIcon={<ExpandMoreIcon />}
                    >
                        {store.getState().user.username}
                    </Button>
                </Hidden>
                <Menu
                    id="top-menu"
                    anchorEl={anchorTopMenuEl}
                    keepMounted
                    open={Boolean(anchorTopMenuEl)}
                    onClose={closeTopMenu}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={openAccount}>
                        <ListItemIcon className={classes.listItemIcon}>
                            <AccountCircleIcon className={classes.icon} />
                        </ListItemIcon>
                        <Typography variant="body2">{t('ACCOUNT')}</Typography>
                    </MenuItem>
                    <MenuItem onClick={logout}>
                        <ListItemIcon className={classes.listItemIcon}>
                            <ExitToAppIcon className={classes.icon} />
                        </ListItemIcon>
                        <Typography variant="body2">{t('LOGOUT')}</Typography>
                    </MenuItem>
                </Menu>
            </div>
        </div>
    );
};

export default compose(
    withTranslation(),
    withStyles(headerLinksStyle)
)(HeaderLinks);
