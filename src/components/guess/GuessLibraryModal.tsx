'use client';

import React, { useState } from 'react';
import { GUESS_LIBRARIES, LibraryPack } from '@/lib/guess-library';
import { GuessItem } from '@/types/guess';
import { Search, X, Check, Sparkles, FolderPlus, Plus } from 'lucide-react';

interface GuessLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (items: GuessItem[]) => void;
}

export function GuessLibraryModal({ isOpen, onClose, onAddItems }: GuessLibraryModalProps) {
  const [selectedPackId, setSelectedPackId] = useState<string>('tech-giants');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});

  if (!isOpen) return null;

  const currentPack = GUESS_LIBRARIES.find((p) => p.id === selectedPackId) || GUESS_LIBRARIES[0];

  // Filter items by search query across current pack or all packs if searching
  const filteredItems = searchQuery.trim()
    ? GUESS_LIBRARIES.flatMap((pack) =>
        pack.items
          .filter(
            (item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (item.hint && item.hint.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .map((item, idx) => ({ ...item, uniqueKey: `${pack.id}-${item.name}-${idx}` }))
      )
    : currentPack.items.map((item, idx) => ({
        ...item,
        uniqueKey: `${currentPack.id}-${item.name}-${idx}`,
      }));

  const toggleSelect = (key: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const selectAllVisible = () => {
    const next: { [key: string]: boolean } = { ...selectedItems };
    filteredItems.forEach((item) => {
      next[item.uniqueKey] = true;
    });
    setSelectedItems(next);
  };

  const deselectAllVisible = () => {
    const next: { [key: string]: boolean } = { ...selectedItems };
    filteredItems.forEach((item) => {
      delete next[item.uniqueKey];
    });
    setSelectedItems(next);
  };

  const handleAddSelected = () => {
    const toAdd: GuessItem[] = filteredItems
      .filter((item) => selectedItems[item.uniqueKey])
      .map((item) => ({
        id: `lib-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: item.name,
        imageUrl: item.imageUrl,
        hint: item.hint,
        category: item.category,
        revealed: false,
      }));

    if (toAdd.length > 0) {
      onAddItems(toAdd);
      setSelectedItems({});
      onClose();
    }
  };

  const handleAddSingleDirect = (item: (typeof filteredItems)[0]) => {
    onAddItems([
      {
        id: `lib-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: item.name,
        imageUrl: item.imageUrl,
        hint: item.hint,
        category: item.category,
        revealed: false,
      },
    ]);
  };

  const countSelected = Object.values(selectedItems).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900/95 border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl">
              🎨
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading">Logo & Picture Library</h2>
              <p className="text-xs text-slate-400">
                Browse pre-curated high-res brand logos and landmark pictures or search anything
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 border-b border-white/10 bg-slate-950/40 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logos or pictures (e.g. Apple, Nike, Ferrari, Paris)..."
              className="w-full bg-slate-800/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick select helpers */}
          <div className="flex items-center gap-2">
            <button
              onClick={selectAllVisible}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 text-slate-200 transition"
            >
              Select All
            </button>
            <button
              onClick={deselectAllVisible}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Category Tabs (shown when not searching) */}
        {!searchQuery.trim() && (
          <div className="px-6 py-2.5 bg-slate-900/60 border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {GUESS_LIBRARIES.map((pack) => {
              const active = pack.id === selectedPackId;
              return (
                <button
                  key={pack.id}
                  onClick={() => setSelectedPackId(pack.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>{pack.icon}</span>
                  <span>{pack.name}</span>
                  <span className="opacity-60 text-[10px]">({pack.items.length})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Grid of Items */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[50vh]">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-white">No logos or pictures found</p>
              <p className="text-xs mt-1">Try another keyword or select a different category above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const isSelected = !!selectedItems[item.uniqueKey];
                return (
                  <div
                    key={item.uniqueKey}
                    onClick={() => toggleSelect(item.uniqueKey)}
                    className={`group relative rounded-2xl border p-3 flex flex-col items-center text-center cursor-pointer transition-all duration-200 select-none ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-500/15 ring-2 ring-indigo-400/50 scale-[1.02]'
                        : 'border-white/10 bg-slate-800/40 hover:border-white/30 hover:bg-slate-800/70'
                    }`}
                  >
                    {/* Checkbox badge */}
                    <div
                      className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center border transition ${
                        isSelected
                          ? 'bg-indigo-500 border-indigo-400 text-white'
                          : 'border-white/30 bg-black/40 text-transparent group-hover:border-white/60'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>

                    {/* Logo/Pic Container */}
                    <div className="w-full h-28 rounded-xl bg-white/95 flex items-center justify-center p-3 mb-3 overflow-hidden shadow-inner">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>

                    {/* Meta info */}
                    <h4 className="font-bold text-sm text-white line-clamp-1">{item.name}</h4>
                    {item.hint && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5" title={item.hint}>
                        💡 {item.hint}
                      </p>
                    )}

                    {/* Quick add single */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSingleDirect(item);
                      }}
                      className="mt-2.5 w-full py-1 px-2 rounded-lg text-[11px] font-semibold bg-white/10 hover:bg-indigo-600 text-slate-200 hover:text-white transition flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100"
                    >
                      <Plus className="w-3 h-3" /> Quick Add
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/70 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {countSelected > 0 ? (
              <span className="text-indigo-300 font-semibold">{countSelected} item(s) selected</span>
            ) : (
              <span>Select pictures or logos to add to your game</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSelected}
              disabled={countSelected === 0}
              className={`px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
                countSelected > 0
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              <FolderPlus className="w-4 h-4" />
              Add Selected ({countSelected})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
