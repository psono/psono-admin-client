import React from 'react';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles, MenuItem, ListItemIcon, Hidden } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Menu from '@material-ui/core/Menu';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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
