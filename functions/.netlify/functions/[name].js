/**
 * Cloudflare Pages adapter for the existing Netlify functions.
 *
 * The frontend calls /.netlify/functions/<name>. This route keeps those URLs
 * working on Cloudflare Pages by translating the Workers Request into a
 * Netlify-style event, calling the unchanged handler in netlify/functions,
 * and translating its { statusCode, headers, body } result back.
 */

const HANDLERS = {
  'child-link': () => import('../../../netlify/functions/child-link.cjs'),
  'contact-form': () => import('../../../netlify/functions/contact-form.js'),
  'create-checkout-session': () => import('../../../netlify/functions/create-checkout-session.cjs'),
  'dashboard-api': () => import('../../../netlify/functions/dashboard-api.cjs'),
  'lessons-api': () => import('../../../netlify/functions/lessons-api.cjs'),
  'moderate-content': () => import('../../../netlify/functions/moderate-content.js'),
  'parent-auth': () => import('../../../netlify/functions/parent-auth.cjs'),
  'stripe-webhook': () => import('../../../netlify/functions/stripe-webhook.cjs'),
  'voice-speak': () => import('../../../netlify/functions/voice-speak.js'),
  'voice-token': () => import('../../../netlify/functions/voice-token.cjs'),
  'voice-transcribe': () => import('../../../netlify/functions/voice-transcribe.js'),
};

/**
 * Copies string bindings into process.env so handlers that read
 * process.env at module load see the same values they did on Netlify.
 * @param {Record<string, unknown>} env Pages bindings
 */
function populateProcessEnv(env) {
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string') process.env[key] = value;
  }
  process.env.URL = process.env.URL || process.env.SITE_URL || '';
}

/**
 * Builds a Netlify function event from a Workers Request.
 * @param {Request} request incoming request
 * @returns {Promise<object>} Netlify-style event
 */
async function toNetlifyEvent(request) {
  const url = new URL(request.url);
  const headers = {};
  request.headers.forEach((value, key) => { headers[key.toLowerCase()] = value; });
  const hasBody = !['GET', 'HEAD'].includes(request.method);
  return {
    httpMethod: request.method,
    path: url.pathname,
    rawUrl: request.url,
    headers,
    queryStringParameters: Object.fromEntries(url.searchParams),
    body: hasBody ? await request.text() : null,
    isBase64Encoded: false,
  };
}

/**
 * Converts a Netlify handler result into a Workers Response.
 * @param {{statusCode?: number, headers?: object, multiValueHeaders?: object, body?: string, isBase64Encoded?: boolean}} result
 * @returns {Response}
 */
function toResponse(result) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(result.headers || {})) headers.set(key, String(value));
  for (const [key, values] of Object.entries(result.multiValueHeaders || {})) {
    for (const value of values) headers.append(key, String(value));
  }
  let body = result.body ?? '';
  if (result.isBase64Encoded) {
    body = Uint8Array.from(atob(body), (ch) => ch.charCodeAt(0));
  }
  return new Response(body, { status: result.statusCode || 200, headers });
}

/**
 * Pages Function entry point for /.netlify/functions/:name.
 * @param {{request: Request, env: object, params: {name: string}}} context
 * @returns {Promise<Response>}
 */
export async function onRequest(context) {
  const load = HANDLERS[context.params.name];
  if (!load) {
    return new Response(JSON.stringify({ error: 'Function not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  populateProcessEnv(context.env);
  try {
    const mod = await load();
    const handler = mod.handler || mod.default?.handler;
    const event = await toNetlifyEvent(context.request);
    const result = await handler(event, {});
    return toResponse(result || {});
  } catch (error) {
    return new Response(JSON.stringify({ errorType: 'Error', errorMessage: error.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
