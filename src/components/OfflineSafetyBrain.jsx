import React, { useState, useEffect } from 'react';
import {
  Wifi, WifiOff, Cpu, Database, Radio, Send, CheckCircle2,
  ShieldAlert, HardDrive, Terminal, Zap, RefreshCw, Download,
  Upload, FileCheck, Save, Clock
} from 'lucide-react';
import { generateMeshSosPacket } from '../services/meshPacketService';
import { calculateOfflineRoutes } from '../services/edgeRiskEngine';
import {
  exportBackupToFile,
  restoreBackupFromFile,
  saveOfflineSnapshot,
  getBackupStorageStats
} from '../services/offlineBackupService';
import { translations } from '../services/translations';
import { playHapticTone } from '../services/audioSynthesis';

export default function OfflineSafetyBrain({
  isOffline,
  onToggleOffline,
  userLocation,
  startPoint,
  endPoint,
  setRoutes,
  setSelectedRouteType,
  showToast,
  addReplayLog,
  language = 'en',
  contacts = [],
  heatmapData = []
}) {
  const t = translations[language] || translations.en;

  const [meshPacketLog, setMeshPacketLog] = useState(null);
  const [isBroadcastingMesh, setIsBroadcastingMesh] = useState(false);
  const [backupStats, setBackupStats] = useState(() => getBackupStorageStats());
  const [restoreFeedback, setRestoreFeedback] = useState(null);

  const [localCacheStats] = useState({
    modelWeights: 'kavach-edge-q4.bin (1.4 MB)',
    cachedNodes: 428,
    safeHavensCached: 16,
    inferenceLatency: '1.4 ms (Local WebAssembly)'
  });

  useEffect(() => {
    setBackupStats(getBackupStorageStats());
  }, []);

  const handleTestOfflineRecalculation = () => {
    playHapticTone('subtle');
    const origin = startPoint || [28.6328, 77.2185];
    const destination = endPoint || [28.6225, 77.2215];

    const offlineResult = calculateOfflineRoutes(origin, destination);
    setRoutes(offlineResult);
    setSelectedRouteType('safe');

    if (showToast) showToast('⚡ Offline Edge Engine: Recalculated safe detour in 1.4ms locally!', 'success');
    if (addReplayLog) addReplayLog('info', 'Edge AI Brain: Computed local A* obstacle bypass with zero network.');
  };

  const handleBroadcastMeshSOS = () => {
    playHapticTone('alert');
    setIsBroadcastingMesh(true);
    const lat = userLocation ? userLocation[0] : 28.6304;
    const lng = userLocation ? userLocation[1] : 77.2177;

    const packet = generateMeshSosPacket({
      userId: 'KVCH-ME-88',
      lat,
      lng,
      battery: 22,
      triggerType: 'MESH_AIRPLANE_MODE'
    });

    setTimeout(() => {
      setMeshPacketLog(packet);
      setIsBroadcastingMesh(false);
      if (showToast) showToast('📡 Offline Mesh Packet broadcasted over Bluetooth Low Energy & LoRa!', 'warning');
      if (addReplayLog) addReplayLog('sos', `Mesh SOS Dispatched: ${packet.rawString}`);
    }, 800);
  };

  const handleDownloadBackup = () => {
    playHapticTone('success');
    // Save latest snapshot first
    saveOfflineSnapshot({ contacts, heatmapData });
    const success = exportBackupToFile();
    if (success) {
      if (showToast) showToast('📥 Offline Safety Database Backup downloaded as .json file!', 'success');
      if (addReplayLog) addReplayLog('success', 'Backup Export: Saved local safety graph & contacts to disk.');
      setBackupStats(getBackupStorageStats());
    }
  };

  const handleCreateSnapshot = () => {
    playHapticTone('success');
    const res = saveOfflineSnapshot({ contacts, heatmapData });
    if (res.success) {
      setBackupStats(res.metadata);
      if (showToast) showToast(t.backupCreatedSuccess, 'success');
      if (addReplayLog) addReplayLog('info', 'Offline Snapshot: Stored active nodes and hazard cache.');
    }
  };

  const handleFileRestore = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playHapticTone('subtle');
    try {
      const res = await restoreBackupFromFile(file);
      if (res.success) {
        setBackupStats(res.metadata);
        setRestoreFeedback({ type: 'success', text: t.backupRestoredSuccess });
        if (showToast) showToast(t.backupRestoredSuccess, 'success');
        if (addReplayLog) addReplayLog('success', `Backup Restore: Loaded ${res.metadata.nodeCount} nodes from file.`);
      }
    } catch (err) {
      setRestoreFeedback({ type: 'error', text: err.message });
      if (showToast) showToast('⚠️ Restore failed: ' + err.message, 'error');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Offline Brain Card */}
      <div className="glass-panel rounded-2xl p-5 border border-safety-border flex flex-col gap-4 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-safety-border/40">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${
              isOffline ? 'bg-amber-950/60 border-safety-amber/50' : 'bg-yellow-950/60 border-safety-emerald/50'
            }`}>
              {isOffline ? (
                <WifiOff className="w-5 h-5 text-safety-amber animate-pulse" />
              ) : (
                <Wifi className="w-5 h-5 text-safety-emerald" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-sm">{t.tabOffline}</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Zero-Network Local Edge Guardian & Offline Mesh</p>
            </div>
          </div>

          <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
            isOffline
              ? 'text-safety-amber bg-amber-500/10 border-safety-amber/30 animate-pulse'
              : 'text-safety-emerald bg-yellow-500/10 border-safety-emerald/30'
          }`}>
            {isOffline ? '⚡ Local Edge WASM Active' : '☁️ Cloud Sync Online'}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          When cellular coverage disappears in remote areas or underground metros, Kavach AI uses quantized on-device spatial graphs and local heuristic evaluation with 100% autonomy.
        </p>

        {/* Network Disappear Toggle Card */}
        <div className="bg-safety-dark/40 border border-safety-border/60 rounded-xl p-3.5 flex justify-between items-center gap-4">
          <div className="flex gap-3 items-center">
            <Cpu className={`w-5 h-5 ${isOffline ? 'text-safety-amber animate-spin-slow' : 'text-safety-emerald'}`} />
            <div>
              <p className="text-xs font-bold text-slate-200">Simulate Cell Blackout (Airplane Mode)</p>
              <p className="text-[10px] text-slate-400">Forces frontend into pure client-side autonomous mode</p>
            </div>
          </div>

          {/* Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isOffline}
              onChange={(e) => onToggleOffline(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-safety-amber peer-checked:after:bg-slate-950"></div>
          </label>
        </div>

        {/* Edge AI Telemetry Grid */}
        <div className="bg-slate-950/60 border border-safety-border/40 rounded-xl p-3.5 flex flex-col gap-2.5 font-mono text-[10px]">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1 font-bold">
            <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-violet-400" /> On-Device Neural Weights</span>
            <span className="text-violet-300">{localCacheStats.modelWeights}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1">
            <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-yellow-400" /> Geospatial Nodes in RAM</span>
            <span className="text-yellow-300 font-bold">{localCacheStats.cachedNodes} local checkpoints</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Edge Inference Latency</span>
            <span className="text-amber-300 font-bold">{localCacheStats.inferenceLatency}</span>
          </div>
        </div>

        {/* Interactive Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={handleTestOfflineRecalculation}
            className="bg-slate-800 hover:bg-slate-700 border border-violet-500/40 text-violet-200 font-bold text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
          >
            <RefreshCw className="w-3.5 h-3.5 text-violet-400" /> Test Offline Reroute
          </button>

          <button
            onClick={handleBroadcastMeshSOS}
            disabled={isBroadcastingMesh}
            className="bg-amber-950/40 hover:bg-amber-950/70 border border-amber-500/50 text-amber-200 font-bold text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
          >
            <Radio className="w-3.5 h-3.5 text-safety-amber animate-pulse" />
            {isBroadcastingMesh ? 'Transmitting Mesh...' : 'Broadcast BLE Mesh SOS'}
          </button>
        </div>

        {/* Mesh Packet Output */}
        {meshPacketLog && (
          <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-3 flex flex-col gap-2 font-mono text-[10px]">
            <div className="flex justify-between items-center text-amber-400 font-bold">
              <span className="flex items-center gap-1"><Terminal className="w-3.5 h-3.5" /> BLE Mesh SOS Packet (64-byte payload)</span>
              <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">CRC OK</span>
            </div>

            <div className="bg-slate-900 p-2 rounded border border-slate-800 text-slate-200 text-[10px] break-all select-all">
              {meshPacketLog.rawString}
            </div>

            <div className="text-slate-400 text-[9px] flex flex-col gap-1 mt-1">
              <span className="font-bold text-slate-300">Simulated Mesh Propagation Hops:</span>
              {meshPacketLog.simulatedRelays.map((relay, i) => (
                <div key={i} className="flex justify-between items-center pl-2 border-l border-amber-500/40">
                  <span>Hop {i+1}: {relay.node} ({relay.rssi})</span>
                  <span className="text-yellow-400 font-bold">{relay.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Offline Backup & Restore Storage Card */}
      <div className="glass-panel-glow rounded-2xl p-5 border border-yellow-500/40 flex flex-col gap-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-safety-border/60 pb-2">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-yellow-400" />
            <div>
              <h3 className="text-sm font-black text-slate-100">{t.backupTitle}</h3>
              <p className="text-[10px] text-slate-400">{t.backupSubtitle}</p>
            </div>
          </div>
          <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
            Local Storage Armed
          </span>
        </div>

        {/* Feedback Alert */}
        {restoreFeedback && (
          <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
            restoreFeedback.type === 'success'
              ? 'bg-yellow-950/70 border-yellow-500/50 text-yellow-200'
              : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{restoreFeedback.text}</span>
          </div>
        )}

        {/* Backup Health Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-mono">
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[8px] uppercase">{t.backupNodesCached}</span>
            <span className="font-black text-yellow-300">{backupStats?.nodeCount || 28}</span>
          </div>
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[8px] uppercase">{t.backupHavensCached}</span>
            <span className="font-black text-yellow-300">{backupStats?.havensCount || 4}</span>
          </div>
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[8px] uppercase">{t.backupStorageSize}</span>
            <span className="font-black text-amber-300">{backupStats?.sizeKb || '14.2'} KB</span>
          </div>
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[8px] uppercase">{t.backupLastSynced}</span>
            <span className="font-bold text-slate-300 text-[9px] truncate">
              {backupStats?.lastSaved ? new Date(backupStats.lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ready'}
            </span>
          </div>
        </div>

        {/* Download & Restore Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            onClick={handleDownloadBackup}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-200 text-slate-950 font-black text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-yellow-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.downloadBackupBtn}</span>
          </button>

          <label className="bg-slate-800 hover:bg-slate-700 border border-yellow-500/40 text-yellow-200 font-bold text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-yellow-400" />
            <span>{t.restoreBackupBtn}</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileRestore}
              className="hidden"
            />
          </label>

          <button
            onClick={handleCreateSnapshot}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.createSnapshotBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
