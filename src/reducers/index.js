import { combineReducers } from 'redux'
import persistent from './persistent'
import user from './user'
import server from './server'

const rootReducer = combineReducers({
    persistent,
    user,
    server,
});

export default rootReducer