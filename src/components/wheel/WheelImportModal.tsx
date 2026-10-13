'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileText, Check, X, AlertCircle, Copy, Sparkles, Plus } from 'lucide-react';
import { WheelItem } from './WheelCanvas';

interface WheelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newItems: WheelItem[], mode: 'replace' | 'append') => void;
}

const PRESET_TEMPLATES: Record<string, string[]> = {
  'Classroom Students': [
    'Emma Johnson', 'Liam Smith', 'Olivia Brown', 'Noah Davis', 'Sophia Wilson',
    'Lucas Taylor', 'Ava Anderson', 'Mason Thomas', 'Isabella Martinez', 'Ethan White',
    'Mia Harris', 'James Clark', 'Harper Lewis', 'Alexander Robinson', 'Evelyn Walker'
  ],
  'Office Team': [
    'Sarah (Dev)', 'Alex (Design)', 'David (PM)', 'Priya (QA)', 'Marcus (Frontend)',
    'Elena (Backend)', 'Jordan (Marketing)', 'Chen (Sales)', 'Rachel (Ops)', 'Taylor (Lead)'
  ],
  'Lucky Numbers (1 - 20)': Array.from({ length: 20 }, (_, i) => `Ticket #${i + 1}`),
  'Prizes & Giveaways': [
    '$100 Grand Prize', '$50 Gift Card', 'Bluetooth Earbuds', 'Coffee Mug',
    'Bopzi T-Shirt', 'Movie Tickets', '500 Bonus Points', 'Mystery Surprise Box'
  ],
  'Quick Decision Maker': [
    'Definitely Yes', 'Absolutely No', 'Ask Again Later', 'Roll Again',
    'Do It Right Now', 'Sleep On It', '100% Go For It', 'Grab Coffee First'
  ],
};

export function WheelImportModal({ isOpen, onClose, onImport }: WheelImportModalProps) {
  const [activeTab, setActiveTab] = useState<'paste' | 'file' | 'presets'>('paste');
  const [pastedText, setPastedText] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectedCount, setDetectedCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Process raw text into clean array of names
  const parseNamesFromText = (raw: string): string[] => {
    let list = raw
      .split(/[\r\n,;]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (removeDuplicates) {
      list = Array.from(new Set(list));
    }
    return list;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPastedText(val);
    const parsed = parseNamesFromText(val);
    setDetectedCount(parsed.length);
    setErrorMsg(null);
  };

  // Process Excel / CSV files
  const processFile = async (file: File) => {
    setErrorMsg(null);
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'csv' || extension === 'txt' || extension === 'tsv') {
        const text = await file.text();
        const names = parseNamesFromText(text);
        if (names.length === 0) {
          setErrorMsg('No valid names found in file. Please ensure entries are separated by new lines or commas.');
          return;
        }
        setPastedText(names.join('\n'));
        setDetectedCount(names.length);
        setActiveTab('paste');
      } else if (extension === 'xlsx' || extension === 'xls') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        
        // Convert to 2D array of rows
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const extracted: string[] = [];

        // Check each row and take the first non-empty string column
        for (const row of rows) {
          if (!row || !Array.isArray(row)) continue;
          for (const cell of row) {
            if (cell !== undefined && cell !== null) {
              const str = String(cell).trim();
              // Ignore common header names like 'name', 'names', 'participants' if first row
              if (str.length > 0) {
                extracted.push(str);
                break; // Take the primary column
              }
            }
          }
        }

        // Filter out header if row 0 has 'name' or 'student'
        if (extracted.length > 0 && /^(name|participant|player|student|person|entry|names)$/i.test(extracted[0])) {
          extracted.shift();
        }

        let finalNames = extracted.filter((n) => n.length > 0);
        if (removeDuplicates) {
          finalNames = Array.from(new Set(finalNames));
        }

        if (finalNames.length === 0) {
          setErrorMsg('No participant names found in the Excel spreadsheet.');
          return;
        }

        setPastedText(finalNames.join('\n'));
        setDetectedCount(finalNames.length);
        setActiveTab('paste');
      } else {
        setErrorMsg('Unsupported file format. Please upload an Excel (.xlsx, .xls) or CSV/TXT file.');
      }
    } catch (err: any) {
      setErrorMsg(`Error reading file: ${err.message || 'Corrupted file'}`);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleLoadPreset = (names: string[]) => {
    setPastedText(names.join('\n'));
    setDetectedCount(names.length);
    setActiveTab('paste');
  };

  const handleApply = () => {
    const parsed = parseNamesFromText(pastedText);
    if (parsed.length === 0) {
      setErrorMsg('Please enter or import at least 1 name.');
      return;
    }

    const items: WheelItem[] = parsed.map((name, index) => ({
      id: `wheel-item-${Date.now()}-${index}`,
      name,
      active: true,
      weight: 1,
    }));

    onImport(items, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center shadow-md">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Import Participants</h3>
              <p className="text-xs text-slate-550">Excel, CSV, bulk paste or pre-made presets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 flex space-x-2 border-b border-slate-100 bg-white">
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'paste'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste / Edit Names</span>
            {detectedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-700 font-bold">
                {detectedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'file'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Excel / CSV File</span>
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'presets'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Presets</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-550">
                <span>Enter one name per line, or separate with commas:</span>
                <span className="font-semibold text-purple-600">{detectedCount} names detected</span>
              </div>
              <textarea
                value={pastedText}
                onChange={handleTextChange}
                placeholder="Emma Johnson&#10;Liam Smith&#10;Olivia Brown&#10;Noah Davis..."
                rows={9}
                className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent font-sans resize-none bg-slate-50/50"
              />
            </div>
          )}

          {activeTab === 'file' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-[#7C3AED] bg-purple-50/60 scale-[1.01]'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-purple-50/30 hover:border-purple-300'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center mb-3 shadow-inner">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  Click to browse or drag & drop spreadsheet
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Supports Excel (.xlsx, .xls) and CSV / TXT files
                </p>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600 shadow-sm">
                  <span>Select from Computer</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.txt,.tsv"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-100 text-[11px] text-blue-700 leading-relaxed">
                <strong>Tip:</strong> If your Excel sheet has columns like "Name" or "Student", Bopzi will automatically detect the name list and skip headers!
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-500 mb-2">Pick a ready-made template to load immediately:</p>
              {Object.entries(PRESET_TEMPLATES).map(([title, list]) => (
                <div
                  key={title}
                  onClick={() => handleLoadPreset(list)}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#7C3AED] transition-colors">
                      {title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5">
                      {list.slice(0, 4).join(', ')}... ({list.length} total)
                    </p>
                  </div>
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 group-hover:bg-purple-600 group-hover:text-white px-3 py-1.5 rounded-full transition-all flex items-center space-x-1">
                    <span>Load</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Import Settings & Actions */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer text-slate-600 select-none">
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="rounded text-[#7C3AED] focus:ring-purple-400"
              />
              <span>Remove duplicate names</span>
            </label>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Mode:</span>
              <button
                type="button"
                onClick={() => setImportMode('replace')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  importMode === 'replace'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Replace List
              </button>
              <button
                type="button"
                onClick={() => setImportMode('append')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  importMode === 'append'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Add to List
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Apply {detectedCount > 0 ? `(${detectedCount} Names)` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
