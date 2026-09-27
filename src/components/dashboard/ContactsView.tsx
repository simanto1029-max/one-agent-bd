import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, Smartphone, Facebook, Calendar, MessageSquare } from 'lucide-react';
import { api } from '../../api';
import { Contact } from '../../types';

export const ContactsView: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'whatsapp' | 'messenger'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await api.getContacts();
      setContacts(data);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = contacts.filter((c) => {
    if (platformFilter !== 'all' && c.platform !== platformFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        (c.customerName && c.customerName.toLowerCase().includes(q)) ||
        (c.customerId && c.customerId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            Customer Leads Directory
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            All customer leads captured automatically via WhatsApp and Messenger conversations.
          </p>
        </div>

        <button
          onClick={loadContacts}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search leads by name or phone/PSID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setPlatformFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              platformFilter === 'all'
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            All Leads ({contacts.length})
          </button>
          <button
            onClick={() => setPlatformFilter('whatsapp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              platformFilter === 'whatsapp'
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            WhatsApp
          </button>
          <button
            onClick={() => setPlatformFilter('messenger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              platformFilter === 'messenger'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <Facebook className="w-3 h-3" />
            Messenger
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Customer Lead</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Identifier / Phone / PSID</th>
                <th className="py-3 px-4">Total Messages</th>
                <th className="py-3 px-4">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">
                    No customer contacts found. Inbound messages automatically log new contacts.
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => (
                  <tr
                    key={`${c.platform}_${c.customerId}_${idx}`}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                      {c.customerName || 'Anonymous Customer'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          c.platform === 'whatsapp'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {c.platform === 'whatsapp' ? <Smartphone className="w-3 h-3" /> : <Facebook className="w-3 h-3" />}
                        {c.platform === 'whatsapp' ? 'WhatsApp' : 'Messenger'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-600 dark:text-neutral-400">
                      {c.customerId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300">
                        <MessageSquare className="w-3 h-3 text-neutral-400" />
                        {c.totalMessages}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {c.lastContactDate
                          ? new Date(c.lastContactDate).toLocaleString([], {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })
                          : 'Recent'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
