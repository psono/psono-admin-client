import React from 'react';
import { shallow } from 'enzyme';
import Users from './Users';

it('renders without crashing', () => {
    shallow(<Users />);
});
