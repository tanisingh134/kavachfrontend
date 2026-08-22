/**
 * MeshPacketService - Compact binary/hex/SMS emergency mesh packet builder.
 * Generates ultra-lightweight (<64 byte) payloads for offline Bluetooth Mesh, LoRaWAN, and Satellite SOS.
 */

export function generateMeshSosPacket(payload = {}) {
  const {
    userId = 'KVCH-9921',
    lat = 28.6304,
    lng = 77.2177,
    battery = 65,
    triggerType = 'AUD_SPIKE', // 'AUD_SPIKE', 'MANUAL_SOS', 'ANOMALY', 'TAP_STEALTH'
    nearestHaven = 'CP Police Outpost'
  } = payload;

  const timestamp = Math.floor(Date.now() / 1000);
  
  // Format compact base string
  const latStr = lat.toFixed(4);
  const lngStr = lng.toFixed(4);
  const rawData = `${userId}|${latStr}|${lngStr}|${timestamp}|B${battery}|${triggerType}`;
  
  // Generate simple 6-char hex checksum
  let hash = 0;
  for (let i = 0; i < rawData.length; i++) {
    hash = (hash << 5) - hash + rawData.charCodeAt(i);
    hash |= 0;
  }
  const checksum = Math.abs(hash).toString(16).substring(0, 6).toUpperCase();

  // Compact packet for transmission
  const compressedPacket = `[KVCH-MESH-SOS] ${rawData}#${checksum}`;
  
  // Simulated LoRa / BLE 16-byte raw hex representation
  const hexBytes = Array.from(rawData)
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .slice(0, 32)
    .join(' ');

  return {
    rawString: compressedPacket,
    hexRepresentation: hexBytes,
    byteSize: compressedPacket.length,
    timestamp: new Date().toLocaleTimeString(),
    simulatedRelays: [
      { node: 'Local Device BLE Mesh', rssi: '-42 dBm', status: 'Dispatched' },
      { node: 'CP Smart Pole #04 Gateway', rssi: '-68 dBm', status: 'Relayed' },
      { node: 'Rajiv Chowk Metro Receiver', rssi: '-74 dBm', status: 'Relayed' },
      { node: 'Central Police Command Dispatch', rssi: 'Direct', status: 'Delivered (ACK)' }
    ],
    metadata: {
      userId,
      coordinates: [lat, lng],
      battery,
      triggerType,
      nearestHaven
    }
  };
}
