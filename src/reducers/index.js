import { combineReducers } from 'redux';
import persistent from './persistent';
import user from './user';
import server from './server';
import client from './client';
import notification from './notification';

const rootReducer = combineReducers({
    persistent,
    user,
    server,
    client,
    notification
});

export default rootReducer;
