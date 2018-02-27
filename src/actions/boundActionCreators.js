import store from '../services/store';
import actionCreators from './actionCreators';
import { bindActionCreators } from 'redux';

export default bindActionCreators(actionCreators, store.dispatch);
