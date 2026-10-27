#!/usr/bin/env node
/** Diagnostico pontual OAuth Mercado Livre (Node.js 20+; sem dependencias npm).
 *  Sem gravar tokens/credenciais. Executar somente em maquina autorizada.
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { pathToFileURL } from 'node:url';

export const REDIRECT_URI = 'https://garimpo-da-vez.netlify.app/oauth/callback/';
export const CALLBACK_PORT = 8765;
const AUTH_ENDPOINT = 'https://auth.mercadolivre.com.br/authorization';
const TOKEN_ENDPOINT = 'https://api.mercadolibre.com/oauth/token';

export function createPkce() {
  const verifier = randomBytes(64).toString('base64url');
  const challenge = createHash('sha256').update(verifier, 'ascii').digest('base64url');
  return { verifier, challenge };
}

export function buildAuthorizationUrl(clientId, state, challenge) {
  if (!/^\d{5,30}$/.test(clientId)) throw new Error('App ID invalido; consulte o DevCenter.');
  if (state.length < 16 || !challenge) throw new Error('Parametros PKCE/state invalidos.');
  const url = new URL(AUTH_ENDPOINT);
  url.search = new URLSearchParams({
    response_type: 'code', client_id: clientId, redirect_uri: REDIRECT_URI,
    state, code_challenge: challenge, code_challenge_method: 'S256',
  }).toString();
  return url.toString();
}

function stateEquals(received, expected) {
  if (typeof received !== 'string' || typeof expected !== 'string') return false;
  const a = Buffer.from(received), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function parseCallback(path, expectedState) {
  if (typeof path !== 'string' || path.length > 4096) throw new Error('Callback invalido.');
  let u;
  try { u = new URL(path, `http://127.0.0.1:${CALLBACK_PORT}`); }
  catch { throw new Error('Callback malformado.'); }
  if (u.pathname !== '/callback' || u.origin !== `http://127.0.0.1:${CALLBACK_PORT}`) {
    throw new Error('Rota do callback invalida.');
  }
  const states = u.searchParams.getAll('state');
  const codes = u.searchParams.getAll('code');
  const errors = u.searchParams.getAll('error');
  if (states.length !== 1 || !stateEquals(states[0], expectedState)) {
    throw new Error('State ausente ou nao corresponde a requisicao.');
  }
  if (errors.length) throw new Error('Autorizacao recusada ou callback conflitante.');
  if (codes.length !== 1 || !codes[0] || codes[0].length > 2048) {
    throw new Error('Codigo de autorizacao ausente ou invalido.');
  }
  return codes[0];
}

function reply(res, status, message) {
  const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>Garimpo da Vez</title><p>${message}</p></html>`;
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': "default-src 'none'",
    'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(html);
}

export function awaitLocalCallback(expectedState, onReady, timeoutMs = 240_000) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let timer;
    const server = createServer((req, res) => {
      if (req.method !== 'GET' || req.headers.host !== `127.0.0.1:${CALLBACK_PORT}`) {
        reply(res, 400, 'Requisicao invalida.');
        return;
      }
      try {
        const code = parseCallback(req.url, expectedState);
        reply(res, 200, 'Autorizacao recebida. Volte ao terminal do Garimpo da Vez.');
        finish(null, code);
      } catch {
        reply(res, 400, 'Retorno invalido. Tente novamente pelo aplicativo.');
      }
    });
    function finish(err, code) {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      server.close();
      if (err) reject(err);
      else resolve(code);
    }
    server.once('error', () => finish(new Error('Porta local 8765 indisponivel ou bloqueada.')));
    server.listen(CALLBACK_PORT, '127.0.0.1', () => {
      timer = setTimeout(() => finish(new Error('Tempo de autorizacao esgotado.')), timeoutMs);
      onReady();
    });
  });
}

export async function exchangeAuthorizationCode({ clientId, clientSecret, code, verifier, fetchImpl = fetch }) {
  const response = await fetchImpl(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
    body: new URLSearchParams({
      grant_type: 'authorization_code', client_id: clientId, client_secret: clientSecret,
      code, redirect_uri: REDIRECT_URI, code_verifier: verifier,
    }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error(`Troca OAuth recusada (HTTP ${response.status}). Confira redirect URI, escopos e app.`);
  const data = await response.json();
  if (!data || typeof data.access_token !== 'string' || !data.access_token ||
      typeof data.refresh_token !== 'string' || !data.refresh_token ||
      !(Number(data.expires_in) > 0)) {
    throw new Error('Resposta de token incompleta.');
  }
  return data; // Mantido somente em memoria; nunca salvar ou exibir.
}

async function promptSecret() {
  if (!stdin.isTTY || !stdout.isTTY || typeof stdin.setRawMode !== 'function') {
    throw new Error('Terminal interativo necessario para digitar o Client Secret com seguranca.');
  }
  stdout.write('Client Secret do DevCenter (entrada oculta): ');
  return new Promise((resolve, reject) => {
    let secret = '';
    stdin.setRawMode(true);
    stdin.resume();
    function stop(err) {
      stdin.off('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\n');
      if (err) reject(err);
      else resolve(secret);
    }
    function onData(buffer) {
      for (const key of buffer.toString('utf8')) {
        if (key === '\u0003') { stop(new Error('Interrompido.')); return; }
        if (key === '\r' || key === '\n') { stop(); return; }
        if (key === '\u007f' || key === '\b') { secret = secret.slice(0, -1); continue; }
        if (key >= ' ' && key !== '\u007f') secret += key;
      }
    }
    stdin.on('data', onData);
  });
}

async function checkCallback() {
  const resp = await fetch(REDIRECT_URI, { signal: AbortSignal.timeout(10_000) });
  if (!resp.ok) throw new Error(`Callback HTTPS retornou HTTP ${resp.status}.`);
  const html = await resp.text();
  if (!html.includes('127.0.0.1:8765/callback') || !html.includes('state')) {
    throw new Error('Pagina publicada nao corresponde a ponte OAuth esperada.');
  }
  console.log('OK: pagina HTTPS do callback acessivel e ponte local identificada.');
  console.log('Este teste NAO confirma autorizacao nem permissao da API.');
}

async function runLoginTest() {
  const rl = createInterface({ input: stdin, output: stdout });
  let clientId = process.env.MERCADOLIVRE_CLIENT_ID?.trim();
  if (!clientId) clientId = (await rl.question('App ID (Client ID, nao e segredo): ')).trim();
  rl.close();
  if (!/^\d{5,30}$/.test(clientId)) throw new Error('Client ID invalido.');
  const clientSecret = await promptSecret();
  if (!clientSecret) throw new Error('Client Secret nao informado.');
  const { verifier, challenge } = createPkce();
  const state = randomBytes(32).toString('base64url');
  const authUrl = buildAuthorizationUrl(clientId, state, challenge);
  console.log('Iniciando recepcao no seu proprio computador, somente em 127.0.0.1:8765.');
  const code = await awaitLocalCallback(state, () => {
    console.log('Abra o endereco abaixo no navegador DESTE computador para autorizar:');
    console.log(authUrl);
    console.log('Aguardando retorno por ate 4 minutos...');
  });
  const data = await exchangeAuthorizationCode({ clientId, clientSecret, code, verifier });
  console.log(`SUCESSO: OAuth funcionou com a Netlify. Validade informada: ${Number(data.expires_in)} segundos.`);
  console.log('Tokens recebidos e descartados ao encerrar o processo; nada foi salvo.');
  console.log('Este teste NAO gera links de afiliado nem cria uma sessao persistente.');
}

async function main() {
  const arg = process.argv[2] ?? '--help';
  if (arg === '--check') await checkCallback();
  else if (arg === '--login-test') await runLoginTest();
  else if (arg === '--help' || arg === '-h') {
    console.log('Uso (Node.js 20+): node automation/node/ml-oauth-smoke.mjs --check | --login-test');
    console.log('--check: confere callback Netlify sem credenciais; --login-test: teste OAuth completo sem salvar tokens.');
  } else throw new Error('Comando desconhecido. Use --help.');
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch((error) => {
    // Nunca exibir respostas do endpoint OAuth, codigo de retorno, secrets ou tokens.
    console.error('Falha:', error.message);
    process.exitCode = 1;
  });
}
