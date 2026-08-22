import React, { useState } from 'react';
import { Shield, MapPin, Bell, Users, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OneTimeSetup({ contacts, onAddContact, onDeleteContact, onSetupSave }) {
  const [backgroundLocation, setBackgroundLocation] = useState(false);
  const [notifications, setNotifications] = useState(false);
  
  // Simulated setup confirmation
  const [name, setName] = useState('Aarav Community Member');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = () => {
    if (!backgroundLocation || !notifications) {
      setErrorMsg('Please grant background location and notification permissions to enable Guardian Mode.');
      return;
    }
    if (contacts.length === 0) {
      setErrorMsg('Please configure at least one emergency contact to dispatch alerts to.');
      return;
    }
    setErrorMsg('');
    onSetupSave();
  };

  const handleSimulateAdd = (e) => {
    e.preventDefault();
    if (!name || !phone) return;
    onAddContact({ name, phone });
    setName('');
    setPhone('');
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-safety-border max-w-lg mx-auto flex flex-col gap-5">
      <div className="flex items-center gap-3 pb-3 border-b border-safety-border/40">
        <div className="bg-violet-950/80 p-2 border border-violet-500/35 rounded-xl text-violet-400">
          <Shield className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-100 text-lg">Autonomous Guardian Setup</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">One-Time Configuration Wizard</p>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        Enable background tracking, device notification warnings, and configure emergency contacts. Once synced, Guardian Mode monitors safety continuously in the background without needing the app open.
      </p>

      {/* Permission Toggles */}
      <div className="flex flex-col gap-3.5 bg-safety-dark/30 p-4 rounded-xl border border-safety-border/60">
        <h4 className="text-[10px] uppercase font-bold text-violet-300 tracking-wider">Device Permissions</h4>
        
        {/* Location Toggle */}
        <label className="flex items-center justify-between cursor-pointer select-none text-xs">
          <div className="flex gap-2.5 items-start">
            <MapPin className={`w-5 h-5 shrink-0 mt-0.5 ${backgroundLocation ? 'text-safety-emerald' : 'text-slate-500'}`} />
            <div>
              <p className="font-bold text-slate-200">Background Location Access</p>
              <p className="text-[9px] text-slate-400">Allows Kavach AI to track vectors when app is closed.</p>
            </div>
          </div>
          <input 
            type="checkbox"
            checked={backgroundLocation}
            onChange={(e) => setBackgroundLocation(e.target.checked)}
            className="w-5 h-5 rounded text-safety-emerald border-safety-border focus:ring-0 cursor-pointer"
          />
        </label>

        {/* Notification Toggle */}
        <label className="flex items-center justify-between cursor-pointer select-none text-xs border-t border-safety-border/25 pt-3">
          <div className="flex gap-2.5 items-start">
            <Bell className={`w-5 h-5 shrink-0 mt-0.5 ${notifications ? 'text-safety-emerald' : 'text-slate-500'}`} />
            <div>
              <p className="font-bold text-slate-200">Danger Alerts & Push Sounds</p>
              <p className="text-[9px] text-slate-400">Trigger full-screen banners and sound alarms near hotspots.</p>
            </div>
          </div>
          <input 
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="w-5 h-5 rounded text-safety-emerald border-safety-border focus:ring-0 cursor-pointer"
          />
        </label>
      </div>

      {/* Quick Contacts Integration */}
      <div className="flex flex-col gap-3 bg-safety-dark/30 p-4 rounded-xl border border-safety-border/60">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-violet-400" />
          <h4 className="text-[10px] uppercase font-bold text-violet-300 tracking-wider">Emergency Safety Contacts</h4>
        </div>

        {/* Contacts Add Form */}
        <form onSubmit={handleSimulateAdd} className="flex flex-col sm:flex-row gap-2 mt-1">
          <input 
            type="text"
            placeholder="Guardian Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-900 border border-safety-border text-xs rounded-lg py-2 px-3 focus:outline-none focus:border-safety-accent text-slate-100 flex-1"
          />
          <input 
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-slate-900 border border-safety-border text-xs rounded-lg py-2 px-3 focus:outline-none focus:border-safety-accent text-slate-100 flex-1"
          />
          <button 
            type="submit"
            className="bg-slate-800 hover:bg-violet-700 text-violet-300 hover:text-white text-xs font-bold py-2 px-4 rounded-lg transition border border-safety-border"
          >
            Add
          </button>
        </form>

        {/* Contacts list */}
        {contacts.length === 0 ? (
          <p className="text-[10px] text-slate-500 italic mt-1">No emergency contacts configured yet.</p>
        ) : (
          <div className="flex flex-col gap-1.5 mt-1 max-h-24 overflow-y-auto pr-1">
            {contacts.map((contact) => (
              <div key={contact._id || contact.id} className="bg-slate-950/60 border border-safety-border/30 rounded-lg py-1.5 px-3 flex justify-between items-center text-[11px]">
                <div>
                  <span className="font-semibold text-slate-200">{contact.name}</span>
                  <span className="text-slate-500 ml-2">({contact.phone})</span>
                </div>
                <button 
                  onClick={() => onDeleteContact(contact._id || contact.id)}
                  className="text-safety-rose font-bold text-[9px] hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="bg-rose-950/40 border border-rose-500/40 text-rose-300 p-3 rounded-xl flex gap-2 items-center text-xs">
          <AlertCircle className="w-4 h-4 text-safety-rose shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Confirm Button */}
      <button
        onClick={handleSave}
        className="w-full bg-safety-emerald hover:bg-yellow-600 text-slate-950 font-black text-xs py-3.5 rounded-xl transition shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-1.5"
      >
        <CheckCircle2 className="w-4 h-4" /> ACTIVATE AUTONOMOUS GUARDIAN MODE
      </button>
    </div>
  );
}
