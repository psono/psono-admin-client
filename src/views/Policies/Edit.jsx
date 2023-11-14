import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import moment from 'moment';

import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Checkbox } from '@material-ui/core';

import {
    Button,
    RegularCard,
    CustomInput,
    GridItem,
    SnackbarContent,
    CustomMaterialTable,
} from '../../components';
import psono_server from '../../services/api-server';
import store from '../../services/store';
import Person from '@material-ui/icons/Person';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import Group from '@material-ui/icons/Group';
import CustomTabs from '../../components/CustomTabs/CustomTabs';
import { CheckBox, CheckBoxOutlineBlank } from '@material-ui/icons';

const useStyles = makeStyles({
    formControl: {
        minWidth: 120,
        maxWidth: 200,
    },
    gridItem: {
        marginBottom: '16px',
    },
    input: {
        margin: '0',
    },
});

const PolicyEdit = (props) => {
    const { t } = useTranslation();
    const classes = useStyles();
    const groupTableRef = useRef(null);
    const userTableRef = useRef(null);
    const { policy_id } = useParams();
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState(0);
    const [config, setConfig] = useState({});
    const [defaultValues, setDefaultValues] = useState({});
    const [mappedGroupIndex, setMappedGroupIndex] = useState({});
    const [mappedUserIndex, setMappedUserIndex] = useState({});
    const [errors, setErrors] = useState([]);
    const [msgs, setMsgs] = useState([]);

    React.useEffect(() => {
        loadPolicy();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addMappingGroup = (group) => {
        psono_server
            .admin_policy_create_group_map(
                props.state.user.token,
                props.state.user.session_secret_key,
                policy_id,
                group.id
            )
            .then((response) => {
                mappedGroupIndex[group.id] = true;
                setMappedGroupIndex({ ...mappedGroupIndex });
                groupTableRef.current && groupTableRef.current.onQueryChange();
            });
    };

    const removeMappingGroup = (group) => {
        psono_server
            .admin_policy_delete_group_map(
                props.state.user.token,
                props.state.user.session_secret_key,
                policy_id,
                group.id
            )
            .then((response) => {
                delete mappedGroupIndex[group.id];
                setMappedGroupIndex({ ...mappedGroupIndex });
                groupTableRef.current && groupTableRef.current.onQueryChange();
            });
    };

    const handleToggleGroup = (group) => {
        const isMapped = mappedGroupIndex.hasOwnProperty(group.id);

        if (isMapped) {
            removeMappingGroup(group);
        } else {
            addMappingGroup(group);
        }
    };

    const addMappingUser = (users) => {
        psono_server
            .admin_policy_create_user_map(
                props.state.user.token,
                props.state.user.session_secret_key,
                policy_id,
                users.id
            )
            .then((response) => {
                mappedUserIndex[users.id] = true;
                setMappedUserIndex({ ...mappedUserIndex });
                userTableRef.current && userTableRef.current.onQueryChange();
            });
    };

    const removeMappingUser = (user) => {
        psono_server
            .admin_policy_delete_user_map(
                props.state.user.token,
                props.state.user.session_secret_key,
                policy_id,
                user.id
            )
            .then((response) => {
                delete mappedUserIndex[user.id];
                setMappedUserIndex({ ...mappedUserIndex });
                userTableRef.current && userTableRef.current.onQueryChange();
            });
    };

    const handleToggleUser = (user) => {
        const isMapped = mappedUserIndex.hasOwnProperty(user.id);

        if (isMapped) {
            removeMappingUser(user);
        } else {
            addMappingUser(user);
        }
    };

    function loadPolicy() {
        psono_server
            .admin_policy(
                props.state.user.token,
                props.state.user.session_secret_key,
                policy_id
            )
            .then((response) => {
                const policy = response.data;

                policy.policy_group_mappings.forEach((g) => {
                    g.create_date = moment(g.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                });

                policy.policy_user_mappings.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                });

                setTitle(policy.title);
                setPriority(policy.priority);
                setConfig(policy.config);
                setDefaultValues(policy.default_values);

                const newMappedGroupIndex = {};
                policy.policy_group_mappings.forEach((g) => {
                    console.log(g);
                    newMappedGroupIndex[g.id] = true;
                });
                setMappedGroupIndex(newMappedGroupIndex);
                groupTableRef.current && groupTableRef.current.onQueryChange();

                const newMappedUserIndex = {};
                policy.policy_user_mappings.forEach((u) => {
                    newMappedUserIndex[u.id] = true;
                });
                setMappedUserIndex(newMappedUserIndex);
                userTableRef.current && userTableRef.current.onQueryChange();
            });
    }

    function loadGroups(query) {
        const params = {
            page_size: query.pageSize,
            search: query.search,
            page: query.page,
        };
        if (query.orderBy) {
            if (query.orderDirection === 'asc') {
                params['ordering'] = query.orderBy.field;
            } else {
                params['ordering'] = '-' + query.orderBy.field;
            }
        }

        return psono_server
            .admin_group(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                undefined,
                params
            )
            .then((response) => {
                const { groups } = response.data;
                groups.forEach((g) => {
                    g.create_date = moment(g.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    g.is_managed = g.is_managed ? t('YES') : t('NO');

                    g.mapped_raw = mappedGroupIndex.hasOwnProperty(g.id);
                    g.mapped = (
                        <Checkbox
                            checked={g.mapped_raw}
                            tabIndex={-1}
                            onClick={() => {
                                handleToggleGroup(g);
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

                return {
                    data: groups,
                    page: query.page,
                    pageSize: query.pageSize,
                    totalCount: response.data.count,
                };
            });
    }

    function loadUsers(query) {
        const params = {
            page_size: query.pageSize,
            search: query.search,
            page: query.page,
        };
        if (query.orderBy) {
            if (query.orderDirection === 'asc') {
                params['ordering'] = query.orderBy.field;
            } else {
                params['ordering'] = '-' + query.orderBy.field;
            }
        }

        return psono_server
            .admin_user(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                undefined,
                params
            )
            .then((response) => {
                const { users } = response.data;
                users.forEach((u) => {
                    u.create_date = moment(u.create_date).format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    u.is_managed = u.is_managed ? t('YES') : t('NO');

                    u.mapped_raw = mappedUserIndex.hasOwnProperty(u.id);
                    u.mapped = (
                        <Checkbox
                            checked={u.mapped_raw}
                            tabIndex={-1}
                            onClick={() => {
                                handleToggleUser(u);
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

                return {
                    data: users,
                    page: query.page,
                    pageSize: query.pageSize,
                    totalCount: response.data.count,
                };
            });
    }

    const save = () => {
        setErrors([]);
        setMsgs([]);
        psono_server
            .admin_update_policy(
                store.getState().user.token,
                store.getState().user.session_secret_key,
                policy_id,
                title,
                config,
                priority
            )
            .then(
                (result) => {
                    setMsgs(['SAVE_SUCCESS']);
                },
                (result) => {
                    if (result.data.hasOwnProperty('title')) {
                        setErrors(result.data.title);
                    } else if (result.data.hasOwnProperty('priority')) {
                        setErrors(result.data.priority);
                    } else {
                        setErrors([result.data]);
                    }
                }
            );
    };

    const settings = [
        {
            key: 'COMPLIANCE_DISABLE_API_KEYS',
            type: 'boolean',
        },
        {
            key: 'COMPLIANCE_DISABLE_DELETE_ACCOUNT',
            type: 'boolean',
        },
        {
            key: 'COMPLIANCE_DISABLE_EMERGENCY_CODES',
            type: 'boolean',
        },
        {
            key: 'COMPLIANCE_DISABLE_EXPORT',
            type: 'boolean',
        },
        {
            key: 'COMPLIANCE_DISABLE_EXPORT_OF_SHARED_ITEMS',
            type: 'boolean',
        },
        {
            key: 'COMPLIANCE_DISABLE_FILE_REPOSITORIES',
            type: 'boolean',
        },
        {
            key: 'COMPLIANCE_DISABLE_LINK_SHARES',
            type: 'boolean',
        },
        {
            key: 'COMPLIANCE_DISABLE_OFFLINE_MODE',
            type: 'boolean',
        },
        {
            key: 'COMPLIANCE_DISABLE_SHARES',
            type: 'boolean',
        },
        {
            key: 'COMPLIANCE_DISABLE_RECOVERY_CODES',
            type: 'boolean',
        },
        {
            key: 'COMPLIANCE_DISABLE_UNMANAGED_GROUPS',
            type: 'boolean',
        },
        {
            key: 'COMPLIANCE_ENFORCE_2FA',
            type: 'boolean',
        },
        {
            key: 'COMPLIANCE_ENFORCE_CENTRAL_SECURITY_REPORTS',
            type: 'boolean',
        },
        {
            key: 'DISABLE_CENTRAL_SECURITY_REPORTS',
            type: 'boolean',
        },
        {
            key: 'DISABLE_CALLBACKS',
            type: 'boolean',
        },
        {
            key: 'ALLOW_USER_SEARCH_BY_EMAIL',
            type: 'boolean',
        },
        {
            key: 'ALLOW_USER_SEARCH_BY_USERNAME_PARTIAL',
            type: 'boolean',
        },
        {
            key: 'COMPLIANCE_CENTRAL_SECURITY_REPORT_SECURITY_RECURRENCE_INTERVAL',
            type: 'int',
        },
        {
            key: 'COMPLIANCE_MAX_OFFLINE_CACHE_TIME_VALID',
            type: 'int',
        },
        {
            key: 'COMPLIANCE_PASSWORD_GENERATOR_DEFAULT_PASSWORD_LENGTH',
            type: 'int',
        },
        {
            key: 'COMPLIANCE_PASSWORD_GENERATOR_DEFAULT_LETTERS_UPPERCASE',
            type: 'str',
        },
        {
            key: 'COMPLIANCE_PASSWORD_GENERATOR_DEFAULT_LETTERS_LOWERCASE',
            type: 'str',
        },
        {
            key: 'COMPLIANCE_PASSWORD_GENERATOR_DEFAULT_NUMBERS',
            type: 'str',
        },
        {
            key: 'COMPLIANCE_PASSWORD_GENERATOR_DEFAULT_SPECIAL_CHARS',
            type: 'str',
        },
        {
            key: 'ALLOWED_FILE_REPOSITORY_TYPES',
            type: 'multiselect',
            values: [
                'azure_blob',
                'gcp_cloud_storage',
                'aws_s3',
                'do_spaces',
                'backblaze',
                'other_s3',
            ],
        },
        {
            key: 'ALLOWED_SECOND_FACTORS',
            type: 'multiselect',
            values: ['yubikey_otp', 'webauthn', 'google_authenticator', 'duo'],
        },
    ];

    return (
        <div>
            <Grid container>
                <GridItem xs={12} sm={12} md={12}>
                    <RegularCard
                        cardTitle={t('EDIT_POLICY')}
                        cardSubtitle={t('UPDATE_POLICY_DETAILS')}
                        content={
                            <div>
                                <Grid container>
                                    <GridItem xs={12} sm={12} md={8}>
                                        <CustomInput
                                            labelText={t('TITLE')}
                                            id="title"
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: title,
                                                onChange: (event) =>
                                                    setTitle(
                                                        event.target.value
                                                    ),
                                            }}
                                        />
                                    </GridItem>
                                    <GridItem xs={12} sm={12} md={4}>
                                        <CustomInput
                                            labelText={t('PRIORITY')}
                                            id="priority"
                                            formControlProps={{
                                                fullWidth: true,
                                            }}
                                            inputProps={{
                                                value: priority,
                                                onChange: (event) =>
                                                    setPriority(
                                                        event.target.value
                                                    ),
                                            }}
                                        />
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
                    <CustomTabs
                        title={t('POLICY_DETAILS')}
                        headerColor="warning"
                        tabs={[
                            {
                                tabName: t('SETTINGS'),
                                tabIcon: SettingsApplicationsIcon,
                                tabContent: (
                                    <Grid container>
                                        <Grid
                                            item
                                            xs={2}
                                            sm={2}
                                            md={2}
                                            className={classes.gridItem}
                                        >
                                            {t('OVERWRITE')}
                                        </Grid>
                                        <Grid
                                            item
                                            xs={6}
                                            sm={6}
                                            md={6}
                                            className={classes.gridItem}
                                        >
                                            {t('CONFIGURATION')}
                                        </Grid>
                                        <Grid
                                            item
                                            xs={4}
                                            sm={4}
                                            md={4}
                                            className={classes.gridItem}
                                        >
                                            {t('VALUE')}
                                        </Grid>

                                        {settings.map((setting, i) => (
                                            <React.Fragment
                                                key={setting['key']}
                                            >
                                                <Grid
                                                    item
                                                    xs={2}
                                                    sm={2}
                                                    md={2}
                                                    className={classes.gridItem}
                                                >
                                                    <Checkbox
                                                        tabIndex={1}
                                                        checked={config.hasOwnProperty(
                                                            setting['key']
                                                        )}
                                                        onClick={(event) => {
                                                            const newConfig = {
                                                                ...config,
                                                            };
                                                            if (
                                                                config.hasOwnProperty(
                                                                    setting[
                                                                        'key'
                                                                    ]
                                                                )
                                                            ) {
                                                                delete newConfig[
                                                                    setting[
                                                                        'key'
                                                                    ]
                                                                ];
                                                                setConfig(
                                                                    newConfig
                                                                );
                                                            } else {
                                                                newConfig[
                                                                    setting[
                                                                        'key'
                                                                    ]
                                                                ] = defaultValues.hasOwnProperty(
                                                                    setting[
                                                                        'key'
                                                                    ]
                                                                )
                                                                    ? defaultValues[
                                                                          setting[
                                                                              'key'
                                                                          ]
                                                                      ]
                                                                    : '';
                                                                setConfig(
                                                                    newConfig
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={6}
                                                    sm={6}
                                                    md={6}
                                                    className={classes.gridItem}
                                                >
                                                    {t(
                                                        'POLICY_' +
                                                            setting['key']
                                                    )}
                                                    <br />
                                                    <small>
                                                        {setting['key']}
                                                    </small>
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={4}
                                                    sm={4}
                                                    md={4}
                                                    className={classes.gridItem}
                                                >
                                                    {setting['type'] ===
                                                        'int' && (
                                                        <CustomInput
                                                            id={setting['key']}
                                                            key={setting['key']}
                                                            formControlProps={{
                                                                className:
                                                                    classes.input,
                                                            }}
                                                            inputProps={{
                                                                type: 'number',
                                                                className:
                                                                    classes.input,
                                                                disabled:
                                                                    !config.hasOwnProperty(
                                                                        setting[
                                                                            'key'
                                                                        ]
                                                                    ),
                                                                value: config.hasOwnProperty(
                                                                    setting[
                                                                        'key'
                                                                    ]
                                                                )
                                                                    ? config[
                                                                          setting[
                                                                              'key'
                                                                          ]
                                                                      ]
                                                                    : defaultValues.hasOwnProperty(
                                                                          setting[
                                                                              'key'
                                                                          ]
                                                                      )
                                                                    ? defaultValues[
                                                                          setting[
                                                                              'key'
                                                                          ]
                                                                      ]
                                                                    : '',
                                                                onChange: (
                                                                    event
                                                                ) => {
                                                                    const newConfig =
                                                                        {
                                                                            ...config,
                                                                        };
                                                                    newConfig[
                                                                        setting[
                                                                            'key'
                                                                        ]
                                                                    ] =
                                                                        event.target.value;
                                                                    setConfig(
                                                                        newConfig
                                                                    );
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                    {setting['type'] ===
                                                        'str' && (
                                                        <CustomInput
                                                            id={setting['key']}
                                                            key={setting['key']}
                                                            formControlProps={{
                                                                className:
                                                                    classes.input,
                                                            }}
                                                            inputProps={{
                                                                className:
                                                                    classes.input,
                                                                disabled:
                                                                    !config.hasOwnProperty(
                                                                        setting[
                                                                            'key'
                                                                        ]
                                                                    ),
                                                                value: config.hasOwnProperty(
                                                                    setting[
                                                                        'key'
                                                                    ]
                                                                )
                                                                    ? config[
                                                                          setting[
                                                                              'key'
                                                                          ]
                                                                      ]
                                                                    : defaultValues.hasOwnProperty(
                                                                          setting[
                                                                              'key'
                                                                          ]
                                                                      )
                                                                    ? defaultValues[
                                                                          setting[
                                                                              'key'
                                                                          ]
                                                                      ]
                                                                    : '',
                                                                onChange: (
                                                                    event
                                                                ) => {
                                                                    const newConfig =
                                                                        {
                                                                            ...config,
                                                                        };
                                                                    newConfig[
                                                                        setting[
                                                                            'key'
                                                                        ]
                                                                    ] =
                                                                        event.target.value;
                                                                    setConfig(
                                                                        newConfig
                                                                    );
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                    {setting['type'] ===
                                                        'multiselect' && (
                                                        <FormControl
                                                            className={
                                                                classes.formControl
                                                            }
                                                        >
                                                            <Select
                                                                labelId="demo-mutiple-name-label"
                                                                id={
                                                                    setting[
                                                                        'key'
                                                                    ]
                                                                }
                                                                key={
                                                                    setting[
                                                                        'key'
                                                                    ]
                                                                }
                                                                multiple
                                                                value={
                                                                    config.hasOwnProperty(
                                                                        setting[
                                                                            'key'
                                                                        ]
                                                                    )
                                                                        ? config[
                                                                              setting[
                                                                                  'key'
                                                                              ]
                                                                          ]
                                                                        : defaultValues.hasOwnProperty(
                                                                              setting[
                                                                                  'key'
                                                                              ]
                                                                          )
                                                                        ? defaultValues[
                                                                              setting[
                                                                                  'key'
                                                                              ]
                                                                          ]
                                                                        : []
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) => {
                                                                    const newConfig =
                                                                        {
                                                                            ...config,
                                                                        };
                                                                    newConfig[
                                                                        setting[
                                                                            'key'
                                                                        ]
                                                                    ] =
                                                                        event.target.value;
                                                                    setConfig(
                                                                        newConfig
                                                                    );
                                                                }}
                                                                input={
                                                                    <Input />
                                                                }
                                                                MenuProps={{
                                                                    PaperProps:
                                                                        {
                                                                            style: {
                                                                                maxHeight:
                                                                                    48 *
                                                                                        4.5 +
                                                                                    8,
                                                                                width: 250,
                                                                            },
                                                                        },
                                                                }}
                                                            >
                                                                {setting[
                                                                    'values'
                                                                ].map(
                                                                    (name) => (
                                                                        <MenuItem
                                                                            key={
                                                                                name
                                                                            }
                                                                            value={
                                                                                name
                                                                            }
                                                                        >
                                                                            {
                                                                                name
                                                                            }
                                                                        </MenuItem>
                                                                    )
                                                                )}
                                                            </Select>
                                                        </FormControl>
                                                    )}
                                                    {setting['type'] ===
                                                        'boolean' && (
                                                        <Checkbox
                                                            id={setting['key']}
                                                            key={setting['key']}
                                                            tabIndex={1}
                                                            checked={
                                                                config.hasOwnProperty(
                                                                    setting[
                                                                        'key'
                                                                    ]
                                                                )
                                                                    ? config[
                                                                          setting[
                                                                              'key'
                                                                          ]
                                                                      ]
                                                                    : defaultValues.hasOwnProperty(
                                                                          setting[
                                                                              'key'
                                                                          ]
                                                                      )
                                                                    ? defaultValues[
                                                                          setting[
                                                                              'key'
                                                                          ]
                                                                      ]
                                                                    : false
                                                            }
                                                            disabled={
                                                                !config.hasOwnProperty(
                                                                    setting[
                                                                        'key'
                                                                    ]
                                                                )
                                                            }
                                                            onClick={(
                                                                event
                                                            ) => {
                                                                const newConfig =
                                                                    {
                                                                        ...config,
                                                                    };
                                                                newConfig[
                                                                    setting[
                                                                        'key'
                                                                    ]
                                                                ] =
                                                                    !config[
                                                                        setting[
                                                                            'key'
                                                                        ]
                                                                    ];
                                                                setConfig(
                                                                    newConfig
                                                                );
                                                            }}
                                                        />
                                                    )}
                                                </Grid>
                                            </React.Fragment>
                                        ))}
                                    </Grid>
                                ),
                            },
                            {
                                tabName: t('USERS'),
                                tabIcon: Person,
                                tabContent: (
                                    <CustomMaterialTable
                                        tableRef={userTableRef}
                                        columns={[
                                            {
                                                field: 'mapped',
                                                title: t('MAPPED'),
                                                customSort: (a, b) => {
                                                    return (
                                                        a.mapped_raw -
                                                        b.mapped_raw
                                                    );
                                                },
                                            },
                                            {
                                                field: 'username',
                                                title: t('NAME'),
                                            },
                                        ]}
                                        data={loadUsers}
                                        title={''}
                                    />
                                ),
                            },
                            {
                                tabName: t('GROUPS'),
                                tabIcon: Group,
                                tabContent: (
                                    <CustomMaterialTable
                                        tableRef={groupTableRef}
                                        columns={[
                                            {
                                                field: 'mapped',
                                                title: t('MAPPED'),
                                                customSort: (a, b) => {
                                                    return (
                                                        a.mapped_raw -
                                                        b.mapped_raw
                                                    );
                                                },
                                            },
                                            { field: 'name', title: t('NAME') },
                                            {
                                                field: 'member_count',
                                                title: t('MEMBERS'),
                                            },
                                            {
                                                field: 'is_managed',
                                                title: t('MANAGED'),
                                                sorting: false,
                                            },
                                        ]}
                                        data={loadGroups}
                                        title={''}
                                    />
                                ),
                            },
                        ]}
                    />
                </GridItem>
            </Grid>
        </div>
    );
};

export default PolicyEdit;
