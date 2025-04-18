import React, { useState } from 'react';
import { Grid } from '@material-ui/core';
import { AddAlert } from '@material-ui/icons';

import {
    RegularCard,
    A,
    P,
    Small,
    Button,
    SnackbarContent,
    Snackbar,
    GridItem,
} from '../../components';

const Notifications = () => {
    const [notificationState, setNotificationState] = useState({
        tl: false,
        tc: false,
        tr: false,
        bl: false,
        bc: false,
        br: false,
    });

    const showNotification = (place) => {
        setNotificationState({ ...notificationState, [place]: true });
        setTimeout(() => {
            setNotificationState({ ...notificationState, [place]: false });
        }, 6000);
    };

    return (
        <RegularCard
            cardTitle="Notifications"
            cardSubtitle={
                <P>
                    Handcrafted by our friends from{' '}
                    <A target="_blank" href="https://material-ui-next.com/">
                        Material UI
                    </A>{' '}
                    and styled by{' '}
                    <A target="_blank" href="https://www.creative-tim.com/">
                        Creative Tim
                    </A>
                    . Please checkout the{' '}
                    <A href="#pablo" target="_blank">
                        full documentation
                    </A>
                    .
                </P>
            }
            content={
                <div>
                    <Grid container>
                        <GridItem xs={12} sm={12} md={6}>
                            <h5>Notifications Style</h5>
                            <br />
                            <SnackbarContent
                                message={'This is a plain notification'}
                            />
                            <br />
                            <SnackbarContent
                                message={
                                    'This is a notification with close button.'
                                }
                                close
                            />
                            <br />
                            <SnackbarContent
                                message={
                                    'This is a notification with close button and icon.'
                                }
                                close
                                icon={AddAlert}
                            />
                            <br />
                            <SnackbarContent
                                message={
                                    "This is a notification with close button and icon and have many lines. You can see that the icon and the close button are always vertically aligned. This is a beautiful notification. So you don't have to worry about the style."
                                }
                                close
                                icon={AddAlert}
                            />
                            <br />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                            <h5>Notifications States</h5>
                            <br />
                            <SnackbarContent
                                message={
                                    'INFO - This is a regular notification made with color="info"'
                                }
                                close
                                color="info"
                            />
                            <br />
                            <SnackbarContent
                                message={
                                    'SUCCESS - This is a regular notification made with color="success"'
                                }
                                close
                                color="success"
                            />
                            <br />
                            <SnackbarContent
                                message={
                                    'WARNING - This is a regular notification made with color="warning"'
                                }
                                close
                                color="warning"
                            />
                            <br />
                            <SnackbarContent
                                message={
                                    'DANGER - This is a regular notification made with color="danger"'
                                }
                                close
                                color="danger"
                            />
                            <br />
                            <SnackbarContent
                                message={
                                    'PRIMARY - This is a regular notification made with color="primary"'
                                }
                                close
                                color="primary"
                            />
                            <br />
                        </GridItem>
                    </Grid>
                    <br />
                    <br />
                    <Grid container justify="center">
                        <GridItem
                            xs={12}
                            sm={12}
                            md={6}
                            style={{ textAlign: 'center' }}
                        >
                            <h5>
                                Notifications Places
                                <Small>Click to view notifications</Small>
                            </h5>
                        </GridItem>
                    </Grid>
                    <Grid container justify="center">
                        <GridItem xs={12} sm={12} md={10} lg={8}>
                            <Grid container>
                                <GridItem xs={12} sm={12} md={4}>
                                    <Button
                                        fullWidth
                                        color="primary"
                                        onClick={() => showNotification('tl')}
                                    >
                                        Top Left
                                    </Button>
                                    <Snackbar
                                        place="tl"
                                        color="info"
                                        icon={AddAlert}
                                        message="Welcome to MATERIAL DASHBOARD React - a beautiful freebie for every web developer."
                                        open={notificationState.tl}
                                        closeNotification={() =>
                                            setNotificationState({ tl: false })
                                        }
                                        close
                                    />
                                </GridItem>
                                <GridItem xs={12} sm={12} md={4}>
                                    <Button
                                        fullWidth
                                        color="primary"
                                        onClick={() => showNotification('tc')}
                                    >
                                        Top Center
                                    </Button>
                                    <Snackbar
                                        place="tc"
                                        color="info"
                                        icon={AddAlert}
                                        message="Welcome to MATERIAL DASHBOARD React - a beautiful freebie for every web developer."
                                        open={notificationState.tc}
                                        closeNotification={() =>
                                            setNotificationState({ tc: false })
                                        }
                                        close
                                    />
                                </GridItem>
                                <GridItem xs={12} sm={12} md={4}>
                                    <Button
                                        fullWidth
                                        color="primary"
                                        onClick={() => showNotification('tr')}
                                    >
                                        Top Right
                                    </Button>
                                    <Snackbar
                                        place="tr"
                                        color="info"
                                        icon={AddAlert}
                                        message="Welcome to MATERIAL DASHBOARD React - a beautiful freebie for every web developer."
                                        open={notificationState.tr}
                                        closeNotification={() =>
                                            setNotificationState({ tr: false })
                                        }
                                        close
                                    />
                                </GridItem>
                            </Grid>
                        </GridItem>
                    </Grid>
                    <Grid container justify={'center'}>
                        <GridItem xs={12} sm={12} md={10} lg={8}>
                            <Grid container>
                                <GridItem xs={12} sm={12} md={4}>
                                    <Button
                                        fullWidth
                                        color="primary"
                                        onClick={() => showNotification('bl')}
                                    >
                                        Bottom Left
                                    </Button>
                                    <Snackbar
                                        place="bl"
                                        color="info"
                                        icon={AddAlert}
                                        message="Welcome to MATERIAL DASHBOARD React - a beautiful freebie for every web developer."
                                        open={notificationState.bl}
                                        closeNotification={() =>
                                            setNotificationState({ bl: false })
                                        }
                                        close
                                    />
                                </GridItem>
                                <GridItem xs={12} sm={12} md={4}>
                                    <Button
                                        fullWidth
                                        color="primary"
                                        onClick={() => showNotification('bc')}
                                    >
                                        Bottom Center
                                    </Button>
                                    <Snackbar
                                        place="bc"
                                        color="info"
                                        icon={AddAlert}
                                        message="Welcome to MATERIAL DASHBOARD React - a beautiful freebie for every web developer."
                                        open={notificationState.bc}
                                        closeNotification={() =>
                                            setNotificationState({ bc: false })
                                        }
                                        close
                                    />
                                </GridItem>
                                <GridItem xs={12} sm={12} md={4}>
                                    <Button
                                        fullWidth
                                        color="primary"
                                        onClick={() => showNotification('br')}
                                    >
                                        Bottom Right
                                    </Button>
                                    <Snackbar
                                        place="br"
                                        color="info"
                                        icon={AddAlert}
                                        message="Welcome to MATERIAL DASHBOARD React - a beautiful freebie for every web developer."
                                        open={notificationState.br}
                                        closeNotification={() =>
                                            setNotificationState({ br: false })
                                        }
                                        close
                                    />
                                </GridItem>
                            </Grid>
                        </GridItem>
                    </Grid>
                </div>
            }
        />
    );
};

export default Notifications;
