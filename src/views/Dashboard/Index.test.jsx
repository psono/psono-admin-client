import React from 'react';
import { shallow } from 'enzyme';
import Dashboard from './Index';

it('renders without crashing', () => {
    shallow(<Dashboard />);
});
