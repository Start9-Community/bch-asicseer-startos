#!/usr/bin/env python3
"""Patch asicseer-pool so it works against all three BCH nodes StartOS packages.

Upstream targets BCHN, whose JSON-RPC and wallet-backed `validateaddress` the
pool assumes. BCHD and Flowee the Hub each break a different one of those
assumptions, and each break is silent — the pool starts, holds the stratum port
open, and never produces work. Run from the asicseer-pool source root.

Every replacement below asserts its expected hit count, so an upstream bump that
moves one of these lines fails the image build instead of shipping a pool that
cannot mine against one node.
"""

import sys

CASHADDR_HELPERS = r"""
/* StartOS: the package passes the chain's CashAddr prefix and the node backend
 * in the environment; the helpers below accept only addresses for that chain. */
static const char *startos_cashaddr_prefix_(void)
{
    const char *p = getenv("STARTOS_CASHADDR_PREFIX");
    return p && *p ? p : "bitcoincash";
}

static bool startos_node_is_flowee_(void)
{
    const char *n = getenv("STARTOS_NODE");
    return n && !strcmp(n, "flowee");
}

static const char cashaddr_charset_[] = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

static uint64_t cashaddr_polymod_(const unsigned char *v, size_t n)
{
    uint64_t c = 1;
    for (size_t i = 0; i < n; i++) {
        const uint8_t c0 = (uint8_t)(c >> 35);
        c = ((c & 0x07ffffffffULL) << 5) ^ v[i];
        if (c0 & 0x01) c ^= 0x98f2bc8e61ULL;
        if (c0 & 0x02) c ^= 0x79b76d99e2ULL;
        if (c0 & 0x04) c ^= 0xf33e5fb3c4ULL;
        if (c0 & 0x08) c ^= 0xae2eabe2a8ULL;
        if (c0 & 0x10) c ^= 0x1e4f43e470ULL;
    }
    return c ^ 1;
}

static void p2pkh_script_(unsigned char *script, const unsigned char *hash)
{
    script[0]=0x76; script[1]=0xa9; script[2]=0x14;
    memcpy(script + 3, hash, 20);
    script[23]=0x88; script[24]=0xac;
}

static void p2sh_script_(unsigned char *script, const unsigned char *hash)
{
    script[0]=0xa9; script[1]=0x14;
    memcpy(script + 2, hash, 20);
    script[22]=0x87;
}

/* Derive the scriptPubKey of a 20-byte-hash CashAddr address for this chain,
 * after verifying its checksum with the chain's prefix. Returns the script
 * length (25 P2PKH, 23 P2SH), or 0 for anything else. */
static int cashaddr_to_scriptpubkey_(const char *address, unsigned char *script, int maxlen)
{
    if (!address || !script || maxlen < 25) return 0;
    const char *prefix = startos_cashaddr_prefix_();
    const size_t plen = strlen(prefix);
    const char *sep = strchr(address, ':');
    const char *payload = address;
    if (sep) {
        if ((size_t)(sep - address) != plen || strncasecmp(address, prefix, plen)) return 0;
        payload = sep + 1;
    }
    /* 34 data characters (version byte + 20-byte hash) and an 8-character checksum. */
    if (strlen(payload) != 42) return 0;
    unsigned char v[16 + 1 + 42];
    if (plen > 16) return 0;
    for (size_t i = 0; i < plen; i++) v[i] = (unsigned char)(prefix[i] & 0x1f);
    v[plen] = 0;
    /* The single-case rule covers the whole address, prefix included. */
    bool lower = false, upper = false;
    for (const char *c = address; *c; c++) {
        if (*c >= 'a' && *c <= 'z') lower = true;
        if (*c >= 'A' && *c <= 'Z') upper = true;
    }
    if (lower && upper) return 0;
    for (int i = 0; i < 42; i++) {
        const char *q = strchr(cashaddr_charset_, payload[i] | 0x20);
        if (!q || !*q) return 0;
        v[plen + 1 + i] = (unsigned char)(q - cashaddr_charset_);
    }
    if (cashaddr_polymod_(v, plen + 1 + 42) != 0) return 0;
    /* 34 groups of 5 bits: 21 bytes and 2 padding bits, which must be zero. */
    const unsigned char *b5 = v + plen + 1;
    unsigned char decoded[21];
    unsigned int acc = 0; int bits = 0, dlen = 0;
    for (int i = 0; i < 34; i++) {
        acc = (acc << 5) | b5[i];
        bits += 5;
        if (bits >= 8) { bits -= 8; decoded[dlen++] = (unsigned char)((acc >> bits) & 0xFF); }
    }
    if (dlen != 21 || (acc & ((1u << bits) - 1))) return 0;
    if (decoded[0] == 0x00) { p2pkh_script_(script, decoded + 1); return 25; }
    if (decoded[0] == 0x08) { p2sh_script_(script, decoded + 1); return 23; }
    return 0;
}

static const char base58_alphabet_[] = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/* Derive the scriptPubKey of a legacy Base58Check address for this chain,
 * after verifying its double-SHA256 checksum and its version byte. Returns
 * the script length (25 P2PKH, 23 P2SH), or 0 for anything else. */
static int base58check_to_scriptpubkey_(const char *address, unsigned char *script, int maxlen)
{
    if (!address || !script || maxlen < 25) return 0;
    const int alen = (int)strlen(address);
    if (alen < 25 || alen > 35) return 0;
    unsigned char decoded[25]; memset(decoded, 0, sizeof(decoded));
    int zeros = 0;
    while (zeros < alen && address[zeros] == '1') zeros++;
    for (int i = 0; i < alen; i++) {
        const char *q = strchr(base58_alphabet_, address[i]);
        if (!q || !*q) return 0;
        unsigned int carry = (unsigned int)(q - base58_alphabet_);
        for (int j = 24; j >= 0; j--) {
            carry += 58u * decoded[j];
            decoded[j] = (unsigned char)(carry & 0xFF);
            carry >>= 8;
        }
        if (carry) return 0; /* longer than 25 bytes */
    }
    int lead = 0;
    while (lead < 25 && !decoded[lead]) lead++;
    if (lead != zeros) return 0; /* each leading '1' encodes exactly one zero byte */
    unsigned char hash[32];
    gen_hash(decoded, hash, 21);
    if (memcmp(hash, decoded + 21, 4)) return 0;
    const bool mainnet = !strcmp(startos_cashaddr_prefix_(), "bitcoincash");
    if (decoded[0] == (mainnet ? 0x00 : 0x6f)) { p2pkh_script_(script, decoded + 1); return 25; }
    if (decoded[0] == (mainnet ? 0x05 : 0xc4)) { p2sh_script_(script, decoded + 1); return 23; }
    return 0;
}

"""

