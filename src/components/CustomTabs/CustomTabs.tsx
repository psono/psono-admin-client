import type { ApiRecord } from '../../types/api';
import React from 'react';
// nodejs library that concatenates classes
import classNames from 'classnames';
// nodejs library to set properties for components

// material-ui components
import { makeStyles } from '@mui/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
// core components
import Card from '../../components/Card/Card';
import CardBody from '../../components/Card/CardBody';
import CardHeader from '../../components/Card/CardHeader';

import styles from '../../assets/jss/material-dashboard-react/components/customTabsStyle';

export interface CustomTabsProps {
    headerColor?: string;
    plainTabs?: boolean;
    tabs?: any;
    title?: React.ReactNode;
    rtlActive?: boolean;
}
const useStyles = makeStyles(styles);

export default function CustomTabs(props: CustomTabsProps) {
    const [value, setValue] = React.useState(0);
    const handleChange = (event: any, value: any) => {
        setValue(value);
    };
    const classes: Record<string, string> = useStyles();
    const { headerColor, plainTabs, tabs, title, rtlActive } = props;
    const cardTitle = classNames({
        [classes.cardTitle]: true,
        [classes.cardTitleRTL]: rtlActive,
    });
    return (
        <Card plain={plainTabs}>
            <CardHeader color={headerColor} plain={plainTabs}>
                {title !== undefined ? (
                    <div className={cardTitle}>{title}</div>
                ) : null}
                <Tabs
                    value={value}
                    onChange={handleChange}
                    classes={{
                        root: classes.tabsRoot,
                        indicator: classes.displayNone,
                        scrollButtons: classes.displayNone,
                    }}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {tabs.map((prop: any, key: any) => {
                        var icon: ApiRecord = {};
                        if (prop.tabIcon) {
                            icon = {
                                icon: <prop.tabIcon />,
                            };
                        }
                        return (
                            <Tab
                                classes={{
                                    root: classes.tabRootButton,
                                    selected: classes.tabSelected,
                                }}
                                key={key}
                                label={prop.tabName}
                                iconPosition="start"
                                {...icon}
                            />
                        );
                    })}
                </Tabs>
            </CardHeader>
            <CardBody>
                {tabs.map((prop: any, key: any) => {
                    if (key === value) {
                        return <div key={key}>{prop.tabContent}</div>;
                    }
                    return null;
                })}
            </CardBody>
        </Card>
    );
}
