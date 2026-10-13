import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  User,
  Phone,
  MapPin,
  Tag,
  FileText,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Sparkles,
  Bot,
  Truck,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Conversation } from '../../types';

interface CustomerDetailsPanelProps {
  conversation: Conversation | null;
  onNavigate?: (tab: string) => void;
  onClose?: () => void;
}

export const CustomerDetailsPanel: React.FC<CustomerDetailsPanelProps> = ({
  conversation,
  onNavigate,
  onClose
}) => {
  // Collapsible accordion sections
  const [openSection, setOpenSection] = useState<{
    contact: boolean;
    tags: boolean;
    notes: boolean;
    summary: boolean;
    activity: boolean;
    files: boolean;
  }>({
    contact: true,
    tags: true,
    notes: true,
    summary: false,
    activity: true,
    files: false
  });

  // Local state for tags & notes per conversation
  const [tags, setTags] = useState<string[]>(['Priority', 'Top Client', 'High Prospect']);
  const [newTagInput, setNewTagInput] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const [customerNotes, setCustomerNotes] = useState<string>(
    'Customer interested in premium fashion items. Fast delivery requested inside Dhaka.'
  );
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState(customerNotes);

  if (!conversation) {
    return (
      <aside className="w-80 shrink-0 border-l border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#0E0922] p-6 flex flex-col items-center justify-center text-center text-neutral-400">
        <User className="w-10 h-10 mb-2 opacity-40" />
        <p className="text-xs font-semibold">Select a conversation to view customer details</p>
      </aside>
    );
  }

  const toggleSection = (key: keyof typeof openSection) => {
    setOpenSection((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput('');
      setShowAddTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSaveNotes = () => {
    setCustomerNotes(tempNotes);
    setIsEditingNotes(false);
  };

  // Extract phone or address if available in messages
  const msgCombined = conversation.messages.map((m) => m.message_text || '').join(' ');
  const extractedPhone =
    msgCombined.match(/(?:\+?88)?(01[3-9]\d{8})/)?.[1] ||
    (/^01[3-9]\d{8}$/.test(conversation.customerId) ? conversation.customerId : null);

  return (
    <aside className="w-full md:w-80 lg:w-[330px] shrink-0 h-full min-h-0 flex flex-col border-l border-neutral-200/80 dark:border-neutral-800/90 bg-white dark:bg-[#0E0922] text-neutral-900 dark:text-neutral-100 overflow-y-auto scrollbar-thin select-none">
      {/* 1. Header with Close (Mobile) + Section Title */}
      <div className="p-3.5 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between shrink-0 bg-white dark:bg-[#0E0922]">
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-300 flex items-center gap-2">
          <span>Order Actions &amp; CRM</span>
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            title="Close customer details"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-3.5 space-y-4 flex-1">
        {/* 2. Top Action Buttons (Screenshot exact: Manage Orders + Create Orders) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('orders')}
            className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Manage Orders</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('orders')}
            className="py-2 px-3 rounded-xl bg-gradient-to-r from-[#7F22FE] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-xs font-bold transition-all shadow-sm shadow-[#7F22FE]/25 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Orders</span>
          </button>
        </div>

        {/* 3. Section: Contact Details */}
        <div className="border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden bg-neutral-50/60 dark:bg-neutral-900/40">
          <button
            type="button"
            onClick={() => toggleSection('contact')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-extrabold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#7F22FE]" />
              <span>Contact Details</span>
            </div>
            {openSection.contact ? (
              <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            )}
          </button>

          {openSection.contact && (
            <div className="px-3.5 pb-3 pt-1 text-xs space-y-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span className="text-[11px] font-medium">Customer Name:</span>
                <span className="font-bold text-neutral-900 dark:text-white truncate max-w-[150px]">
                  {conversation.customerName}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span className="text-[11px] font-medium">Phone / ID:</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white truncate max-w-[150px]">
                  {extractedPhone || conversation.customerId}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span className="text-[11px] font-medium">Platform:</span>
                <span className="font-bold capitalize text-[#7F22FE] dark:text-purple-300">
                  {conversation.platform}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span className="text-[11px] font-medium">Assigned Agent:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Bot className="w-3 h-3" />
                  One Agent AI
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Section: Tags */}
        <div className="border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden bg-neutral-50/60 dark:bg-neutral-900/40">
          <div className="px-3.5 py-2.5 flex items-center justify-between text-xs font-extrabold text-neutral-800 dark:text-neutral-200">
            <div
              onClick={() => toggleSection('tags')}
              className="flex items-center gap-2 cursor-pointer flex-1"
            >
              <Tag className="w-3.5 h-3.5 text-[#7F22FE]" />
              <span>Tags</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddTag(!showAddTag)}
                className="text-[11px] font-bold text-[#7F22FE] dark:text-purple-300 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add New</span>
              </button>
              <button
                type="button"
                onClick={() => toggleSection('tags')}
                className="text-neutral-400 cursor-pointer"
              >
                {openSection.tags ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {openSection.tags && (
            <div className="px-3.5 pb-3 pt-1 space-y-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-purple-100/80 dark:bg-purple-950/70 text-[#7F22FE] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {showAddTag && (
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Enter tag name..."
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-[#7F22FE] text-white cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. Section: Notes for the customer */}
        <div className="border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden bg-neutral-50/60 dark:bg-neutral-900/40">
          <button
            type="button"
            onClick={() => toggleSection('notes')}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-extrabold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-[#7F22FE]" />
              <span>Notes for the customer</span>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950/80 text-[#7F22FE] dark:text-purple-300 text-[9px] font-bold">
                69
              </span>
            </div>
            {openSection.notes ? (
              <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            )}
          </button>

          {openSection.notes && (
            <div className="px-3.5 pb-3 pt-1 text-xs space-y-2 border-t border-neutral-200/60 dark:border-neutral-800/60">
              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsEditingNotes(false)}
                      className="px-2 py-1 text-[11px] rounded-lg text-neutral-500 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#7F22FE] text-white cursor-pointer"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setTempNotes(customerNotes);
                    setIsEditingNotes(true);
                  }}
                  className="p-2.5 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 text-neutral-700 dark:text-neutral-300 leading-relaxed text-[11px] cursor-pointer hover:border-[#7F22FE]/40"
                  title="Click to edit notes"
                >
                  {customerNotes}
                  <span className="block text-[9px] text-[#7F22FE] font-bold mt-1">
                    ✎ Click to edit note
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 6. Section: Activity List (Screenshot exact stepper: Your details, Company details, Invite your team, Add your socials) */}
        <div className="border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden bg-neutral-50/60 dark:bg-neutral-900/40">
          <div className="px-3.5 py-2.5 flex items-center justify-between text-xs font-extrabold text-neutral-800 dark:text-neutral-200">
            <div
              onClick={() => toggleSection('activity')}
              className="flex items-center gap-2 cursor-pointer flex-1"
            >
              <Clock className="w-3.5 h-3.5 text-[#7F22FE]" />
              <span>Activity List</span>
            </div>
            <span className="text-[10px] font-bold text-[#7F22FE] dark:text-purple-300">See all</span>
          </div>

          {openSection.activity && (
            <div className="px-3.5 pb-3.5 pt-1 border-t border-neutral-200/60 dark:border-neutral-800/60">
              <div className="relative pl-5 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#7F22FE]/30">
                {/* Step 1 */}
                <div className="relative">
                  <span className="absolute -left-5 top-0.5 w-4 h-4 rounded-full bg-[#7F22FE] text-white flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-neutral-900 dark:text-white leading-tight">
                      Your details
                    </p>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      Please provide your name and email
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <span className="absolute -left-5 top-0.5 w-4 h-4 rounded-full bg-[#7F22FE] text-white flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-neutral-900 dark:text-white leading-tight">
                      Company details
                    </p>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      A few details about your company
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <span className="absolute -left-5 top-0.5 w-4 h-4 rounded-full bg-[#7F22FE] text-white flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-neutral-900 dark:text-white leading-tight">
                      Invite your team
                    </p>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      Start collaborating with your team
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <span className="absolute -left-5 top-0.5 w-4 h-4 rounded-full bg-[#7F22FE] ring-4 ring-[#7F22FE]/20 text-white flex items-center justify-center text-[8px]">
                    ●
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-neutral-900 dark:text-white leading-tight">
                      Add your socials
                    </p>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      Share posts to your social accounts
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 7. Section: Shared Files & Attachments */}
        <div className="border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden bg-neutral-50/60 dark:bg-neutral-900/40">
          <div className="px-3.5 py-2.5 flex items-center justify-between text-xs font-extrabold text-neutral-800 dark:text-neutral-200">
            <div
              onClick={() => toggleSection('files')}
              className="flex items-center gap-2 cursor-pointer flex-1"
            >
              <Layers className="w-3.5 h-3.5 text-[#7F22FE]" />
              <span>Shared Files</span>
            </div>
            <span className="text-[10px] font-bold text-[#7F22FE] dark:text-purple-300">See all</span>
          </div>

          {openSection.files && (
            <div className="px-3.5 pb-3 pt-1 border-t border-neutral-200/60 dark:border-neutral-800/60">
              <div className="grid grid-cols-3 gap-1.5">
                {conversation.messages
                  .filter((m) => m.has_image || m.image_url)
                  .slice(0, 3)
                  .map((m, idx) => (
                    <img
                      key={idx}
                      src={m.image_url || `data:image/jpeg;base64,${m.image_base64}`}
                      alt="Shared file"
                      className="w-full h-16 object-cover rounded-xl border border-neutral-200 dark:border-neutral-700"
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