SCRIPTPUBKEY_QUIT = (
    '        if (unlikely(!tmp_val || !(spk = json_string_value(tmp_val)))) {\n'
    '            /* All recent bitcoinds with wallet support built in should\n'
    '             * support this, if not, quit here to keep things simple. */\n'
    '            quit(1, "No scriptPubkey returned for address %s -- please use a bitcoind with wallet support.", address);\n'
    '        }'
)

SCRIPTPUBKEY_DERIVE = (
    '        if (!tmp_val || !(spk = json_string_value(tmp_val))) {\n'
    '            /* BCHD has no wallet; derive scriptPubKey from address format directly.\n'
    '             * Try CashAddr (bitcoincash:q.../p...) then legacy Base58Check (1.../3...) */\n'
    '            int calen_ = cashaddr_to_scriptpubkey_(address, (unsigned char *)cscript_out, *cscript_len);\n'
    '            if (!calen_)\n'
    '                calen_ = base58check_to_scriptpubkey_(address, (unsigned char *)cscript_out, *cscript_len);\n'
    '            if (!calen_) {\n'
    '                LOGWARNING("No scriptPubkey for %s: not an address this pool can pay on this chain", address);\n'
    '                goto out;\n'
    '            }\n'
    '            *cscript_len = calen_;\n'
    '            ret = true;\n'
    '            goto out;\n'
    '        }'
)

ISVALID_REJECT = (
    '    if (!json_is_true(valid_val)) {\n'
    '        LOGDEBUG("Bitcoin address %s is NOT valid", address);\n'
    '        goto out;\n'
    '    }'
)

