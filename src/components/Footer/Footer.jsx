import React from 'react';
import PropTypes from 'prop-types';
import { List, ListItem, withStyles } from 'material-ui';

import { footerStyle } from '../../variables/styles';

class Footer extends React.Component {
    render() {
        const { classes } = this.props;
        return (
            <footer className={classes.footer}>
                <div className={classes.container}>
                    <div className={classes.left}>
                        <List className={classes.list}>
                            <ListItem className={classes.inlineBlock}>
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://psono.com"
                                    className={classes.block}
                                >
                                    Psono.com
                                </a>
                            </ListItem>
                            <ListItem className={classes.inlineBlock}>
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://doc.psono.com/"
                                    className={classes.block}
                                >
                                    Documentation
                                </a>
                            </ListItem>
                        </List>
                    </div>
                    <p className={classes.right}>
                        <span>
                            &copy; {1900 + new Date().getYear()}{' '}
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href="http://www.psono.com"
                                className={classes.a}
                            >
                                Psono
                            </a>
                        </span>
                    </p>
                </div>
            </footer>
        );
    }
}

Footer.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(footerStyle)(Footer);
