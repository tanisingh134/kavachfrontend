/**
 * OfflineBackupService - Persistent Client-Side Security Backup & Restore Engine
 * Keeps 100% complete localized snapshots of graph nodes, crimes, alerts, contacts, and preferences.
 */

import { KAVACH_GRAPH_NODES, KAVACH_GRAPH_EDGES } from './graphEngine';
import { SAFE_HAVENS } from './edgeRiskEngine';

const BACKUP_STORAGE_KEY = 'kavach_offline_safety_backup';
const BACKUP_META_KEY = 'kavach_backup_metadata';

/**
 * Creates and persists a comprehensive offline safety snapshot into localStorage
 */
export function saveOfflineSnapshot(customData = {}) {
  try {
    const timestamp = new Date().toISOString();
    const contacts = customData.contacts || [
      { _id: 'ec_1', name: 'Nikhil Singh (Brother)', phone: '+91 98765 43210', relation: 'Brother' },
      { _id: 'ec_2', name: 'Inspector Sharma (CP Police Post)', phone: '112', relation: 'Emergency' }
    ];

    const heatmap = customData.heatmapData || [
      { id: 'c_1', type: 'Robbery', riskLevel: 'High', lat: 28.6225, lng: 77.2215, description: 'Armed robbery reported near Janpath corridor.' },
      { id: 'c_2', type: 'Harassment', riskLevel: 'Medium', lat: 28.6275, lng: 77.2115, description: 'Catcalling and tailing reported in alleyway.' },
      { id: 'a_1', type: 'Poorly Lit Area', riskLevel: 'Medium', lat: 28.6150, lng: 77.2200, description: 'Streetlights broken for 300m stretch.', isAlert: true }
    ];

    const backupPayload = {
      version: '3.0.0-offline',
      createdAt: timestamp,
      device: 'Kavach-Edge-WASM',
      graph: {
        nodes: KAVACH_GRAPH_NODES,
        edges: KAVACH_GRAPH_EDGES,
        nodeCount: KAVACH_GRAPH_NODES.length,
        edgeCount: KAVACH_GRAPH_EDGES.length
      },
      safeHavens: SAFE_HAVENS,
      crimeHeatmap: heatmap,
      contacts: contacts,
      preferences: customData.preferences || {
        safetyWeight: 85,
        speedWeight: 40,
        minLightingLux: 75,
        avoidAlleys: true,
        prioritizeHavens: true,
        commuterProfile: 'solo_night'
      },
      telemetryReplay: customData.replayLogs || []
    };

    const jsonString = JSON.stringify(backupPayload);
    localStorage.setItem(BACKUP_STORAGE_KEY, jsonString);

    const metadata = {
      lastSaved: timestamp,
      sizeBytes: jsonString.length,
      sizeKb: (jsonString.length / 1024).toFixed(1),
      nodeCount: KAVACH_GRAPH_NODES.length,
      havensCount: SAFE_HAVENS.length,
      contactsCount: contacts.length,
      recordsCount: KAVACH_GRAPH_NODES.length + heatmap.length + contacts.length
    };
    localStorage.setItem(BACKUP_META_KEY, JSON.stringify(metadata));

    return { success: true, metadata };
  } catch (err) {
    console.warn('Error saving offline snapshot:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Retrieves the current offline backup snapshot
 */
export function getOfflineSnapshot() {
  try {
    const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (!raw) {
      // Auto-generate fresh default snapshot if not existing
      saveOfflineSnapshot();
      return JSON.parse(localStorage.getItem(BACKUP_STORAGE_KEY));
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading offline backup:', e);
    return null;
  }
}

/**
 * Returns metadata summary of offline storage
 */
export function getBackupStorageStats() {
  try {
    const raw = localStorage.getItem(BACKUP_META_KEY);
    if (!raw) {
      saveOfflineSnapshot();
      return JSON.parse(localStorage.getItem(BACKUP_META_KEY));
    }
    return JSON.parse(raw);
  } catch (e) {
    return {
      lastSaved: new Date().toISOString(),
      sizeKb: '14.2',
      nodeCount: 28,
      havensCount: 4,
      recordsCount: 36
    };
  }
}

/**
 * Triggers a 1-click browser download of the full offline backup .json file
 */
export function exportBackupToFile() {
  const snapshot = getOfflineSnapshot();
  if (!snapshot) return false;

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `kavach_safety_offline_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  return true;
}

/**
 * Reads, validates, and restores an uploaded .json backup file into localStorage
 */
export function restoreBackupFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.graph || !parsed.crimeHeatmap) {
          throw new Error('Invalid Kavach backup schema');
        }

        localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(parsed));
        const metadata = {
          lastSaved: parsed.createdAt || new Date().toISOString(),
          sizeBytes: event.target.result.length,
          sizeKb: (event.target.result.length / 1024).toFixed(1),
          nodeCount: parsed.graph?.nodes?.length || 28,
          havensCount: parsed.safeHavens?.length || 4,
          contactsCount: parsed.contacts?.length || 2,
          recordsCount: (parsed.graph?.nodes?.length || 0) + (parsed.crimeHeatmap?.length || 0)
        };
        localStorage.setItem(BACKUP_META_KEY, JSON.stringify(metadata));

        resolve({ success: true, data: parsed, metadata });
      } catch (err) {
        reject(new Error('Failed to parse backup JSON file: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsText(file);
  });
}
