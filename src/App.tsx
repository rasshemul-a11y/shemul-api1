/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { useState, useEffect, FormEvent, useMemo } from "react";
import { LayoutDashboard, Package, GitBranch, ArrowUpRight, ArrowDownLeft, Plus, Search, Menu, X, BookOpen, Bell, User, Pencil, Eye, Power } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { api } from "./services/api";
import { InventoryItem, Branch, Transaction, Program } from "./types";
import { format } from "date-fns";

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Sidebar Component
function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const location = useLocation();
  
  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Inventory", path: "/inventory", icon: Package },
    { name: "Branches", path: "/branches", icon: GitBranch },
    { name: "Stock In/Out", path: "/transactions", icon: ArrowUpRight },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-[#141414] text-[#E4E3E0] transform transition-transform duration-200 ease-in-out z-50 lg:translate-x-0 lg:static lg:inset-0 overflow-y-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tighter italic font-serif leading-none">ARCANE ARCHIVES</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1">Inventory Management</p>
          </div>
          <button className="lg:hidden" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Profile Card Section */}
        <div className="px-4 mb-6">
          <div className="flex justify-end gap-3 mb-2 px-2">
            <div className="relative">
              <div className="p-2 bg-[#E4E3E0]/10 rounded-full text-[#E4E3E0]/70 hover:text-[#E4E3E0] cursor-pointer transition-colors">
                <Bell size={18} />
              </div>
              <span className="absolute -top-1 -right-1 bg-red-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-[#141414] leading-none">15</span>
            </div>
            <div className="p-2 bg-[#E4E3E0]/10 rounded-full text-[#E4E3E0]/70 hover:text-[#E4E3E0] cursor-pointer transition-colors">
              <User size={18} />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-[#f0f0f0] p-8 flex justify-center items-center">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center overflow-hidden">
                <User size={64} className="text-[#141414]/20" />
              </div>
            </div>
            <div className="p-6 text-center bg-white">
              <h3 className="text-[#141414] font-bold text-sm tracking-tight mb-1">MOHAMMAD RABIUL AWAL</h3>
              <p className="text-[#141414]/40 text-xs font-mono mb-6">2371889</p>
              
              <div className="flex justify-center gap-4">
                <button className="p-3 border border-[#141414]/10 rounded-full text-[#141414]/60 hover:bg-[#141414]/5 transition-colors">
                  <Pencil size={16} />
                </button>
                <button className="p-3 border border-[#141414]/10 rounded-full text-[#141414]/60 hover:bg-[#141414]/5 transition-colors">
                  <Eye size={16} />
                </button>
                <button className="p-3 border border-[#141414]/10 rounded-full text-[#141414]/60 hover:bg-[#141414]/5 transition-colors">
                  <Power size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <nav className="px-4 pb-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
                  isActive 
                    ? "bg-[#E4E3E0] text-[#141414]" 
                    : "hover:bg-[#E4E3E0]/5 text-[#E4E3E0]/70 hover:text-[#E4E3E0]"
                )}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