ISVALID_DERIVE = (
    '    if (!json_is_true(valid_val)) {\n'
    '        /* Flowee the Hub\'s validateaddress is legacy-base58-only and\n'
    '         * rejects every cashaddr. On Flowee alone, accept an address the\n'
    '         * helpers fully verify for this chain; anywhere else, and for\n'
    '         * anything they reject, the node\'s answer stands. */\n'
    '        unsigned char dscript_[40]; int dlen_ = (int)sizeof(dscript_);\n'
    '        int dn_ = 0;\n'
    '        if (startos_node_is_flowee_()) {\n'
    '            dn_ = cashaddr_to_scriptpubkey_(address, dscript_, dlen_);\n'
    '            if (!dn_) dn_ = base58check_to_scriptpubkey_(address, dscript_, dlen_);\n'
    '        }\n'
    '        if (!dn_) {\n'
    '            LOGDEBUG("Bitcoin address %s is NOT valid", address);\n'
    '            goto out;\n'
    '        }\n'
    '        if (cscript_out && cscript_len) {\n'
    '            if (dn_ > *cscript_len) {\n'
    '                LOGERR("Not enough space for derived scriptPubkey");\n'
    '                goto out;\n'
    '            }\n'
    '            memcpy(cscript_out, dscript_, dn_);\n'
    '            *cscript_len = dn_;\n'
    '        }\n'
    '        if (is_p2sh)\n'
    '            *is_p2sh = (dscript_[0] == 0xa9);\n'
    '        ret = true;\n'
    '        goto out;\n'
    '    }'
)

VALIDATE_ADDRESS_FN = 'bool validate_address('

READ_HEADER_ONCE = 'if ((ret = read_socket_line(cs, &timeout)) != 1) {'
READ_HEADER_DRAIN = (
    'while ((ret = read_socket_line(cs, &timeout)) > 1) {} if (ret != 1) {'
)

ISSCRIPT_QUIT = (
    'quit(1, "No isscript support from bitcoind -- please use a bitcoind with '
    'wallet support.");'
)
ISSCRIPT_ASSUME_P2PKH = 'tmp_val = json_false(); /* BCHD: no wallet, assume P2PKH */'

# (why, file, find, replace, expected hit count)
PATCHES = [
    (
        'BCHD rejects a JSON-RPC request with no "id" member; upstream omits it',
        'src/bitcoin.c',
        r'{\"method\": ',
        r'{\"id\":0,\"method\": ',
        10,
    ),
    (
        'the same, for the one call written without a space after the colon',
        'src/bitcoin.c',
        r'{\"method\":\"',
        r'{\"id\":0,\"method\":\"',
        1,
    ),
    (
        'BCHD errors on the "coinbasetxn" GBT capability unless --miningaddr is set',
        'src/bitcoin.c',
        r'\"coinbasetxn\", ',
        '',
        1,
    ),
    (
        "Go randomises header order, so BCHD can send Content-Type after "
        'Content-Length — drain the headers instead of reading one line',
        'src/asicseer-pool.c',
        READ_HEADER_ONCE,
        READ_HEADER_DRAIN,
        1,
    ),
    (
        'BCHD has no wallet, so validateaddress omits "isscript" — assume P2PKH',
        'src/bitcoin.c',
        ISSCRIPT_QUIT,
        ISSCRIPT_ASSUME_P2PKH,
        1,
    ),
    (
        'BCHD has no wallet, so validateaddress omits "scriptPubKey" — derive it',
        'src/bitcoin.c',
        SCRIPTPUBKEY_QUIT,
        SCRIPTPUBKEY_DERIVE,
        1,
    ),
    (
        "Flowee's validateaddress is legacy-base58-only and reports isvalid=false "
        'for every cashaddr — on Flowee, accept a fully verified address instead',
        'src/bitcoin.c',
        ISVALID_REJECT,
        ISVALID_DERIVE,
        1,
    ),
    (
        'the derivations above need the CashAddr/Base58Check helpers in scope',
        'src/bitcoin.c',
        VALIDATE_ADDRESS_FN,
        CASHADDR_HELPERS + VALIDATE_ADDRESS_FN,
        1,
    ),
    (
        'coinbaseaux is an optional GBT field Flowee omits, and the pool only '
        'reads its "flags" subfield, which it already defaults to ""',
        'src/bitcoin.c',
        ' || !curtime || !bits || !coinbase_aux))',
        ' || !curtime || !bits))',
        1,
    ),
]


def main() -> int:
    for why, path, find, replace, expected in PATCHES:
        with open(path) as f:
            src = f.read()

        found = src.count(find)
        if found != expected:
            print(
                f'ERROR: {path}: expected {expected} occurrence(s) of the anchor '
                f'for "{why}", found {found}. Upstream moved — reanchor this patch.',
                file=sys.stderr,
            )
            return 1

        with open(path, 'w') as f:
            f.write(src.replace(find, replace))

        print(f'patched {path} ({found}x): {why}')

    return 0


if __name__ == '__main__':
    sys.exit(main())
