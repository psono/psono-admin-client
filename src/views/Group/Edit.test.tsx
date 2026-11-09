import cryptoLibrary from '../../services/cryptoLibrary';
import { decryptGroupShareMetadata } from './Edit';

jest.mock('../../components/index', () => ({}));
jest.mock('../../services/api-server', () => ({}));
jest.mock('../../services/store', () => ({}));

const nodeCrypto = require('crypto');
const randomBytes = nodeCrypto.randomBytes;

describe('local group share metadata decryption', () => {
    beforeAll(() => {
        jest.spyOn(nodeCrypto, 'randomBytes').mockImplementation(
            (size) => new Uint8Array(randomBytes(size))
        );
    });

    afterAll(() => {
        jest.mocked(nodeCrypto.randomBytes).mockRestore();
    });

    function fixture(keyType = 'asymmetric') {
        const groupKeyPair = cryptoLibrary.generatePublicPrivateKeypair();
        const userKeyPair = cryptoLibrary.generatePublicPrivateKeypair();
        const groupSecretKey = cryptoLibrary.generateSecretKey();
        const user = {
            user_private_key: userKeyPair.private_key,
            user_secret_key: cryptoLibrary.generateSecretKey(),
        };
        const envelope =
            keyType === 'symmetric'
                ? cryptoLibrary.encryptData(
                      groupSecretKey,
                      user.user_secret_key
                  )
                : cryptoLibrary.encryptDataPublicKey(
                      groupSecretKey,
                      userKeyPair.public_key,
                      groupKeyPair.private_key
                  );
        const title = cryptoLibrary.encryptData(
            'Shared folder – 密碼',
            groupSecretKey
        );
        const type = cryptoLibrary.encryptData('folder', groupSecretKey);
        return {
            user,
            group: {
                public_key: groupKeyPair.public_key,
                own_group_user_secret: {
                    secret_key: envelope.text,
                    secret_key_nonce: envelope.nonce,
                    secret_key_type: keyType,
                },
                share_rights: [
                    {
                        id: 'right-1',
                        share_id: 'share-1',
                        read: true,
                        write: false,
                        grant: false,
                        share_title: '',
                        share_type: '',
                        share_title_encrypted: title.text,
                        share_title_nonce: title.nonce,
                        share_type_encrypted: type.text,
                        share_type_nonce: type.nonce,
                    },
                ],
            },
        };
    }

    test.each(['asymmetric', 'symmetric'])(
        'decrypts labels using a %s user envelope and preserves permissions',
        (keyType) => {
            const { group, user } = fixture(keyType);
            expect(decryptGroupShareMetadata(group, user)).toEqual([
                {
                    ...group.share_rights[0],
                    share_title: 'Shared folder – 密碼',
                    share_type: 'folder',
                },
            ]);
            expect(group.share_rights[0].share_title).toBe('');
            expect(group.share_rights[0].share_type).toBe('');
        }
    );

    test('keeps plaintext labels from older servers without encrypted fields', () => {
        const { group, user } = fixture();
        const legacy = {
            public_key: group.public_key,
            share_rights: [
                { share_title: 'Legacy folder', share_type: 'folder' },
            ],
        };
        expect(decryptGroupShareMetadata(legacy, user)).toEqual(
            legacy.share_rights
        );
    });

    test.each([null, undefined])(
        'keeps the group usable without an own key envelope: %p',
        (envelope) => {
            const { group, user } = fixture();
            expect(
                decryptGroupShareMetadata(
                    { ...group, own_group_user_secret: envelope },
                    user
                )
            ).toEqual(group.share_rights);
        }
    );

    test.each(['asymmetric', 'symmetric'])(
        'handles incorrect user keys for a %s envelope without exposing ciphertext as a label',
        (keyType) => {
            const { group, user } = fixture(keyType);
            const wrongUser = {
                ...user,
                user_private_key:
                    cryptoLibrary.generatePublicPrivateKeypair().private_key,
                user_secret_key: cryptoLibrary.generateSecretKey(),
            };
            expect(decryptGroupShareMetadata(group, wrongUser)).toEqual(
                group.share_rights
            );
        }
    );

    test('rejects unknown key types and malformed envelopes gracefully', () => {
        const { group, user } = fixture();
        for (const changes of [
            { secret_key_type: 'unknown' },
            { secret_key: 'not-hex' },
            { secret_key_nonce: '' },
        ]) {
            expect(
                decryptGroupShareMetadata(
                    {
                        ...group,
                        own_group_user_secret: {
                            ...group.own_group_user_secret,
                            ...changes,
                        },
                    },
                    user
                )
            ).toEqual(group.share_rights);
        }
    });

    test('a corrupt title does not block the type or other shares', () => {
        const { group, user } = fixture();
        const corrupt = {
            ...group,
            share_rights: [
                { ...group.share_rights[0], share_title_encrypted: '00' },
                group.share_rights[0],
            ],
        };
        const rights = decryptGroupShareMetadata(corrupt, user);
        expect(rights[0].share_title).toBe('');
        expect(rights[0].share_type).toBe('folder');
        expect(rights[1].share_title).toBe('Shared folder – 密碼');
        expect(rights[1].share_type).toBe('folder');
    });

    test('preserves legacy plaintext if encrypted metadata cannot be decrypted', () => {
        const { group, user } = fixture();
        const right = {
            ...group.share_rights[0],
            share_title: 'Legacy title',
            share_title_encrypted: '00',
            share_type_nonce: null,
        };
        expect(
            decryptGroupShareMetadata({ ...group, share_rights: [right] }, user)
        ).toEqual([right]);
    });
});
