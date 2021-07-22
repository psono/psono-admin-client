import React from 'react';
import helper from './helper';

describe('Service: helper test suite', function() {
    it('helper exists', function() {
        expect(helper).toBeDefined();
    });

    it('parse_url www domain', function() {
        expect(
            helper.parse_url('https://www.example.com/url-part/#is-not-part')
        ).toEqual({
            scheme: 'https',
            authority: 'example.com',
            base_url: 'https://www.example.com',
            full_domain: 'example.com',
            top_domain: 'example.com',
            port: null,
            path: '/url-part/',
            query: undefined,
            fragment: 'is-not-part'
        });
    });

    it('parse_url top lvl domain', function() {
        expect(
            helper.parse_url('https://example.com/url-part/#is-not-part')
        ).toEqual({
            scheme: 'https',
            authority: 'example.com',
            base_url: 'https://example.com',
            full_domain: 'example.com',
            top_domain: 'example.com',
            port: null,
            path: '/url-part/',
            query: undefined,
            fragment: 'is-not-part'
        });
    });

    it('parse_url sub domain', function() {
        expect(
            helper.parse_url('http://test.example.com/url-part/#is-not-part')
        ).toEqual({
            scheme: 'http',
            authority: 'test.example.com',
            base_url: 'http://test.example.com',
            full_domain: 'test.example.com',
            top_domain: 'example.com',
            port: null,
            path: '/url-part/',
            query: undefined,
            fragment: 'is-not-part'
        });
    });

    it('parse_url sub domain with port', function() {
        expect(
            helper.parse_url(
                'http://test.example.com:6000/url-part/#is-not-part'
            )
        ).toEqual({
            scheme: 'http',
            authority: 'test.example.com:6000',
            base_url: 'http://test.example.com:6000',
            full_domain: 'test.example.com',
            top_domain: 'example.com',
            port: '6000',
            path: '/url-part/',
            query: undefined,
            fragment: 'is-not-part'
        });
    });

    it('get_domain sub domain', function() {
        expect(
            helper.get_domain('http://test.example.com/url-part/#is-not-part')
        ).toEqual('test.example.com');
    });

    it('get_domain www domain', function() {
        expect(
            helper.get_domain('http://www.example.com/url-part/#is-not-part')
        ).toEqual('example.com');
    });

    it('get_domain top level domain', function() {
        expect(
            helper.get_domain('http://example.com/url-part/#is-not-part')
        ).toEqual('example.com');
    });

    it('array_starts_with a no array', function() {
        expect(helper.array_starts_with('a', ['a'])).toBeFalsy();
    });

    it('array_starts_with b no array', function() {
        expect(helper.array_starts_with(['a'], 'a')).toBeFalsy();
    });

    it('array_starts_with a.length < b.lenght', function() {
        expect(helper.array_starts_with(['a'], ['a', 'b'])).toBeFalsy();
    });

    it('array_starts_with a = b', function() {
        expect(helper.array_starts_with(['a', 'b'], ['a', 'b'])).toBeTruthy();
    });

    it('array_starts_with a != b', function() {
        expect(helper.array_starts_with(['a', 'b'], ['a', 'c'])).toBeFalsy();
    });

    it('array_starts_with a starts with b', function() {
        expect(
            helper.array_starts_with(['a', 'b', 'c'], ['a', 'b'])
        ).toBeTruthy();
    });

    it('create_list', function() {
        const list = [];

        helper.create_list(
            {
                items: ['a', 'b'],
                folders: [
                    {
                        items: ['c', 'd']
                        // no folders
                    },
                    {
                        // two folder parallel
                        items: ['e', 'f'],
                        folders: [
                            {
                                // at least two folder level handled
                                items: ['g', 'h'],
                                folders: [
                                    // empty folders
                                ]
                            }
                        ]
                    }
                ]
            },
            list
        );

        expect(list).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
    });

    it('duplicate_object', function() {
        const orig_obj = {
            a: ['b'],
            c: true
        };

        const dubl_obj = helper.duplicate_object(orig_obj);

        expect(orig_obj).toEqual(dubl_obj);
        dubl_obj.c = false;
        expect(orig_obj).not.toEqual(dubl_obj);
    });

    it('is_valid_username not allowed chars', function() {
        expect(helper.is_valid_username('ab@cd') === true).toBeFalsy();
    });

    it('is_valid_username too small', function() {
        expect(helper.is_valid_username('ab') === true).toBeFalsy();
    });

    it('is_valid_username start with .', function() {
        expect(helper.is_valid_username('.abcd') === true).toBeFalsy();
    });

    it('is_valid_username start with -', function() {
        expect(helper.is_valid_username('-abcd') === true).toBeFalsy();
    });

    it('is_valid_username end with .', function() {
        expect(helper.is_valid_username('abcd.') === true).toBeFalsy();
    });

    it('is_valid_username end with -', function() {
        expect(helper.is_valid_username('abcd-') === true).toBeFalsy();
    });

    it('is_valid_username double occurrence of .', function() {
        expect(helper.is_valid_username('abc..def') === true).toBeFalsy();
    });

    it('is_valid_username double occurrence of -', function() {
        expect(helper.is_valid_username('abc--def') === true).toBeFalsy();
    });

    it('is_valid_username occurrence of .-', function() {
        expect(helper.is_valid_username('abc.-def') === true).toBeFalsy();
    });

    it('is_valid_username occurrence of -.', function() {
        expect(helper.is_valid_username('abc-.def') === true).toBeFalsy();
    });

    it('is_valid_username valid', function() {
        expect(helper.is_valid_username('abc') === true).toBeTruthy();
    });

    it('remove_from_array', function() {
        const array = [1, 2, 5, 7];
        const search = 5;
        const target = [1, 2, 7];

        helper.remove_from_array(array, search);

        expect(array).toEqual(target);
    });

    it('remove_from_array_own_cmp_fct', function() {
        const array = [1, 2, 5, 5, 7];
        const search = 5;
        const target = [5, 5];

        const cmp_fct = function(a, b) {
            return a !== b;
        };

        helper.remove_from_array(array, search, cmp_fct);

        expect(array).toEqual(target);
    });

    it('form_full_username_without_email_syntax', function() {
        const username = 'test';
        const domain = 'example.com';

        const full_username = helper.form_full_username(username, domain);

        expect(full_username).toEqual(username + '@' + domain);
    });

    it('form_full_username_with_email_syntax', function() {
        const username = 'test@example1.com';
        const domain = 'example.com';

        const full_username = helper.form_full_username(username, domain);

        expect(full_username).toEqual(username);
    });

    it('is_valid_password_too_short', function() {
        const password1 = '12345678901';

        const is_valid = helper.is_valid_password(password1, password1);

        expect(is_valid).toEqual('Password too short (min 12 chars).');
    });

    it('is_valid_password_no_match', function() {
        const password1 = '123456789012';
        const password2 = '123456789013';

        const is_valid = helper.is_valid_password(password1, password2);

        expect(is_valid).toEqual("Passwords don't match.");
    });
});
