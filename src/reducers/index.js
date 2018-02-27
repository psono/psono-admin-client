import { combineReducers } from 'redux'
import persistent from './persistent'
import user from './user'
import server from './server'
import client from './client'

const rootReducer = combineReducers({
    persistent,
    user,
    server,
    client,
});

export default rootReducer