// Dashboard Page
function Dashboard() {
  const [stats, setStats] = useState({ totalItems: 0, totalBranches: 0, recentTransactions: [] as Transaction[] });

  useEffect(() => {
    const loadData = async () => {
      const [items, branches, transactions] = await Promise.all([
        api.getItems(),
        api.getBranches(),
        api.getTransactions()
      ]);
      setStats({
        totalItems: items.length,
        totalBranches: branches.length,
        recentTransactions: transactions.slice(-5).reverse()
      });
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-serif italic">Overview</h2>
        <p className="text-sm text-[#141414]/60">Real-time status of Arcane coaching center inventory.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Items", value: stats.totalItems, icon: Package },
          { label: "Active Branches", value: stats.totalBranches, icon: GitBranch },
          { label: "Recent Activity", value: stats.recentTransactions.length, icon: ArrowUpRight },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white border border-[#141414]/10 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#141414]/50 font-bold">{stat.label}</p>
                <p className="text-4xl font-mono mt-2">{stat.value}</p>
              </div>
              <stat.icon className="text-[#141414]/20" size={24} />
            </div>
          </div>
        ))}
      </div>

      <section className="bg-white border border-[#141414]/10 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#141414]/10 flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-widest">Recent Transactions</h3>
          <Link to="/transactions" className="text-xs underline opacity-50 hover:opacity-100">View All</Link>
        </div>
        <div className="divide-y divide-[#141414]/10">
          {stats.recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#141414]/40 italic">No recent activity</div>
          ) : (
            stats.recentTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-[#141414]/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2 rounded-full",
                    tx.type === 'Stock In' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {tx.type === 'Stock In' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.itemName} <span className="text-[10px] opacity-50">({tx.itemVersion})</span></p>
                    <p className="text-[10px] text-[#141414]/50 uppercase tracking-tighter">
                      {tx.branchName} • {format(new Date(tx.date), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-mono font-bold",
                    tx.type === 'Stock In' ? "text-green-600" : "text-red-600"
                  )}>
                    {tx.type === 'Stock In' ? '+' : '-'}{tx.quantity}
                  </p>
                  <p className="text-[10px] text-[#141414]/40">Voucher: {tx.voucherNumber}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

// Inventory Page
function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkQuantities, setBulkQuantities] = useState<Record<string, number>>({});
  const [bulkVoucher, setBulkVoucher] = useState("");
  const [bulkBranch, setBulkBranch] = useState("");
  const [bulkType, setBulkType] = useState<'Stock In' | 'Stock Out'>('Stock Out');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedSummaryProgram, setSelectedSummaryProgram] = useState<Program | "">("");
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    category: 'Book',
    version: 'Bangla',
    program: 'Class 6',
    stockLevel: 0,
    unit: 'pcs'
  });

  useEffect(() => {
    api.getItems().then(setItems);
    api.getBranches().then(setBranches);
  }, []);

  const programSummary = useMemo(() => {
    if (!selectedSummaryProgram) return null;
    const programItems = items.filter(i => i.program === selectedSummaryProgram && i.category === 'Book');
    const banglaTotal = programItems.filter(i => i.version === 'Bangla').reduce((acc, i) => acc + i.stockLevel, 0);
    const englishTotal = programItems.filter(i => i.version === 'English').reduce((acc, i) => acc + i.stockLevel, 0);
    return { banglaTotal, englishTotal, items: programItems };
  }, [items, selectedSummaryProgram]);

  const handleBulkSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const branch = branches.find(b => b.id === bulkBranch);
    if (!branch) return;

    const promises = Object.entries(bulkQuantities)
      .filter(([_, qty]) => (qty as number) > 0)
      .map(([itemId, qty]) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return Promise.resolve();
        return api.createTransaction({
          itemId,
          itemName: item.name,
          itemVersion: item.version,
          type: bulkType,
          quantity: qty as number,
          voucherNumber: bulkVoucher,
          branchId: bulkBranch,
          branchName: branch.name,
          recipient: 'Office'
        });
      });

    await Promise.all(promises);
    setIsBulkModalOpen(false);
    setBulkQuantities({});
    setBulkVoucher("");
    api.getItems().then(setItems);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const created = await api.createItem(newItem as Omit<InventoryItem, "id">);
    setItems([...items, created]);
    setIsModalOpen(false);
    setNewItem({ category: 'Book', version: 'Bangla', program: 'Class 6', stockLevel: 0, unit: 'pcs' });
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase()) ||
    i.program?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif italic">Inventory</h2>
          <p className="text-sm text-[#141414]/60">Manage books and office supplies.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-[#141414]/10 rounded-lg hover:bg-[#141414]/5 transition-colors text-sm font-medium"
          >
            Bulk Stock Out (একসাথে অনেক বই বের করুন)
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#141414] text-[#E4E3E0] rounded-lg hover:bg-[#141414]/90 transition-colors text-sm font-medium"
          >
            <Plus size={18} /> Add New Item
          </button>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/30" size={18} />
        <input 
          type="text" 
          placeholder="Search by name, category, or program..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-[#141414]/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#141414]/5 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Program Summary Section */}
      <div className="bg-white border border-[#141414]/10 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest">Class-wise Summary (ক্লাস ভিত্তিক সারসংক্ষেপ)</h3>
            <p className="text-[10px] text-[#141414]/50">এক ক্লিকে নির্দিষ্ট ক্লাসের বাংলা ও ইংলিশ ভার্সন স্টক দেখুন।</p>
          </div>
          <select 
            className="px-4 py-2 border border-[#141414]/10 rounded-lg text-sm bg-[#141414]/5 focus:bg-white transition-colors"
            value={selectedSummaryProgram}
            onChange={(e) => setSelectedSummaryProgram(e.target.value as Program)}
          >
            <option value="">Select Class/Program...</option>
            <option value="Class 6">Class 6</option>
            <option value="Class 7">Class 7</option>
            <option value="Class 8">Class 8</option>
            <option value="Class 9">Class 9</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 11">Class 11</option>
            <option value="Class 12">Class 12</option>
            <option value="Medical">Medical</option>
            <option value="Engineering">Engineering</option>
            <option value="Varsity A">Varsity A</option>
            <option value="Varsity B">Varsity B</option>
          </select>
        </div>

        {programSummary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Bangla Version Total</span>
                <BookOpen size={16} className="text-blue-400" />
              </div>
              <p className="text-3xl font-mono font-bold text-blue-900">{programSummary.banglaTotal} <span className="text-xs font-sans opacity-50">pcs</span></p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-700">English Version Total</span>
                <BookOpen size={16} className="text-purple-400" />
              </div>
              <p className="text-3xl font-mono font-bold text-purple-900">{programSummary.englishTotal} <span className="text-xs font-sans opacity-50">pcs</span></p>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center border-2 border-dashed border-[#141414]/5 rounded-lg">
            <p className="text-sm text-[#141414]/30 italic">সারসংক্ষেপ দেখতে একটি ক্লাস সিলেক্ট করুন।</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#141414]/10 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141414]/5 border-b border-[#141414]/10">
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-[#141414]/50">Item Name</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-[#141414]/50">Version</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-[#141414]/50">Category</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-[#141414]/50">Program</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-[#141414]/50 text-right">Stock</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-[#141414]/50">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/10">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#141414]/40 italic">No items found</td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#141414]/5 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.subProgram && <p className="text-[10px] text-[#141414]/40 italic">{item.subProgram}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] px-2 py-1 rounded border font-bold uppercase tracking-tighter",
                        item.version === 'Bangla' ? "bg-blue-50 text-blue-700 border-blue-200" : 
                        item.version === 'English' ? "bg-purple-50 text-purple-700 border-purple-200" :
                        "bg-gray-50 text-gray-700 border-gray-200"
                      )}>
                        {item.version}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] px-2 py-1 bg-[#141414]/5 rounded border border-[#141414]/10 font-bold uppercase tracking-tighter">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#141414]/60">{item.program || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "text-sm font-mono font-bold",
                        item.stockLevel < 10 ? "text-red-600" : "text-[#141414]"
                      )}>
                        {item.stockLevel}
                      </span>
                      <span className="text-[10px] text-[#141414]/40 ml-1 uppercase">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4 text-[10px] text-[#141414]/40 font-mono">
                      {format(new Date(item.lastUpdated), 'yyyy-MM-dd HH:mm')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#141414]/10 flex justify-between items-center">
              <h3 className="text-lg font-serif italic">Add New Inventory Item</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Item Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm"
                  value={newItem.name || ""}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Category (ক্যাটাগরি)</label>
                  <select 
                    className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                  >
                    <option value="Book">Book (বই)</option>
                    <option value="Stationery">Stationery (স্টেশনারি)</option>
                    <option value="Electronics">Electronics (ইলেকট্রনিক্স)</option>
                    <option value="Other">Other (অন্যান্য)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Version (ভার্সন)</label>
                  <select 
                    className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm"
                    value={newItem.version}
                    onChange={(e) => setNewItem({ ...newItem, version: e.target.value as any })}
                  >
                    <option value="Bangla">Bangla (বাংলা)</option>
                    <option value="English">English (ইংরেজি)</option>
                    <option value="N/A">N/A (প্রযোজ্য নয়)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Base Program (মূল প্রোগ্রাম)</label>
                <select 
                  className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm"
                  value={newItem.program}
                  onChange={(e) => setNewItem({ ...newItem, program: e.target.value as any })}
                >
                  <option value="Class 6">Class 6</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                  <option value="Medical">Medical</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Varsity A">Varsity A</option>
                  <option value="Varsity B">Varsity B</option>
                  <option value="Custom">Custom (কাস্টম)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Short Course / Custom Info (শর্ট কোর্স - ম্যানুয়ালী লিখুন)</label>
                <input 
                  type="text" 
                  placeholder="যেমন: মেডিকেল + ইঞ্জিনিয়ারিং শর্ট কোর্স"
                  className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm"
                  value={newItem.subProgram || ""}
                  onChange={(e) => setNewItem({ ...newItem, subProgram: e.target.value })}
                />
                <p className="text-[9px] text-[#141414]/40 mt-1">* এখানে আপনি আপনার পছন্দমতো শর্ট কোর্সের নাম লিখতে পারবেন।</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Initial Stock</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm"
                    value={newItem.stockLevel}
                    onChange={(e) => setNewItem({ ...newItem, stockLevel: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Unit</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-[#141414] text-[#E4E3E0] rounded-lg font-bold text-sm mt-4"
              >
                Create Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Entry Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#141414]/10 flex justify-between items-center">
              <h3 className="text-lg font-serif italic">Bulk Stock Transaction (একসাথে অনেক বই এন্ট্রি)</h3>
              <button onClick={() => setIsBulkModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleBulkSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 border-b border-[#141414]/10 grid grid-cols-3 gap-4 bg-[#141414]/5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Type</label>
                  <select 
                    className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm"
                    value={bulkType}
                    onChange={(e) => setBulkType(e.target.value as any)}
                  >
                    <option value="Stock In">Stock In</option>
                    <option value="Stock Out">Stock Out</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Branch</label>
                  <select 
                    required
                    className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm"
                    value={bulkBranch}
                    onChange={(e) => setBulkBranch(e.target.value)}
                  >
                    <option value="">Select Branch...</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Voucher No.</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm"
                    value={bulkVoucher}
                    onChange={(e) => setBulkVoucher(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-[#141414]/10">
                      <th className="py-2 text-[10px] uppercase tracking-widest font-bold opacity-50">Item Name</th>
                      <th className="py-2 text-[10px] uppercase tracking-widest font-bold opacity-50">Current Stock</th>
                      <th className="py-2 text-[10px] uppercase tracking-widest font-bold opacity-50 text-right">Quantity to {bulkType === 'Stock In' ? 'Add' : 'Remove'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141414]/5">
                    {items.map(item => (
                      <tr key={item.id}>
                        <td className="py-3">
                          <p className="text-sm font-medium">{item.name} <span className="text-[10px] opacity-50">({item.version})</span></p>
                          <p className="text-[10px] opacity-40 uppercase">{item.program} {item.subProgram ? `(${item.subProgram})` : ''}</p>
                        </td>
                        <td className="py-3 text-sm font-mono opacity-60">{item.stockLevel} {item.unit}</td>
                        <td className="py-3 text-right">
                          <input 
                            type="number" 
                            min="0"
                            placeholder="0"
                            className="w-20 px-2 py-1 border border-[#141414]/10 rounded text-sm text-right font-mono"
                            value={bulkQuantities[item.id] || ""}
                            onChange={(e) => setBulkQuantities({ ...bulkQuantities, [item.id]: parseInt(e.target.value) || 0 })}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-t border-[#141414]/10 bg-[#141414]/5">
                <button 
                  type="submit"
                  className="w-full py-3 bg-[#141414] text-[#E4E3E0] rounded-lg font-bold text-sm"
                >
                  Confirm Bulk Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Transactions Page (Stock In/Out)
function Transactions() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [programFilter, setProgramFilter] = useState("");
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: 'Stock In',
    quantity: 1,
    recipient: 'Office'
  });

  useEffect(() => {
    Promise.all([
      api.getTransactions(),
      api.getItems(),
      api.getBranches()
    ]).then(([t, i, b]) => {
      setTxs(t.reverse());
      setItems(i);
      setBranches(b);
    });
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const item = items.find(i => i.id === newTx.itemId);
    const branch = branches.find(b => b.id === newTx.branchId);
    
    if (!item || !branch) return;

    const txData = {
      ...newTx,
      itemName: item.name,
      itemVersion: item.version,
      branchName: branch.name,
    } as Omit<Transaction, "id" | "date">;

    const created = await api.createTransaction(txData);
    setTxs([created, ...txs]);
    setIsModalOpen(false);
    setNewTx({ type: 'Stock In', quantity: 1, recipient: 'Office' });
    
    // Refresh items to get updated stock levels
    api.getItems().then(setItems);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif italic">Stock Transactions</h2>
          <p className="text-sm text-[#141414]/60">Record stock in and stock out events.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#141414] text-[#E4E3E0] rounded-lg hover:bg-[#141414]/90 transition-colors text-sm font-medium"
        >
          <Plus size={18} /> New Transaction
        </button>
      </header>

      <div className="bg-white border border-[#141414]/10 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141414]/5 border-b border-[#141414]/10">
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-[#141414]/50">Date</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-[#141414]/50">Type</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-[#141414]/50">Item</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-[#141414]/50">Version</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-[#141414]/50">Branch</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-[#141414]/50 text-right">Qty</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-[#141414]/50">Voucher</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-[#141414]/50">Recipient</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/10">
              {txs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-[#141414]/40 italic">No transactions recorded</td>
                </tr>
              ) : (
                txs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#141414]/5 transition-colors">
                    <td className="px-6 py-4 text-[10px] font-mono text-[#141414]/50">
                      {format(new Date(tx.date), 'yyyy-MM-dd HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] px-2 py-1 rounded border font-bold uppercase tracking-tighter",
                        tx.type === 'Stock In' 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-red-50 text-red-700 border-red-200"
                      )}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{tx.itemName}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] px-2 py-1 rounded border font-bold uppercase tracking-tighter",
                        tx.itemVersion === 'Bangla' ? "bg-blue-50 text-blue-700 border-blue-200" : 
                        tx.itemVersion === 'English' ? "bg-purple-50 text-purple-700 border-purple-200" :
                        "bg-gray-50 text-gray-700 border-gray-200"
                      )}>
                        {tx.itemVersion}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#141414]/60">{tx.branchName}</td>
                    <td className={cn(
                      "px-6 py-4 text-right font-mono font-bold text-sm",
                      tx.type === 'Stock In' ? "text-green-600" : "text-red-600"
                    )}>
                      {tx.type === 'Stock In' ? '+' : '-'}{tx.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono">{tx.voucherNumber}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{tx.recipientName || "-"}</p>
                      <p className="text-[10px] text-[#141414]/40 uppercase tracking-widest">{tx.recipient}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#141414]/10 flex justify-between items-center">
              <h3 className="text-lg font-serif italic">New Stock Transaction</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="flex gap-2 p-1 bg-[#141414]/5 rounded-lg">
                {(['Stock In', 'Stock Out'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewTx({ ...newTx, type })}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-md transition-all",
                      newTx.type === type ? "bg-white text-[#141414] shadow-sm" : "text-[#141414]/40 hover:text-[#141414]"
                    )}
                  >
                    {type === 'Stock In' ? 'Stock In (স্টক ইন)' : 'Stock Out (স্টক আউট)'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Filter by Program (প্রোগ্রাম ফিল্টার)</label>
                  <select 
                    className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm"
                    value={programFilter}
                    onChange={(e) => setProgramFilter(e.target.value)}
                  >
                    <option value="">All Programs</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="Medical">Medical</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Varsity A">Varsity A</option>
                    <option value="Varsity B">Varsity B</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Select Branch (ব্রাঞ্চ)</label>
                  <select 
                    required
                    className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm"
                    value={newTx.branchId || ""}
                    onChange={(e) => setNewTx({ ...newTx, branchId: e.target.value })}
                  >
                    <option value="">Choose a branch...</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Select Item (বই বা জিনিস নির্বাচন করুন)</label>
                <select 
                  required
                  className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm"
                  value={newTx.itemId || ""}
                  onChange={(e) => setNewTx({ ...newTx, itemId: e.target.value })}
                >
                  <option value="">Choose an item...</option>
                  {items.filter(i => !programFilter || i.program === programFilter).map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.version}) {i.program ? `[${i.program}]` : ''} - (Stock: {i.stockLevel} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Quantity (পরিমাণ)</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm"
                    value={newTx.quantity}
                    onChange={(e) => setNewTx({ ...newTx, quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Voucher No. (ভাউচার নাম্বার)</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm"
                    value={newTx.voucherNumber || ""}
                    onChange={(e) => setNewTx({ ...newTx, voucherNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Recipient Type (কাকে দিচ্ছেন?)</label>
                  <select 
                    className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm"
                    value={newTx.recipient}
                    onChange={(e) => setNewTx({ ...newTx, recipient: e.target.value as any })}
                  >
                    <option value="Office">Office (অফিস)</option>
                    <option value="Teacher">Teacher (শিক্ষক)</option>
                    <option value="Student">Student (ছাত্র/ছাত্রী)</option>
                    <option value="Other">Other (অন্যান্য)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Recipient Name (নাম)</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm"
                    value={newTx.recipientName || ""}
                    onChange={(e) => setNewTx({ ...newTx, recipientName: e.target.value })}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-[#141414] text-[#E4E3E0] rounded-lg font-bold text-sm mt-4"
              >
                Record Transaction (এন্ট্রি করুন)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Branches Page
function Branches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBranch, setNewBranch] = useState<Partial<Branch>>({});

  useEffect(() => {
    api.getBranches().then(setBranches);
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const created = await api.createBranch(newBranch as Omit<Branch, "id">);
    setBranches([...branches, created]);
    setIsModalOpen(false);
    setNewBranch({});
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif italic">Branches</h2>
          <p className="text-sm text-[#141414]/60">Manage all 115 Arcane coaching center locations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#141414] text-[#E4E3E0] rounded-lg hover:bg-[#141414]/90 transition-colors text-sm font-medium"
        >
          <Plus size={18} /> Add New Branch
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.length === 0 ? (
          <div className="col-span-full p-12 text-center text-sm text-[#141414]/40 italic bg-white border border-dashed border-[#141414]/20 rounded-xl">
            No branches added yet.
          </div>
        ) : (
          branches.map((branch) => (
            <div key={branch.id} className="p-6 bg-white border border-[#141414]/10 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[#141414]/5 rounded-full text-[#141414]/40">
                  <GitBranch size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{branch.name}</h3>
                  <p className="text-[10px] text-[#141414]/50 uppercase tracking-widest">Branch ID: {branch.id.slice(-6)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-[#141414]/70 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-tighter opacity-40">Location:</span>
                  {branch.location}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Branch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#141414]/10 flex justify-between items-center">
              <h3 className="text-lg font-serif italic">Add New Branch</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Branch Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm"
                  value={newBranch.name || ""}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Location / Address</label>
                <textarea 
                  required
                  className="w-full px-3 py-2 border border-[#141414]/10 rounded-lg text-sm h-24 resize-none"
                  value={newBranch.location || ""}
                  onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-[#141414] text-[#E4E3E0] rounded-lg font-bold text-sm mt-4"
              >
                Create Branch
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white border-b border-[#141414]/10 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-[#141414]/60 hover:text-[#141414]"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex items-center gap-4 ml-auto">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold">Admin User</p>
                <p className="text-[10px] text-[#141414]/40 uppercase tracking-widest">Main Office</p>
              </div>
              <div className="w-8 h-8 bg-[#141414] rounded-full flex items-center justify-center text-[#E4E3E0] text-xs font-bold">
                AU
              </div>
            </div>
          </header>
          
          <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/branches" element={<Branches />} />
              <Route path="/transactions" element={<Transactions />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

