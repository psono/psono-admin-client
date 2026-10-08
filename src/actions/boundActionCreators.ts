import store from '../services/store';
import actionCreators from './actionCreators';
import { bindActionCreators } from 'redux';

export type BoundActions = {
    [Key in keyof typeof actionCreators]: (
        ...args: Parameters<typeof actionCreators[Key]>
    ) => ReturnType<ReturnType<typeof actionCreators[Key]>>;
};

export default bindActionCreators<typeof actionCreators, BoundActions>(
    actionCreators,
    store.dispatch
);
