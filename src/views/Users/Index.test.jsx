import React from 'react';
import { shallow } from 'enzyme';
import Users from './Index';

it('renders without crashing', () => {
    shallow(<Users />);
});
