import { combineReducers } from 'redux';
import persistent from './persistent';
import admin_client from './admin_client';
import user from './user';
import server from './server';
import client from './client';
import notification from './notification';

const rootReducer = combineReducers({
    persistent,
    admin_client,
    user,
    server,
    client,
    notification,
});

export default rootReducer;
