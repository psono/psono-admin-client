export function apiErrorCode(response: unknown): string {
    if (!response || typeof response !== 'object' || !('data' in response))
        return 'ERROR';
    if (!response || !response.data) return 'ERROR';
    const data = response.data;
    const value =
        data && typeof data === 'object'
            ? ('non_field_errors' in data && data.non_field_errors) ||
              ('errors' in data && data.errors) ||
              data
            : data;
    if (Array.isArray(value))
        return typeof value[0] === 'string' ? value[0] || 'ERROR' : 'ERROR';
    if (value && typeof value === 'object') {
        const fieldError = Object.values(value).find(Array.isArray);
        if (fieldError)
            return typeof fieldError[0] === 'string'
                ? fieldError[0] || 'ERROR'
                : 'ERROR';
    }
    return typeof value === 'string' ? value : 'ERROR';
}

export function isApiError(response: unknown, code: string) {
    return apiErrorCode(response) === code;
}
