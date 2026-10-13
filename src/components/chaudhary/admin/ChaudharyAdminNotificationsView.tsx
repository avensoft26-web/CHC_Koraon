import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Search, 
  X, 
  CheckCheck, 
  Pin, 
  Trash2, 
  Clock, 
  Building2, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  Plus, 
  ChevronRight,
  Check,
  Copy,
  AlertTriangle
} from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { api } from '../../../services/api';
import { useAuthUser } from '../../../hooks/useAuthUser';

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  dateGroup: 'today' | 'yesterday' | 'earlier';
  timestamp: string;
  type: 'critical' | 'info' | 'memo' | 'emergency';
  audience: string;
  sender: string;
  isPinned?: boolean;
  isRead?: boolean;
}

// Module-level cache for instant tab transitions
let cachedNotificationsMemory: NotificationItem[] = [];

export const ChaudharyAdminNotificationsView: React.FC = () => {
  const user = useAuthUser();
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => cachedNotificationsMemory);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(() => cachedNotificationsMemory.length === 0);
  const [notifsError, setNotifsError] = useState<string | null>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      cachedNotificationsMemory = notifications;
    }
  }, [notifications]);

  // Load real-time hospital notifications from MongoDB
  useEffect(() => {
    let isMounted = true;
    api.notifications.getAll().then((res) => {
      if (!isMounted) return;
      const live = Array.isArray(res?.notifications) ? res.notifications : [];
      const liveItems: NotificationItem[] = live.map((n: any, idx: number) => {
        const dateObj = n.timestamp ? new Date(n.timestamp) : new Date();
        const isToday = new Date().toDateString() === dateObj.toDateString();
        const isCritical = n.type === 'warning' || n.category === 'security';
        const isClinical = n.category === 'admission' || n.category === 'discharge' || n.category === 'clinical';
        return {
          id: n.id || `notif-live-${idx}`,
          title: n.title || 'Hospital Event',
          desc: n.message || n.desc || '',
          time: isToday ? 'Today' : dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          dateGroup: isToday ? 'today' : 'earlier',
          timestamp: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: isCritical ? 'critical' : (isClinical ? 'info' : 'memo'),
          audience: 'All Clinical Staff & Administration',
          sender: n.category === 'discharge' ? 'Discharge Desk' : (n.category === 'admission' ? 'Admission Counter' : 'Hospital Core System'),
          isPinned: idx === 0,
          isRead: false,
        };
      });

      setNotifications(liveItems);
      setNotifsError(null);
    }).catch((err: any) => {
      if (isMounted) setNotifsError(err?.message || 'Unable to load notifications');
    }).finally(() => {
      if (isMounted) setIsLoadingNotifs(false);
    });

    return () => { isMounted = false; };
  }, []);

  // Filter & Search states
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'critical' | 'clinical' | 'memo'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NotificationItem | null>(null);
  const [copyDone, setCopyDone] = useState(false);

  // New broadcast form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAudience, setNewAudience] = useState('All Hospital Personnel');
  const [newType, setNewType] = useState<NotificationItem['type']>('info');

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeFilter === 'unread' && item.isRead) return false;
      if (activeFilter === 'critical' && item.type !== 'critical' && item.type !== 'emergency') return false;
      if (activeFilter === 'clinical' && item.type !== 'info') return false;
      if (activeFilter === 'memo' && item.type !== 'memo') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.desc.toLowerCase().includes(q);
        const matchSender = item.sender.toLowerCase().includes(q);
        const matchAudience = item.audience.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSender && !matchAudience) return false;
      }

      return true;
    });
  }, [notifications, activeFilter, searchQuery]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const today = filteredNotifications.filter((n) => n.dateGroup === 'today');
    const yesterday = filteredNotifications.filter((n) => n.dateGroup === 'yesterday');
    const earlier = filteredNotifications.filter((n) => n.dateGroup === 'earlier');
    return { today, yesterday, earlier };
  }, [filteredNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleToggleRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const handleTogglePin = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const item: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: newTitle.trim(),
      desc: newDesc.trim(),
      time: 'Just now',
      dateGroup: 'today',
      timestamp: 'Now',
      type: newType,
      audience: newAudience,
      sender: `${user.name}${user.department ? ` (${user.department})` : ''}`,
      isPinned: newType === 'critical',
      isRead: false,
    };

    setNotifications([item, ...notifications]);
    setIsBroadcastModalOpen(false);

    try {
      await api.notifications.send({
        title: newTitle.trim(),
        body: newDesc.trim(),
        targetRole: 'all'
      });
    } catch (err: any) {
      console.warn('Backend notification broadcast error:', err.message);
    }

    setNewTitle('');
    setNewDesc('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  };

  // Render a clean notification card row
  const renderItemRow = (item: NotificationItem) => {
    const isCritical = item.type === 'critical' || item.type === 'emergency';
    const isMemo = item.type === 'memo';

    return (
      <div
        key={item.id}
        onClick={() => {
          setSelectedItem(item);
          if (!item.isRead) handleToggleRead(item.id);
        }}
        className={`group relative flex items-start justify-between gap-4 p-4 sm:p-4.5 rounded-2xl border transition-all duration-150 cursor-pointer ${
          !item.isRead
            ? 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs'
            : 'bg-slate-50/60 border-slate-200/50 hover:bg-white hover:border-slate-200 hover:shadow-2xs'
        }`}
      >
        {/* Left: Unread Indicator + Icon + Content */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Subtle Status Indicator */}
          <div className="pt-1 shrink-0 flex items-center justify-center">
            {!item.isRead ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-transparent" />
            )}
          </div>

          {/* Minimalist Icon Badge */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105 ${
            isCritical
              ? 'bg-rose-50 border-rose-100 text-rose-600'
              : isMemo
                ? 'bg-amber-50 border-amber-100 text-amber-600'
                : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            {isCritical ? (
              <ShieldAlert className="w-4 h-4 stroke-[2]" />
            ) : isMemo ? (
              <Info className="w-4 h-4 stroke-[2]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 stroke-[2]" />
            )}
          </div>

          {/* Main Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {item.isPinned && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/70 px-1.5 py-0.2 rounded-md">
                  <Pin className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
                  Pinned
                </span>
              )}

              {isCritical && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/70 px-1.5 py-0.2 rounded-md">
                  Urgent Alert
                </span>
              )}

              <h4 className={`text-sm leading-snug tracking-tight transition-colors ${
                !item.isRead 
                  ? 'font-extrabold text-slate-900 group-hover:text-emerald-700' 
                  : 'font-semibold text-slate-700 group-hover:text-slate-900'
              }`}>
                {item.title}
              </h4>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 line-clamp-2 max-w-4xl">
              {item.desc}
            </p>

            {/* Subtle Metadata Pill Line */}
            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="font-semibold text-slate-500">{item.time}</span>
              </span>
              <span>•</span>
              <span className="truncate max-w-[200px] text-slate-500">
                {item.sender}
              </span>
              <span>•</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold text-[10.5px]">
                {item.audience}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Hover Actions + Chevron */}
        <div className="flex items-center gap-1 shrink-0 self-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1">
            <button
              onClick={(e) => handleTogglePin(item.id, e)}
              title={item.isPinned ? 'Unpin' : 'Pin to top'}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                item.isPinned
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-400'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => handleToggleRead(item.id, e)}
              title={item.isRead ? 'Mark as unread' : 'Mark as read'}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-all cursor-pointer"
            >
              <CheckCheck className={`w-3.5 h-3.5 ${item.isRead ? 'text-emerald-600' : 'text-slate-400'}`} />
            </button>

            <button
              onClick={(e) => handleDelete(item.id, e)}
              title="Delete"
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors ml-1" />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5 py-2 font-sans">
      {/* 1. MINIMAL EXECUTIVE HEADER (LINEAR / APPLE STYLE) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Notifications &amp; Directives
            </h2>
            {unreadCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold">
                {unreadCount} unread
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold">
                All caught up
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Official announcements, clinical updates, and staff advisories.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark all read</span>
            </button>
          )}

          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Directive</span>
          </button>
        </div>
      </div>

      {/* 2. MINIMAL SEARCH & FILTER CHIPS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Simple Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({notifications.length})
          </button>

          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'unread'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unread ({unreadCount})
          </button>

          <button
            onClick={() => setActiveFilter('critical')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'critical'
                ? 'bg-rose-600 text-white'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Urgent</span>
          </button>

          <button
            onClick={() => setActiveFilter('clinical')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'clinical'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Clinical
          </button>

          <button
            onClick={() => setActiveFilter('memo')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'memo'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Admin Memos
          </button>
        </div>

        {/* Minimal Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. GROUPED LIST SECTIONS: TODAY, YESTERDAY, EARLIER */}
      <div className="space-y-6 mt-1">
        {/* TODAY GROUP */}
        {groupedNotifications.today.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Today
              </span>
              <div className="flex-1 h-px bg-slate-200/60" />
            </div>

            <div className="space-y-2">
              {groupedNotifications.today.map(renderItemRow)}
            </div>
          </div>
        )}

        {/* YESTERDAY GROUP */}
        {groupedNotifications.yesterday.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1 pt-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Yesterday
              </span>
              <div className="flex-1 h-px bg-slate-200/60" />
            </div>

            <div className="space-y-2">
              {groupedNotifications.yesterday.map(renderItemRow)}
            </div>
          </div>
        )}

        {/* EARLIER GROUP */}
        {groupedNotifications.earlier.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1 pt-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Earlier This Week
              </span>
              <div className="flex-1 h-px bg-slate-200/60" />
            </div>

            <div className="space-y-2">
              {groupedNotifications.earlier.map(renderItemRow)}
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {isLoadingNotifs && filteredNotifications.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-slate-200/80 bg-white">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2.5 animate-pulse">
              <Bell className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Loading announcements...</h4>
            <p className="text-xs text-slate-400 mt-0.5">Fetching live notices from the database.</p>
          </div>
        )}

        {/* ERROR STATE */}
        {!isLoadingNotifs && notifsError && filteredNotifications.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-rose-200 bg-rose-50">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-400 mx-auto mb-2.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-rose-700">Unable to load announcements</h4>
            <p className="text-xs text-rose-500 mt-0.5">{notifsError}</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoadingNotifs && !notifsError && filteredNotifications.length === 0 && (
          <div className="p-12 text-center rounded-2xl border border-slate-200/80 bg-white">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2.5">
              <Bell className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No announcements yet</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              No live notices have been issued. Anything published will appear here.
            </p>
            <button
              onClick={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
              className="mt-3 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* 4. CLEAN DETAIL MODAL (WHEN AN ITEM IS CLICKED) */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.title}
          subtitle={`Dispatched by ${selectedItem.sender} • ${selectedItem.time}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 leading-relaxed text-slate-700 font-medium">
              {selectedItem.desc}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Audience</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{selectedItem.audience}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Department</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{selectedItem.sender}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleCopy(`${selectedItem.title}\n\n${selectedItem.desc}`)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {copyDone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copyDone ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 5. MINIMAL BROADCAST MODAL */}
      {isBroadcastModalOpen && (
        <Modal
          isOpen={isBroadcastModalOpen}
          onClose={() => setIsBroadcastModalOpen(false)}
          title="New Hospital Announcement"
          subtitle="Publish a notification to staff workstations"
          maxWidth="md"
        >
          <form onSubmit={handleSendBroadcast} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Headline *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="E.g. OT Schedule Shift & Sanitization Notice"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-slate-400 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Details *</label>
              <textarea
                required
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Write directive details..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none focus:bg-white focus:border-slate-400 font-medium text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={newAudience}
                  onChange={(e) => setNewAudience(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-800"
                >
                  <option>All Hospital Personnel</option>
                  <option>Clinical Staff &amp; Doctors</option>
                  <option>Nursing Stations (ICU &amp; Wards)</option>
                  <option>Front Desk &amp; Billing</option>
                  <option>OT Staff &amp; Surgeons</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-800"
                >
                  <option value="info">General Info</option>
                  <option value="memo">Admin Memo</option>
                  <option value="critical">Urgent Alert</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>Post Directive</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
