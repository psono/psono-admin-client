import React from 'react';
import { shallow } from 'enzyme';
import Login from './Login';

it('renders without crashing', () => {
    shallow(<Login />);
});
