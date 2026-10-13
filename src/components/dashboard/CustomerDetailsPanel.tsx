import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  User,
  Phone,
  Tag,
  FileText,
  Clock,
  X,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
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
  const [copied, setCopied] = useState(false);
  const [tags, setTags] = useState<string[]>(['Priority', 'Top Client']);
  const [newTagInput, setNewTagInput] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const [notes, setNotes] = useState<string>(
    'Interested in premium catalog items. Fast delivery requested in Dhaka.'
  );
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState(notes);

  if (!conversation) {
    return (
      <aside className="w-80 shrink-0 border-l border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#0E0922] p-6 flex flex-col items-center justify-center text-center text-neutral-400">
        <User className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-xs font-semibold">Select a conversation to view details</p>
      </aside>
    );
  }

  // Extract phone if available
  const msgCombined = conversation.messages.map((m) => m.message_text || '').join(' ');
  const extractedPhone =
    msgCombined.match(/(?:\+?88)?(01[3-9]\d{8})/)?.[1] ||
    (/^01[3-9]\d{8}$/.test(conversation.customerId) ? conversation.customerId : null);

  const handleCopyPhone = () => {
    const textToCopy = extractedPhone || conversation.customerId;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    setNotes(tempNotes);
    setIsEditingNotes(false);
  };

  // Shared media from conversation
  const sharedImages = conversation.messages
    .filter((m) => m.image_url || m.image_base64)
    .map((m) => m.image_url || `data:image/jpeg;base64,${m.image_base64}`);

  return (
    <aside className="w-full md:w-80 lg:w-[320px] shrink-0 h-full min-h-0 flex flex-col border-l border-neutral-200/80 dark:border-neutral-800/90 bg-white dark:bg-[#0E0922] text-neutral-900 dark:text-neutral-100 overflow-y-auto select-none">
      {/* 1. Clean Header */}
      <div className="px-4 py-3 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between shrink-0 bg-white dark:bg-[#0E0922]">
        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Customer Details
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            title="Close details"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* 2. Customer Profile Card */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950/70 text-[#7F22FE] dark:text-purple-300 font-extrabold flex items-center justify-center text-sm">
              {conversation.customerName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                {conversation.customerName}
              </h4>
              <p className="text-[11px] text-neutral-500 capitalize">
                Via {conversation.platform}
              </p>
            </div>
          </div>

          {/* Quick Phone / ID Copy */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800 text-xs">
            <span className="text-neutral-500 text-[11px]">Phone / ID:</span>
            <button
              type="button"
              onClick={handleCopyPhone}
              className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-neutral-800 dark:text-neutral-200 hover:text-[#7F22FE] transition-colors cursor-pointer"
            >
              <span>{extractedPhone || conversation.customerId}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-neutral-400" />}
            </button>
          </div>
        </div>

        {/* 3. Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('orders')}
            className="py-2 px-3 rounded-xl bg-gradient-to-r from-[#7F22FE] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Order</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('orders')}
            className="py-2 px-3 rounded-xl border border-neutral-200/90 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-neutral-500" />
            <span>Orders</span>
          </button>
        </div>

        {/* 4. Tags Card */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-neutral-200">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#7F22FE]" />
              Tags
            </span>
            <button
              type="button"
              onClick={() => setShowAddTag(!showAddTag)}
              className="text-[11px] font-bold text-[#7F22FE] dark:text-purple-300 hover:underline cursor-pointer"
            >
              + Add
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-violet-100 dark:bg-violet-950/70 text-[#7F22FE] dark:text-purple-300 text-[10px] font-bold border border-violet-200/60 dark:border-violet-800/60"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {showAddTag && (
            <div className="flex gap-1.5 pt-2">
              <input
                type="text"
                placeholder="Tag name..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1 text-xs px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-2.5 py-1 rounded-lg bg-[#7F22FE] text-white text-xs font-bold cursor-pointer"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* 5. Notes Card */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-neutral-200">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#7F22FE]" />
              Notes
            </span>
            {!isEditingNotes && (
              <button
                type="button"
                onClick={() => {
                  setTempNotes(notes);
                  setIsEditingNotes(true);
                }}
                className="text-[11px] font-bold text-[#7F22FE] dark:text-purple-300 hover:underline cursor-pointer"
              >
                Edit
              </button>
            )}
          </div>

          {isEditingNotes ? (
            <div className="space-y-2 pt-1">
              <textarea
                rows={3}
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#7F22FE]"
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
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pt-1">
              {notes}
            </p>
          )}
        </div>

        {/* 6. Shared Media (Only when customer sent pictures) */}
        {sharedImages.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-neutral-200">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#7F22FE]" />
                Shared Media ({sharedImages.length})
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {sharedImages.slice(0, 3).map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt={`Shared media ${idx + 1}`}
                  className="w-full h-16 object-cover rounded-xl border border-neutral-200 dark:border-neutral-700"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
