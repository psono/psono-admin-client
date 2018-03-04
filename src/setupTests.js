import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

jest.mock('./services/clientjs', () => ({
    getFingerprint: () => {
        return 'dummy_fingerprint';
    }
}));

configure({ adapter: new Adapter() });
