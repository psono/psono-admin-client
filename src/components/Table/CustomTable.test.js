import React from 'react';
import { shallow } from 'enzyme';
import CustomTable from './CustomTable';

it('renders without crashing', () => {
    shallow(<CustomTable />);
});
