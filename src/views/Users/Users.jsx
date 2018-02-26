import React from 'react';
import {
    withStyles, Grid
} from 'material-ui';
import PropTypes from 'prop-types';
// react plugin for creating charts

import {
    UsersCard, ItemGrid
} from '../../components';


import { dashboardStyle } from '../../variables/styles';

class Dashboard extends React.Component{
    state = {
        users: [],
        sessions: []
    };


    render(){
        return (
            <div>
                <Grid container>
                    <ItemGrid xs={12} sm={12} md={12}>
                        <UsersCard
                            users={this.state.users}
                            sessions={this.state.sessions}
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
