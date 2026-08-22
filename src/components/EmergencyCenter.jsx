import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Plus, Trash2, Phone, Mail, AlertOctagon, Heart, Send } from 'lucide-react';

export default function EmergencyCenter({ 
  contacts, 
  onAddContact, 
  onDeleteContact, 
  userLocation, 
  triggerPanicSOS 
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relation, setRelation] = useState('');
  
  // Panic Mode state
  const [panicActive, setPanicActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [panicTimer, setPanicTimer] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || !relation) return;
    onAddContact({ name, phone, email, relation });
    setName('');
    setPhone('');
    setEmail('');
    setRelation('');
    setShowAddForm(false);
  };

  // Handles starting the countdown for the Panic Button
  const handlePanicClick = () => {
    if (panicActive) {
      // Cancel active SOS
      setPanicActive(false);
      if (panicTimer) clearInterval(panicTimer);
      setCountdown(3);
      return;
    }

    setPanicActive(true);
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Trigger actual SOS broadcast
          triggerPanicSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setPanicTimer(timer);
  };

  useEffect(() => {
    return () => {
      if (panicTimer) clearInterval(panicTimer);
    };
  }, [panicTimer]);

  const activePanicSosTriggered = countdown === 0 && panicActive;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-safety-border">
      {/* Panic Section */}
      <div className="text-center pb-5 border-b border-safety-border flex flex-col items-center">
        <h3 className="font-bold text-slate-100 mb-2 flex items-center gap-1.5 text-sm uppercase tracking-wider text-safety-rose">
          <ShieldAlert className="w-5 h-5 text-safety-rose animate-pulse" /> Emergency Hub
        </h3>
        <p className="text-xs text-slate-400 max-w-xs mb-4">
          Pressing the SOS button instantly sends alert coordinates to all active contacts.
        </p>

        {/* SOS Button */}
        <button
          onClick={handlePanicClick}
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 shadow-2xl transition-all duration-300 relative overflow-hidden ${
            activePanicSosTriggered
              ? 'bg-safety-rose border-rose-400 animate-ping-slow text-white'
              : panicActive
                ? 'bg-safety-amber border-amber-300 text-slate-900 animate-pulse'
                : 'bg-rose-950/70 border-safety-rose hover:bg-rose-900 text-rose-200 hover:scale-105'
          }`}
        >
          {activePanicSosTriggered ? (
            <div className="flex flex-col items-center">
              <AlertOctagon className="w-10 h-10 animate-bounce" />
              <span className="text-sm font-extrabold uppercase mt-1 tracking-widest">SOS ACTIVE</span>
            </div>
          ) : panicActive ? (
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black">{countdown}</span>
              <span className="text-[10px] font-bold uppercase mt-1 tracking-wide">Click to Cancel</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ShieldAlert className="w-10 h-10" />
              <span className="text-base font-black uppercase mt-1 tracking-wider">PANIC BUTTON</span>
            </div>
          )}
        </button>

        {activePanicSosTriggered && (
          <div className="mt-4 bg-safety-rose/10 border border-safety-rose/30 py-2 px-4 rounded-xl text-xs text-rose-200 animate-pulse">
            🚨 Broad-range SOS beacon broadcasted! Emergency services and contacts notified.
          </div>
        )}
      </div>

      {/* Contacts List Section */}
      <div className="pt-5">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-safety-accent" /> Safety Network
          </h4>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-semibold bg-safety-border hover:bg-slate-700 text-slate-200 p-1.5 rounded-lg flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {/* Collapsible Add Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="bg-safety-dark/60 border border-safety-border rounded-xl p-3 mb-3 flex flex-col gap-2.5">
            <input
              type="text"
              placeholder="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-safety-card text-xs text-slate-100 border border-safety-border focus:border-safety-accent rounded-lg p-2 outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="tel"
                placeholder="Phone No."
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-safety-card text-xs text-slate-100 border border-safety-border focus:border-safety-accent rounded-lg p-2 outline-none"
              />
              <input
                type="text"
                placeholder="Relation (e.g. Sister)"
                required
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="bg-safety-card text-xs text-slate-100 border border-safety-border focus:border-safety-accent rounded-lg p-2 outline-none"
              />
            </div>
            <input
              type="email"
              placeholder="Email (Optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-safety-card text-xs text-slate-100 border border-safety-border focus:border-safety-accent rounded-lg p-2 outline-none"
            />
            <div className="flex gap-2 justify-end mt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-transparent hover:bg-safety-border text-slate-400 text-xs px-2.5 py-1.5 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-safety-accent hover:bg-violet-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
              >
                <Send className="w-3 h-3" /> Save
              </button>
            </div>
          </form>
        )}

        {/* Contacts render list */}
        {contacts.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic text-center py-4 bg-safety-dark/30 rounded-xl border border-dashed border-safety-border">
            No contacts saved yet. Add key family members or colleagues.
          </p>
        ) : (
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {contacts.map((contact) => (
              <div 
                key={contact._id} 
                className="bg-safety-card/60 hover:bg-safety-card border border-safety-border rounded-xl p-3 flex justify-between items-center transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-safety-accent/20 text-safety-accent flex items-center justify-center">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-200">{contact.name}</h5>
                    <div className="flex gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" /> {contact.phone}</span>
                      <span>•</span>
                      <span className="font-medium text-safety-accent">{contact.relation}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteContact(contact._id)}
                  className="text-slate-500 hover:text-safety-rose p-1 rounded transition"
                  title="Delete Contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
