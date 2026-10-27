import test from 'node:test';
import assert from 'node:assert/strict';
import { createPkce, buildAuthorizationUrl, parseCallback, REDIRECT_URI } from './ml-oauth-smoke.mjs';
import { createHash } from 'node:crypto';

test('PKCE tem aleatoriedade e challenge S256 correto', () => {
  const a = createPkce(), b = createPkce();
  assert.notEqual(a.verifier, b.verifier);
  assert.equal(a.challenge, createHash('sha256').update(a.verifier, 'ascii').digest('base64url'));
  assert.ok(a.verifier.length >= 43);
});

test('authorization url tem callback oficial e parametros', () => {
  const u = new URL(buildAuthorizationUrl('1234567890123456', 'abc123456789abcdef', 'challenge'));
  assert.equal(u.searchParams.get('redirect_uri'), REDIRECT_URI);
  assert.equal(u.searchParams.get('code_challenge_method'), 'S256');
});

test('retorno aceita apenas codigo com state valido', () => {
  assert.equal(parseCallback('/callback?state=state-correto&code=COD', 'state-correto'), 'COD');
});

test('retorno rejeita tentativa sem state, duplicacao e erros', () => {
  const invalidos = [
    '/callback?code=COD',
    '/callback?state=invalido&code=COD',
    '/callback?state=state-correto&code=A&code=B',
    '/callback?state=state-correto&state=state-correto&code=A',
    '/callback?state=state-correto&error=access_denied',
    '/outro?state=state-correto&code=COD',
  ];
  for (const url of invalidos) assert.throws(() => parseCallback(url, 'state-correto'));
});
