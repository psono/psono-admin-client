import React from 'react';
import matchPath from 'react-router/matchPath';
import PropTypes from 'prop-types';
import { Menu } from 'material-ui-icons';
import {
    withStyles,
    AppBar,
    Toolbar,
    IconButton,
    Hidden,
    Button
} from 'material-ui';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';

import { headerStyle } from '../../variables/styles';
import user from '../../services/user';

import HeaderLinks from './HeaderLinks';

class Header extends React.Component {
    makeBrand() {
        for (let i = 0; i < this.props.routes.length; i++) {
            if (
                matchPath(
                    this.props.location.pathname,
                    this.props.routes[i].path
                ) === null
            ) {
                continue;
            }
            return this.props.t(this.props.routes[i].navbarName);
        }
        return null;
    }
    render() {
        const { classes, color, ...rest } = this.props;
        return (
            <AppBar
                className={
                    classes.appBar +
                    (color !== undefined ? ' ' + classes[color] : '')
                }
            >
                <Toolbar className={classes.container}>
                    <div className={classes.flex}>
                        {/* Here we create navbar brand, based on route name */}
                        <Button href="#" className={classes.title}>
                            {this.makeBrand()}
                        </Button>
                    </div>
                    <Hidden smDown implementation="css">
                        <HeaderLinks {...rest} logout={user.logout} />
                    </Hidden>
                    <Hidden mdUp>
                        <IconButton
                            className={classes.appResponsive}
                            color="inherit"
                            aria-label="open drawer"
                            onClick={this.props.handleDrawerToggle}
                        >
                            <Menu />
                        </IconButton>
                    </Hidden>
                </Toolbar>
            </AppBar>
        );
    }
}

Header.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    color: PropTypes.oneOf(['primary', 'info', 'success', 'warning', 'danger'])
};

export default compose(
    withTranslation(),
    withStyles(headerStyle, { withTheme: true })
)(Header);
