// SSRF-Schutz: Ziel-URL prüfen, Adressen nach dem DNS-Abruf prüfen, und die geprüfte Adresse verwenden.
import { isIP, BlockList } from 'node:net';
import { lookup } from 'node:dns/promises';

const blocked = new BlockList();
for (const [net, prefix] of [['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['224.0.0.0', 4], ['240.0.0.0', 4]]) blocked.addSubnet(net, prefix, 'ipv4');
for (const [net, prefix] of [['::', 128], ['::1', 128], ['fc00::', 7], ['fe80::', 10], ['ff00::', 8]]) blocked.addSubnet(net, prefix, 'ipv6');

/** True bei Adressen, die nie das Ziel einer Anfrage aus dem Internet sein dürfen (lokal, privat, Link-Local, Metadaten). */
export function isBlockedAddress(address) {
  const family = isIP(address);
  if (family === 4) return blocked.check(address, 'ipv4');
  if (family === 6) {
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address); // IPv4 in IPv6 verpackt
    if (mapped?.[1]) return blocked.check(mapped[1], 'ipv4');
    const mappedHex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i.exec(address);
    if (mappedHex?.[1] && mappedHex[2]) {
      const high = parseInt(mappedHex[1], 16);
      const low = parseInt(mappedHex[2], 16);
      return blocked.check(`${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`, 'ipv4');
    }
    return blocked.check(address, 'ipv6');
  }
  return true; // keine gültige IP: sicherheitshalber ablehnen
}

/**
 * Prüft eine URL für serverseitige Abrufe und liefert die Adresse, mit der verbunden werden soll.
 * allowedHosts (optional) ist die stärkste Maßnahme: nur bekannte Ziele.
 */
export async function resolvePublicTarget(input, { resolve = (host) => lookup(host, { all: true }), allowedHosts } = {}) {
  let url;
  try { url = new URL(input); } catch { throw new TypeError('Ungültige URL'); }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new RangeError('Nur http und https sind erlaubt');
  if (url.username || url.password) throw new RangeError('Zugangsdaten in der URL sind nicht erlaubt');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (allowedHosts && !allowedHosts.includes(host)) throw new RangeError('Host steht nicht auf der Liste');
  const addresses = isIP(host) ? [{ address: host }] : await resolve(host);
  if (addresses.length === 0) throw new RangeError('Host nicht auflösbar');
  const address = addresses.find((entry) => !isBlockedAddress(entry.address))?.address;
  if (addresses.some((entry) => isBlockedAddress(entry.address))) throw new RangeError('Ziel zeigt auf eine nicht erlaubte Adresse');
  if (!address) throw new RangeError('Keine erlaubte Adresse');
  return { url, address };
}
