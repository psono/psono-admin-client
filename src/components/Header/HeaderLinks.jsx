import React from 'react';
import {
    Person //, Notifications, Dashboard, Search,
} from '@material-ui/icons';
import classNames from 'classnames';
import {
    withStyles,
    MenuItem,
    MenuList,
    Grow,
    Paper,
    ClickAwayListener,
    Hidden
} from '@material-ui/core';
import Button from '../CustomButtons/Button.jsx';

import headerLinksStyle from '../../assets/jss/material-dashboard-react/headerLinksStyle';
import Poppers from '@material-ui/core/Popper';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';

class HeaderLinks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openProfile: null
        };
    }

    render() {
        const { classes, t } = this.props;
        const { openProfile } = this.state;

        const handleClickProfile = event => {
            if (openProfile && openProfile.contains(event.target)) {
                this.setState({ openProfile: null });
            } else {
                this.setState({ openProfile: event.currentTarget });
            }
        };
        const handleCloseProfile = () => {
            this.setState({ openProfile: null });
        };

        const logout = () => {
            this.props.logout();
            this.setState({ openProfile: null });
        };
        return (
            <div>
                <div className={classes.manager}>
                    <Button
                        color={
                            window.innerWidth > 959 ? 'transparent' : 'white'
                        }
                        justIcon={window.innerWidth > 959}
                        simple={!(window.innerWidth > 959)}
                        aria-owns={
                            openProfile ? 'profile-menu-list-grow' : null
                        }
                        aria-haspopup="true"
                        onClick={handleClickProfile}
                        className={classes.buttonLink}
                    >
                        <Person className={classes.icons} />
                        <Hidden mdUp implementation="css">
                            <p className={classes.linkText}>{t('PROFILE')}</p>
                        </Hidden>
                    </Button>
                    <Poppers
                        open={Boolean(openProfile)}
                        anchorEl={openProfile}
                        transition
                        disablePortal
                        className={
                            classNames({
                                [classes.popperClose]: !openProfile
                            }) +
                            ' ' +
                            classes.popperNav
                        }
                    >
                        {({ TransitionProps, placement }) => (
                            <Grow
                                {...TransitionProps}
                                id="profile-menu-list-grow"
                                style={{
                                    transformOrigin:
                                        placement === 'bottom'
                                            ? 'center top'
                                            : 'center bottom'
                                }}
                            >
                                <Paper>
                                    <ClickAwayListener
                                        onClickAway={handleCloseProfile}
                                    >
                                        <MenuList role="menu">
                                            <MenuItem
                                                onClick={logout}
                                                className={classes.dropdownItem}
                                            >
                                                {t('LOGOUT')}
                                            </MenuItem>
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Poppers>
                </div>
            </div>
        );
    }
}

export default compose(withTranslation(), withStyles(headerLinksStyle))(
    HeaderLinks
);
