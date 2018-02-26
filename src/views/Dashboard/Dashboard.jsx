import React from 'react';
import {
    withStyles, Grid
} from 'material-ui';
import {
    Update, ArrowUpward, AccessTime, Accessibility
} from 'material-ui-icons';
import PropTypes from 'prop-types';
// react plugin for creating charts
import ChartistGraph from 'react-chartist';

import {
    StatsCard, VersionCard, LicenseCard, ChartCard, ReleaseCard, RegularCard, Table, ItemGrid
} from '../../components';

import {
    dailySalesChart ,
    emailsSubscriptionChart,
    completedTasksChart
} from '../../variables/charts';

import { dashboardStyle } from '../../variables/styles';
import gitlab from '../../services/api-gitlab'
import psono_server from '../../services/api-server'

class Dashboard extends React.Component{
    state = {
        value: 0,
        client_tags: [],
        client_latest_version: '',
        client_used_version: 'v1.2.0',
        server_tags: [],
        server_latest_version: '',
        server_used_version: 'v1.2.0',
        server_license_current_users: '',
        server_license_max_users: '',
        server_license_valid_from: '',
        server_license_valid_till: '',
        server_license_ratio: '',
        server_license_stat_link: '',
        server_license_stat_text: '',
    };
    handleChange = (event, value) => {
        this.setState({ value });
    };

    handleChangeIndex = index => {
        this.setState({ value: index });
    };


    componentDidMount(){

        gitlab.psono_server.get_tags().then(
            (response) => {
                this.setState({ server_tags: response.data });
                this.setState({ server_latest_version: response.data[0].name });
            }
        );
        gitlab.psono_client.get_tags().then(
            (response) => {
                this.setState({ client_tags: response.data });
                this.setState({ client_latest_version: response.data[0].name });
            }
        );

        psono_server.info().then(
            (response) => {
                const info = JSON.parse(response.data.info);
                this.setState({
                    server_license_max_users: info.license_max_users,
                    server_license_valid_from: info.license_valid_from,
                    server_license_valid_till: info.license_valid_till,
                    server_used_version: "v" + info.version.split(" ")[0]
                });
            }
        )
    }

    render(){
        return (
            <div>
                <Grid container>
                    <ItemGrid xs={12} sm={6} md={3}>
                        <LicenseCard
                            current_users={this.state.server_license_current_users}
                            max_users={this.state.server_license_max_users}
                            valid_from={this.state.server_license_valid_from}
                            valid_till={this.state.server_license_valid_till}
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={6} md={3}>
                        <StatsCard
                            icon={Accessibility}
                            iconColor="green"
                            title="Active users / devices"
                            description="24/37"
                            statIcon={Update}
                            statText="The amount of active users"
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={6} md={3}>
                        <VersionCard
                            used_version={this.state.client_used_version}
                            latest_version={this.state.client_latest_version}
                            title="Client Version"
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={6} md={3}>
                        <VersionCard
                            used_version={this.state.server_used_version}
                            latest_version={this.state.server_latest_version}
                            title="Server Version"
                        />
                    </ItemGrid>
                </Grid>
                <Grid container>
                    <ItemGrid xs={12} sm={12} md={4}>
                        <ChartCard
                            chart={
                                <ChartistGraph
                                    className="ct-chart"
                                    data={dailySalesChart.data}
                                    type="Line"
                                    options={dailySalesChart.options}
                                    listener={
                                        dailySalesChart.animation
                                    }
                                />
                            }
                            chartColor="green"
                            title="Daily Sales"
                            text={
                                <span>
                                    <span className={this.props.classes.successText}><ArrowUpward className={this.props.classes.upArrowCardCategory}/> 55%</span> increase in today sales.
                                </span>
                            }
                            statIcon={AccessTime}
                            statText="updated 4 minutes ago"
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={12} md={4}>
                        <ChartCard
                            chart={
                                <ChartistGraph
                                    className="ct-chart"
                                    data={emailsSubscriptionChart.data}
                                    type="Bar"
                                    options={emailsSubscriptionChart.options}
                                    responsiveOptions={emailsSubscriptionChart.responsiveOptions}
                                    listener={
                                        emailsSubscriptionChart.animation
                                    }
                                />
                            }
                            chartColor="orange"
                            title="Email Subscriptions"
                            text="Last Campaign Performance"
                            statIcon={AccessTime}
                            statText="campaign sent 2 days ago"
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={12} md={4}>
                        <ChartCard
                            chart={
                                <ChartistGraph
                                    className="ct-chart"
                                    data={completedTasksChart.data}
                                    type="Line"
                                    options={completedTasksChart.options}
                                    listener={
                                        completedTasksChart.animation
                                    }
                                />
                            }
                            chartColor="red"
                            title="Completed Tasks"
                            text="Last Campaign Performance"
                            statIcon={AccessTime}
                            statText="campaign sent 2 days ago"
                        />
                    </ItemGrid>
                </Grid>
                <Grid container>
                    <ItemGrid xs={12} sm={12} md={6}>
                        <ReleaseCard
                            server_releases={this.state.server_tags}
                            client_releases={this.state.client_tags}
                        />
                    </ItemGrid>
                    <ItemGrid xs={12} sm={12} md={6}>
                        <RegularCard
                            headerColor="orange"
                            cardTitle="Employees Stats"
                            cardSubtitle="New employees on 15th September, 2016"
                            content={
                                <Table
                                    tableHeaderColor="warning"
                                    tableHead={['ID','Name','Salary','Country']}
                                    tableData={[
                                        [ '1' , "Dakota Rice" , "$36,738" , "Niger"] ,
                                        [ '2' , "Minerva Hooper" , "$23,789" , "Curaçao" ] ,
                                        [ '3' , "Sage Rodriguez" , "$56,142" , "Netherlands" ] ,
                                        [ '4' , "Philip Chaney" , "$38,735" , "Korea, South" ] ,
                                    ]}
                                />
                            }
                        />
                    </ItemGrid>
                </Grid>
            </div>
        );
    }
}

Dashboard.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(dashboardStyle)(Dashboard);
