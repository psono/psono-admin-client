import React from 'react';

import { List, ListItem } from '@mui/material';
import { withStyles } from '@mui/styles';

import footerStyle from '../../assets/jss/material-dashboard-react/footerStyle';

export interface FooterProps {
    classes: Record<string, string>;
}
const Footer = ({ classes }: FooterProps) => {
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
                        &copy; {new Date().getFullYear()}{' '}
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
};

export default withStyles(footerStyle)(Footer);
