import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import moment from 'moment';

import { makeStyles } from '@material-ui/core/styles';
import { Grid, Checkbox } from '@material-ui/core';
import { CheckBox, CheckBoxOutlineBlank } from '@material-ui/icons';

import {
    Button,
    RegularCard,
    CustomInput,
    GridItem,
    UserCard,
    SnackbarContent,
} from '../../components';
import psono_server from '../../services/api-server';
import customInputStyle from '../../assets/jss/material-dashboard-react/customInputStyle';

const useStyles = makeStyles(customInputStyle);
const UserEdit = (props) => {
    const classes = useStyles();
    const { t } = useTranslation();
    const { user_id } = useParams();
    const [user, setUser] = useState(null);
    const [errors, setErrors] = useState([]);
    const [msgs, setMsgs] = useState([]);

    React.useEffect(() => {
        loadUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function loadUser() {
        psono_server
            .admin_user(
                props.state.user.token,
                props.state.user.session_secret_key,
                user_id
            )
            .then((response) => {
                const user = response.data;

                user.sessions.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.valid_till = moment(u.valid_till).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.active =
                        u.active && moment(u.valid_till) > moment()
                            ? t('YES')
                            : t('NO');
                    u.completely_activated = u.active ? t('YES') : t('NO');
                });

                user.duos.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.active = u.active ? t('YES') : t('NO');
                });

                user.yubikey_otps.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.active = u.active ? t('YES') : t('NO');
                });

                user.webauthns.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.active = u.active ? t('YES') : t('NO');
                });

                user.google_authenticators.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.active = u.active ? t('YES') : t('NO');
                });

                user.memberships.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.accepted = u.accepted ? t('YES') : t('NO');

                    u.admin_raw = u.admin;
                    u.admin = (
                        <Checkbox
                            checked={u.admin_raw}
                            tabIndex={-1}
                            onClick={() => {
                                handleToggleGroupAdmin(u);
                            }}
                            checkedIcon={
                                <CheckBox className={classes.checkedIcon} />
                            }
                            icon={
                                <CheckBoxOutlineBlank
                                    className={classes.uncheckedIcon}
                                />
                            }
                            classes={{
                                checked: classes.checked,
                            }}
                        />
                    );

                    u.share_admin_raw = u.share_admin;
                    u.share_admin = (
                        <Checkbox
                            checked={u.share_admin_raw}
                            tabIndex={-1}
                            onClick={() => {
                                handleToggleShareAdmin(u);
                            }}
                            checkedIcon={
                                <CheckBox className={classes.checkedIcon} />
                            }
                            icon={
                                <CheckBoxOutlineBlank
                                    className={classes.uncheckedIcon}
                                />
                            }
                            classes={{
                                checked: classes.checked,
                            }}
                        />
                    );
                });

                user.recovery_codes.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                });

                user.emergency_codes.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                });

                user.share_rights.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                });

                user.link_shares.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.valid_till = u.valid_till
                        ? moment(u.valid_till).format('YYYY-MM-DD HH:mm:ss')
                        : '';
                    u.has_passphrase = u.has_passphrase ? t('YES') : t('NO');
                });
                setUser(user);
            });
    }

    const handleToggle = (membershipId, groupAdmin, shareAdmin) => {
        psono_server
            .admin_update_membership(
                props.state.user.token,
                props.state.user.session_secret_key,
                membershipId,
                groupAdmin,
                shareAdmin
            )
            .then((values) => {
                loadUser();
            });
    };
    const handleToggleGroupAdmin = (membership) => {
        return handleToggle(
            membership.id,
            !membership.admin_raw,
            membership.share_admin_raw
        );
    };
    const handleToggleShareAdmin = (membership) => {
        return handleToggle(
            membership.id,
            membership.admin_raw,
            !membership.share_admin_raw
        );
    };

    const onDeleteSessions = (selected_sessions) => {
        const promises = [];
        selected_sessions.forEach((session) => {
            promises.push(
                psono_server.admin_delete_session(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    session.id
                )
            );
        });

        Promise.all(promises).then((values) => {
            loadUser();
        });
    };

    const onDeleteMemberships = (selected_memberships) => {
        const promises = [];
        selected_memberships.forEach((membership) => {
            promises.push(
                psono_server.admin_delete_membership(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    membership.id
                )
            );
        });

        Promise.all(promises).then((values) => {
            loadUser();
        });
    };

    const onDeleteDuos = (selected_duos) => {
        const promises = [];
        selected_duos.forEach((duo) => {
            promises.push(
                psono_server.admin_delete_duo(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    duo.id
                )
            );
        });

        Promise.all(promises).then((values) => {
            loadUser();
        });
    };

    const onDeleteYubikeyOtps = (selected_yubikey_otps) => {
        const promises = [];
        selected_yubikey_otps.forEach((yubikey_otp) => {
            promises.push(
                psono_server.admin_delete_yubikey_otp(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    yubikey_otp.id
                )
            );
        });

        Promise.all(promises).then((values) => {
            loadUser();
        });
    };

    const onDeleteWebAuthns = (selected_webauthns) => {
        const promises = [];
        selected_webauthns.forEach((webauthn) => {
            promises.push(
                psono_server.admin_delete_webauthn(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    webauthn.id
                )
            );
        });

        Promise.all(promises).then((values) => {
            loadUser();
        });
    };

    const onDeleteGoogleAuthenticators = (selected_google_authenticators) => {
        const promises = [];
        selected_google_authenticators.forEach((google_authenticator) => {
            promises.push(
                psono_server.admin_delete_google_authenticator(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    google_authenticator.id
                )
            );
        });

        Promise.all(promises).then((values) => {
            loadUser();
        });
    };

    const onDeleteRecoveryCodes = (selected_recovery_codes) => {
        const promises = [];
        selected_recovery_codes.forEach((recovery_code) => {
            promises.push(
                psono_server.admin_delete_recovery_code(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    recovery_code.id
                )
            );
        });

        Promise.all(promises).then((values) => {
            loadUser();
        });
    };

    const onDeleteEmergencyCodes = (selected_emergency_codes) => {
        const promises = [];
        selected_emergency_codes.forEach((emergency_code) => {
            promises.push(
                psono_server.admin_delete_emergency_code(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    emergency_code.id
                )
            );
        });

        Promise.all(promises).then((values) => {
            loadUser();
        });
    };

    const onDeleteLinkShares = (selected_link_shares) => {
        const promises = [];
        selected_link_shares.forEach((link_share) => {
            promises.push(
                psono_server.admin_delete_link_share(
                    props.state.user.token,
                    props.state.user.session_secret_key,
                    link_share.id
                )
            );
        });

        Promise.all(promises).then((values) => {
            loadUser();
        });
    };

    const onChangeEmailChange = (event) => {
        setUser({
            ...user,
            email: event.target.value,
        });
    };

    const onIsActiveToggle = (event) => {
        setUser({
            ...user,
            is_active: !user.is_active,
        });
    };

    const onIsEmailActiveToggle = (event) => {
        setUser({
            ...user,
            is_email_active: !user.is_email_active,
        });
    };

    const onIsSuperuserToggle = (event) => {
        setUser({
            ...user,
            is_superuser: !user.is_superuser,
        });
    };

    const save = () => {
        setErrors([]);
        setMsgs([]);
        psono_server
            .admin_update_user(
                props.state.user.token,
                props.state.user.session_secret_key,
                user.id,
                user.email,
                user.is_active,
                user.is_email_active,
                user.is_superuser
            )
            .then(
                (result) => {
                    setMsgs(['SAVE_SUCCESS']);
                },
                (result) => {
                    if (result.data.hasOwnProperty('email')) {
                        setErrors(result.data.email);
                    } else if (result.data.hasOwnProperty('errors')) {
                        setErrors(result.data.errors);
                    } else {
                        setErrors([result.data]);
                    }
                }
            );
    };

    if (!user) {
        return null;
    }

    let authentication;
    if (user.authentication === 'AUTHKEY') {
        authentication = 'Normal';
    } else if (user.authentication === 'LDAP') {
        authentication = 'LDAP';
    } else if (user.authentication === 'SAML') {
        authentication = 'SAML';
    } else if (user.authentication === 'OIDC') {
        authentication = 'OIDC';
    } else {
        authentication = 'UNKNOWN';
    }

    return (
        <div>
            <Grid container>
                <GridItem xs={12} sm={12} md={12}>
                    <RegularCard
                        cardTitle={t('EDIT_USER')}
                        cardSubtitle={t('UPDATE_USER_DETAILS')}
                        content={
                            <div>
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={7}>
                                        <CustomInput
                                            labelText={t('USERNAME')}
                                            id="username"
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: user.username,
                                                disabled: true,
                                                readOnly: true,
                                            }}
                                        />
                                    </GridItem>
                                    <GridItem xs={12} sm={12} md={5}>
                                        <CustomInput
                                            labelText={t('AUTHENTICATION')}
                                            id="authentication"
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: authentication,
                                                disabled: true,
                                                readOnly: true,
                                            }}
                                        />
                                    </GridItem>
                                </Grid>
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={12}>
                                        <CustomInput
                                            labelText={t('PUBLIC_KEY')}
                                            id="public_key"
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: user.public_key,
                                                disabled: true,
                                                readOnly: true,
                                            }}
                                        />
                                    </GridItem>
                                </Grid>
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={4}>
                                        <CustomInput
                                            labelText={t('REGISTRATION_DATE')}
                                            id="create_date"
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: moment(
                                                    user.create_date
                                                ).format('YYYY-MM-DD HH:mm:ss'),
                                                disabled: true,
                                                readOnly: true,
                                            }}
                                        />
                                    </GridItem>
                                    <GridItem xs={12} sm={12} md={8}>
                                        <CustomInput
                                            labelText={t('EMAIL')}
                                            id="email"
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: user.email,
                                                onChange: onChangeEmailChange,
                                            }}
                                        />
                                    </GridItem>
                                </Grid>
                                <Grid container>
                                    <GridItem xs={12} sm={6} md={4}>
                                        <div className={classes.checkbox}>
                                            <Checkbox
                                                tabIndex={1}
                                                checked={user.is_active}
                                                onClick={onIsActiveToggle}
                                            />{' '}
                                            {t('ACTIVE')}
                                        </div>
                                    </GridItem>
                                    <GridItem xs={12} sm={6} md={4}>
                                        <div className={classes.checkbox}>
                                            <Checkbox
                                                tabIndex={1}
                                                checked={user.is_email_active}
                                                onClick={onIsEmailActiveToggle}
                                            />{' '}
                                            {t('EMAIL_VERIFIED')}
                                        </div>
                                    </GridItem>
                                    <GridItem xs={12} sm={6} md={4}>
                                        <div className={classes.checkbox}>
                                            <Checkbox
                                                tabIndex={1}
                                                checked={user.is_superuser}
                                                onClick={onIsSuperuserToggle}
                                            />{' '}
                                            {t('SUPERUSER')}
                                        </div>
                                    </GridItem>
                                    <GridItem
                                        xs={8}
                                        sm={8}
                                        md={8}
                                        style={{ marginTop: '20px' }}
                                    >
                                        {errors.map((prop, index) => {
                                            return (
                                                <SnackbarContent
                                                    message={t(prop)}
                                                    color="danger"
                                                    key={index}
                                                />
                                            );
                                        })}
                                    </GridItem>
                                    <GridItem
                                        xs={8}
                                        sm={8}
                                        md={8}
                                        style={{ marginTop: '20px' }}
                                    >
                                        {msgs.map((prop, index) => {
                                            return (
                                                <SnackbarContent
                                                    message={t(prop)}
                                                    color="info"
                                                    key={index}
                                                />
                                            );
                                        })}
                                    </GridItem>
                                </Grid>
                            </div>
                        }
                        footer={
                            <Button color="primary" onClick={save}>
                                {t('SAVE')}
                            </Button>
                        }
                    />
                </GridItem>
            </Grid>
            <Grid container>
                <GridItem xs={12} sm={12} md={12}>
                    <UserCard
                        sessions={user.sessions}
                        memberships={user.memberships}
                        duos={user.duos}
                        google_authenticators={user.google_authenticators}
                        yubikey_otps={user.yubikey_otps}
                        webauthns={user.webauthns}
                        recovery_codes={user.recovery_codes}
                        emergency_codes={user.emergency_codes}
                        link_shares={user.link_shares}
                        onDeleteSessions={onDeleteSessions}
                        onDeleteMemberships={onDeleteMemberships}
                        onDeleteDuos={onDeleteDuos}
                        onDeleteYubikeyOtps={onDeleteYubikeyOtps}
                        onDeleteWebAuthns={onDeleteWebAuthns}
                        onDeleteGoogleAuthenticators={
                            onDeleteGoogleAuthenticators
                        }
                        onDeleteRecoveryCodes={onDeleteRecoveryCodes}
                        onDeleteEmergencyCodes={onDeleteEmergencyCodes}
                        onDeleteLinkShares={onDeleteLinkShares}
                    />
                </GridItem>
            </Grid>
        </div>
    );
};

export default UserEdit;
