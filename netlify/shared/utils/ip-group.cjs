/**
 * Buckets a client IP for rate limiting.
 * IPv6 addresses are grouped by /64 (one subscriber), so rotating the low 64 bits
 * does not give an attacker a fresh limiter bucket on every request. IPv4 is unchanged.
 * @param {string} ip Client IP address
 * @returns {string} Bucketing key
 */
function ipGroup(ip) {
  if (!ip.includes(':')) return ip;
  const [head, tail = ''] = ip.split('::');
  const front = head ? head.split(':') : [];
  const back = tail ? tail.split(':') : [];
  const filler = Array(Math.max(8 - front.length - back.length, 0)).fill('0');
  return [...front, ...filler, ...back]
    .slice(0, 4)
    .map((part) => part.toLowerCase().padStart(4, '0'))
    .join(':');
}

module.exports = { ipGroup };
