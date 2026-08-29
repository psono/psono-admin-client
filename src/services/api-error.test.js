import { apiErrorCode, isApiError } from './api-error';

test('extracts server validation errors', () => {
    const response = {
        data: {
            non_field_errors: ['SHARED_OWNERSHIP_CONFIRMATION_REQUIRED'],
        },
    };
    expect(apiErrorCode(response)).toBe(
        'SHARED_OWNERSHIP_CONFIRMATION_REQUIRED'
    );
    expect(isApiError(response, 'SHARED_OWNERSHIP_CONFIRMATION_REQUIRED')).toBe(
        true
    );
    expect(apiErrorCode({ data: { unexpected: true } })).toBe('ERROR');
});
