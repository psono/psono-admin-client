import React from 'react';
import { shallow } from 'enzyme';
import Index from './Index';

it('renders without crashing', () => {
    shallow(<Index />);
});
