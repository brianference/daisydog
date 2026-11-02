/**
 * Tagged-template SQL layer over Cloudflare D1.
 *
 * Keeps the `sql\`SELECT ... ${value}\`` call shape the functions used with the
 * Neon driver, so the handlers stay readable. The Pages adapter stores the D1
 * binding on globalThis.__DAISY_DB for each request.
 *
 * Handles the Postgres spellings the handlers use (NOW(), ILIKE),
 * binds booleans/arrays/dates D1 cannot bind natively, supports nested
 * fragments (sql`AND x = ${y}` inside another query), and decodes 0/1
 * booleans and JSON text columns on the way out.
 */

const ISO_NOW = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

/** Columns stored as 0/1 that handlers and the dashboard expect as booleans. */
const BOOLEAN_COLUMNS = new Set([
  'email_verified',
  'is_active',
  'is_linked_account',
  'email_reports_enabled',
  'safety_alerts_enabled',
  'was_helpful',
  'parent_reviewed',
]);

/** Columns stored as JSON text that handlers and the dashboard expect parsed. */
const JSON_COLUMNS = new Set([
  'objectives',
  'vocabulary_words',
  'discussion_questions',
  'external_links',
  'allowed_features',
  'activities',
]);

/**
 * Rewrites the Postgres spellings the handlers use into SQLite.
 * @param {string} text static SQL text between interpolations
 * @returns {string} SQLite-compatible text
 */
function translate(text) {
  return text
    .replace(/\bNOW\(\)/gi, ISO_NOW)
    .replace(/\bILIKE\b/gi, 'LIKE');
}

/**
 * Converts a JS value into something D1 can bind.
 * @param {unknown} value interpolated value
 * @returns {string|number|null} bindable value
 */
function toBindable(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

/**
 * Returns the D1 binding for the current request.
 * @returns {object} D1 database binding
 */
function getDb() {
  const db = globalThis.__DAISY_DB;
  if (!db) throw new Error('D1 binding "DB" is not available to this function');
  return db;
}

/**
 * Decodes 0/1 booleans and JSON text columns on one result row.
 * @param {Record<string, unknown>} row raw D1 row
 * @returns {Record<string, unknown>} decoded row
 */
function decodeRow(row) {
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    if (BOOLEAN_COLUMNS.has(key) && (value === 0 || value === 1)) {
      out[key] = value === 1;
    } else if (JSON_COLUMNS.has(key) && typeof value === 'string') {
      try {
        out[key] = JSON.parse(value);
      } catch {
        out[key] = value;
      }
    } else {
      out[key] = value;
    }
  }
  return out;
}

/** A lazily executed query; awaiting it runs it, interpolating it inlines it. */
class Query {
  /**
   * @param {TemplateStringsArray} strings static parts
   * @param {unknown[]} values interpolated values
   */
  constructor(strings, values) {
    this.strings = strings;
    this.values = values;
  }

  /**
   * Flattens nested fragments into one SQL string plus bind list.
   * @returns {{text: string, params: Array<string|number|null>}} compiled query
   */
  compile() {
    let text = '';
    const params = [];
    this.strings.forEach((part, index) => {
      text += translate(part);
      if (index >= this.values.length) return;
      const value = this.values[index];
      if (value instanceof Query) {
        const inner = value.compile();
        text += inner.text;
        params.push(...inner.params);
      } else {
        text += '?';
        params.push(toBindable(value));
      }
    });
    return { text: text.replace(/\)\s*,\s*\?\s*\)/g, ')'), params };
  }

  /**
   * Runs the query and returns decoded rows, like the Neon driver did.
   * @param {Function} resolve promise resolve
   * @param {Function} reject promise reject
   * @returns {Promise<Array<Record<string, unknown>>>} rows
   */
  then(resolve, reject) {
    const { text, params } = this.compile();
    return getDb()
      .prepare(text)
      .bind(...params)
      .all()
      .then((result) => (result.results || []).map(decodeRow))
      .then(resolve, reject);
  }
}

/**
 * Tagged template entry point.
 * @param {TemplateStringsArray} strings static parts
 * @param {...unknown} values interpolated values
 * @returns {Query} awaitable query
 */
function sql(strings, ...values) {
  return new Query(strings, values);
}

module.exports = sql;
module.exports.sql = sql;
module.exports.translate = translate;
module.exports.decodeRow = decodeRow;
