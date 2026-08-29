export function apiErrorCode(response) {
    if (!response || !response.data) return 'ERROR';
    const value =
        response.data.non_field_errors || response.data.errors || response.data;
    if (Array.isArray(value)) return value[0] || 'ERROR';
    return typeof value === 'string' ? value : 'ERROR';
}

export function isApiError(response, code) {
    return apiErrorCode(response) === code;
}
