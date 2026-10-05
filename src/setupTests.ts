const localStorageMock = {
    length: 0,
    key: jest.fn(),
    removeItem: jest.fn(),
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
};
global.localStorage = localStorageMock;

jest.mock('./services/clientjs', () => {
    return {
        getFingerprint: () => {
            return 'dummy_fingerprint';
        },
    };
});
