import React from 'react';
import { shallow } from 'enzyme';
import Dashboard from './Dashboard';

it('renders without crashing', () => {
    shallow(<Dashboard />);
});
