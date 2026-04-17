import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Calendar, DollarSign, Package, Download, Upload, TrendingUp, CheckCircle2, AlertCircle, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeliveryFee } from './types';

export default function App() {
  const [entries, setEntries] = useState<DeliveryFee[]>(() => {
    const saved = localStorage.getItem('deliveryFees');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isPaidInput, setIsPaidInput] = useState(false);

  useEffect(() => {
    localStorage.setItem('deliveryFees', JSON.stringify(entries));
  }, [entries]);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !amount) return;

    const newEntry: DeliveryFee = {
      id: crypto.randomUUID(),
      date,
      amount: parseInt(amount, 10),
      description: description || '택배비',
      isPaid: isPaidInput,
      isInvoiceIssued: false,
    };

    setEntries([newEntry, ...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setAmount('');
    setDescription('');
    setIsPaidInput(false);
  };

  const togglePaymentStatus = (id: string) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, isPaid: !entry.isPaid } : entry
    ));
  };

  const toggleInvoiceStatus = (id: string) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, isInvoiceIssued: !entry.isInvoiceIssued } : entry
    ));
  };

  const deleteEntry = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  const handleBatchPay = () => {
    if (confirm('모든 미결제 내역을 결제 완료로 처리하시겠습니까?')) {
      setEntries(entries.map(entry => ({ ...entry, isPaid: true })));
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `delivery-fees-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          if (confirm('기존 데이터를 유지하고 새로운 데이터를 추가하시겠습니까?\n(아니오를 선택하면 기존 데이터가 교체됩니다)')) {
            const combined = [...entries, ...json].reduce((acc: DeliveryFee[], current) => {
              if (!acc.find(item => item.id === current.id)) {
                acc.push(current);
              }
              return acc;
            }, []);
            setEntries(combined.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
          } else {
            setEntries(json.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
          }
        }
      } catch (error) {
        alert('올바른 JSON 형식이 아닙니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const { totalUnpaid, totalAmount, totalInvoiceIssued, hasUnpaid } = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        acc.totalAmount += entry.amount;
        if (!entry.isPaid) {
          acc.totalUnpaid += entry.amount;
          acc.hasUnpaid = true;
        }
        if (entry.isInvoiceIssued) {
          acc.totalInvoiceIssued += entry.amount;
        }
        return acc;
      },
      { totalUnpaid: 0, totalAmount: 0, totalInvoiceIssued: 0, hasUnpaid: false }
    );
  }, [entries]);

  const formatCurrency = (value: number) => {
    return `₩ ${value.toLocaleString('ko-KR')}`;
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 lg:p-12">
      {/* Decorative background elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/10 blur-[120px] rounded-full -z-10 animate-pulse delay-700"></div>

      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <h1 className="text-4xl font-extrabold tracking-tight gradient-text">
              Delivery Zen
            </h1>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              스마트한 택배비 정산 파트너
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={handleExportJSON}
              className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
              내보내기
            </button>
            <label className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all shadow-sm hover:shadow-md active:scale-95">
              <Upload size={18} className="group-hover:-translate-y-0.5 transition-transform" />
              불러오기
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
          </motion.div>
        </header>

        {/* Dashboards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: '이번 달 누적 합계', value: totalAmount, color: 'text-slate-900', icon: <TrendingUp className="text-blue-500" /> },
            { label: '미결제 금액', value: totalUnpaid, color: 'text-orange-500', icon: <AlertCircle className="text-orange-500" />, sub: '빠른 정산이 필요합니다' },
            { label: '전자세금계산서 발행', value: totalInvoiceIssued, color: 'text-purple-600', icon: <CheckCircle2 className="text-purple-500" /> },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-card rounded-[2rem] p-8 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/50 rounded-2xl shadow-inner text-xl">
                  {card.icon}
                </div>
                {card.sub && <span className="text-[10px] font-bold px-2 py-1 bg-orange-100 text-orange-600 rounded-full">{card.sub}</span>}
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{card.label}</h2>
                <p className={`text-4xl font-extrabold mt-1 ${card.color}`}>
                  {formatCurrency(card.value)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Interface */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              거래 내역 상세
              <span className="text-sm font-bold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-400">
                {entries.length}건
              </span>
            </h2>
            <motion.button
              whileHover={hasUnpaid ? { scale: 1.02 } : {}}
              whileTap={hasUnpaid ? { scale: 0.98 } : {}}
              onClick={handleBatchPay}
              disabled={!hasUnpaid}
              className={`px-8 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-lg ${
                hasUnpaid 
                  ? 'gradient-bg text-white hover:shadow-xl' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              미결제 내역 일괄 처리
            </motion.button>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-[2.5rem] shadow-2xl overflow-hidden border-white/40"
          >
            {/* Inline Add Form */}
            <div className="p-8 bg-gradient-to-r from-slate-50/50 to-white/50 border-b border-white/40">
              <form onSubmit={handleAddEntry} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">날짜</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-12 glass-input px-4 rounded-xl font-medium text-slate-700 outline-none"
                  />
                </div>
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">거래 내용</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="ex. 4월 물류 대행"
                    className="w-full h-12 glass-input px-4 rounded-xl font-medium text-slate-700 outline-none placeholder:text-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">금액 (원)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="3,000"
                    className="w-full h-12 glass-input px-4 rounded-xl font-bold text-slate-700 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 group"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                  새 기록 추가
                </button>
              </form>
            </div>
            
            {/* Table Header (Hidden on mobile) */}
            <div className="hidden lg:grid lg:grid-cols-[1fr_2.5fr_1.5fr_1.5fr_auto] gap-8 px-10 py-5 bg-white/20 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-white/20">
              <div>날짜</div>
              <div>상세 내역</div>
              <div>금액</div>
              <div>처리 상태</div>
              <div className="w-10"></div>
            </div>

            {/* Table Body */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {entries.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-32 text-slate-300 space-y-4"
                  >
                    <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center animate-float">
                      <Package size={48} className="opacity-20" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg text-slate-400">등록된 내역이 없습니다</p>
                      <p className="text-sm font-medium">새로운 거래를 추가하여 관리를 시작하세요</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="divide-y divide-white/20">
                    {entries.map((entry) => (
                      <motion.div 
                        key={entry.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr_1.5fr_1.5fr_auto] gap-4 lg:gap-8 items-center px-10 py-6 hover:bg-white/40 transition-all group relative"
                      >
                        <div className="text-sm font-bold text-slate-400 font-mono italic">
                          {entry.date.replace(/-/g, '.')}
                        </div>
                        
                        <div className="text-lg font-bold text-slate-800">
                          {entry.description}
                        </div>
                        
                        <div className="text-xl font-black text-slate-900">
                          {formatCurrency(entry.amount)}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => togglePaymentStatus(entry.id)}
                            className={`px-4 py-1.5 rounded-2xl text-[11px] font-black uppercase tracking-tighter transition-all shadow-sm ${
                              entry.isPaid 
                                ? 'bg-emerald-500 text-white shadow-emerald-200' 
                                : 'bg-orange-400 text-white shadow-orange-100'
                            }`}
                          >
                            {entry.isPaid ? '결제완료' : '미결제'}
                          </button>
                          
                          <button
                            onClick={() => toggleInvoiceStatus(entry.id)}
                            className={`px-4 py-1.5 rounded-2xl text-[11px] font-black uppercase tracking-tighter transition-all border ${
                              entry.isInvoiceIssued
                                ? 'bg-purple-100 text-purple-600 border-purple-200'
                                : 'bg-transparent text-slate-300 border-slate-200 hover:text-slate-500 hover:border-slate-400'
                            }`}
                          >
                            {entry.isInvoiceIssued ? '계산서 발행' : '발행 전'}
                          </button>
                        </div>

                        <div className="absolute right-6 top-1/2 -translate-y-1/2 lg:relative lg:right-0 lg:top-0 lg:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
