import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Supplier({ onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInvoice, setSearchInvoice] = useState('');
  const [totalItem, setTotalItemGet] = useState(10);
  const [submitted, setSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editFormData, setEditFormData] = useState({
    full_name: '',
    phone_no: '',
    account_no: '',
    remaining_amount: '',
    hidden_id: '',
  });

  const fetchData = () => {
    setLoading(true);
    axios.get(process.env.REACT_APP_API_URL + '/suppliers-list', {
      params: { page: currentPage, limit: totalItem, getSearch: searchInvoice }
    })
      .then(res => {
        setData(res.data.results || []);
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => { toast.error('Failed to fetch suppliers'); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, [currentPage, totalItem, searchInvoice]);

  const handlePageChange = ({ selected }) => setCurrentPage(selected + 1);

  const handlePhoneChange = (value) => {
    let input = value.replace(/\D/g, '');
    if (input.length > 11) input = input.slice(0, 11);
    let formatted = input.length > 4 ? `${input.slice(0, 4)}-${input.slice(4)}` : input;
    setEditFormData(p => ({ ...p, phone_no: formatted }));
  };

  const openAddModal = () => {
    setEditFormData({ full_name: '', phone_no: '', account_no: '', remaining_amount: '', hidden_id: '' });
    setSubmitted(false);
    setIsModalOpen(true);
  };

  const editItem = async (id) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/get-supplier/${id}`);
      const s = res.data;
      setEditFormData({
        full_name: s.full_name || '',
        phone_no: s.phone_no || '',
        account_no: s.account_no || '',
        remaining_amount: s.remaining_amount ?? '',
        hidden_id: s.id,
      });
      setSubmitted(false);
      setIsModalOpen(true);
    } catch {
      toast.error('Failed to load supplier');
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/delete-supplier/${id}`);
      toast.success('Supplier deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete supplier');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!editFormData.full_name || !editFormData.phone_no) {
      toast.error('Name and Phone are required');
      return;
    }

    try {
      if (editFormData.hidden_id) {
        await axios.put(`${process.env.REACT_APP_API_URL}/update-supplier/${editFormData.hidden_id}`, editFormData);
        toast.success('Supplier updated successfully');
      } else {
        const res = await fetch(process.env.REACT_APP_API_URL + '/insert-supplier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editFormData),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Failed');
        toast.success('Supplier added successfully');
      }
      setIsModalOpen(false);
      setSubmitted(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Supplier already exists');
    }
  };

  const isEditing = !!editFormData.hidden_id;

  // ── Ledger state ──
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [ledgerData, setLedgerData] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [payForm, setPayForm] = useState({ payment_date: new Date().toISOString().split('T')[0], amount: '', notes: '' });
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState(null);

  const resetPayForm = () => {
    setPayForm({ payment_date: new Date().toISOString().split('T')[0], amount: '', notes: '' });
    setEditingPaymentId(null);
  };

  const startEditPayment = (p) => {
    const dateOnly = p.payment_date ? new Date(p.payment_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    setPayForm({ payment_date: dateOnly, amount: String(parseFloat(p.amount || 0)), notes: p.notes || '' });
    setEditingPaymentId(p.id);
  };

  const openLedger = async (supplierId) => {
    setLedgerOpen(true);
    setLedgerData(null);
    setLedgerLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/supplier-ledger/${supplierId}`);
      setLedgerData(res.data);
    } catch {
      toast.error('Failed to load ledger');
      setLedgerOpen(false);
    } finally {
      setLedgerLoading(false);
    }
  };

  const refreshLedger = async () => {
    if (!ledgerData?.supplier?.id) return;
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/supplier-ledger/${ledgerData.supplier.id}`);
      setLedgerData(res.data);
    } catch { toast.error('Failed to refresh ledger'); }
  };

  const fmtDate = (raw) => {
    if (!raw) return '—';
    const d = new Date(raw);
    if (isNaN(d)) return '—';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    const amt = parseFloat(payForm.amount);
    if (!payForm.amount || amt <= 0) { toast.error('Enter a valid amount'); return; }

    if (!editingPaymentId) {
      const netBalance = parseFloat(ledgerData?.summary?.net_balance || 0);
      if (amt > netBalance) {
        toast.error(`Payment Rs. ${amt.toFixed(0)} exceeds outstanding balance Rs. ${netBalance.toFixed(0)}`);
        return;
      }
    }

    setPaySubmitting(true);
    try {
      if (editingPaymentId) {
        await axios.put(`${process.env.REACT_APP_API_URL}/supplier-ledger/${editingPaymentId}`, payForm);
        toast.success('Payment updated');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/supplier-ledger`, {
          supplier_id: ledgerData.supplier.id,
          ...payForm,
        });
        toast.success('Payment recorded');
      }
      resetPayForm();
      refreshLedger();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save payment');
    } finally {
      setPaySubmitting(false);
    }
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm('Delete this payment record?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/supplier-ledger/${id}`);
      toast.success('Payment deleted');
      refreshLedger();
      fetchData();
    } catch { toast.error('Failed to delete payment'); }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: '#faf5ff', minHeight: '100%' }}>
      <style>{`
        /* ── TOP BAR ── */
        .sup-topbar {
          background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%);
          padding: 10px 16px;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 2px 8px rgba(76,29,149,.3);
        }
        .sup-topbar-icon {
          width: 32px; height: 32px;
          background: rgba(255,255,255,.15); border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: #fde68a; font-size: 15px;
        }
        .sup-topbar-title { font-size: 14px; font-weight: 800; color: #fff; }
        .sup-topbar-sub   { font-size: 11px; color: rgba(255,255,255,.65); }
        .sup-topbar-count {
          margin-left: auto;
          background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25);
          color: #fde68a; padding: 3px 12px; border-radius: 12px;
          font-size: 12px; font-weight: 700;
        }

        /* ── TOOLBAR ── */
        .sup-toolbar {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px;
          background: #fff; border-bottom: 1px solid #e9d5ff;
          flex-wrap: wrap;
        }
        .sup-search-wrap { position: relative; flex: 1; min-width: 180px; max-width: 340px; }
        .sup-search-icon {
          position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
          color: #a78bfa; font-size: 12px;
        }
        .sup-search {
          width: 100%; padding: 7px 10px 7px 30px;
          border: 1px solid #ddd6fe; border-radius: 8px;
          font-size: 12px; color: #1e1b4b; outline: none;
          box-sizing: border-box;
        }
        .sup-search:focus { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124,58,237,.12); }
        .sup-perpage {
          padding: 6px 8px; border: 1px solid #ddd6fe; border-radius: 7px;
          font-size: 12px; color: #4c1d95; background: #faf5ff; outline: none;
        }
        .sup-add-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 16px;
          background: linear-gradient(135deg, #4c1d95, #7c3aed);
          color: #fff; border: none; border-radius: 8px;
          font-size: 12px; font-weight: 700; cursor: pointer;
          transition: opacity .15s; white-space: nowrap;
        }
        .sup-add-btn:hover { opacity: .88; }

        /* ── TABLE ── */
        .sup-table-wrap { padding: 14px; overflow-x: auto; }
        .sup-tbl {
          width: 100%; border-collapse: collapse; background: #fff;
          border-radius: 10px; overflow: hidden;
          box-shadow: 0 1px 6px rgba(76,29,149,.1);
        }
        .sup-tbl thead tr { background: linear-gradient(135deg, #4c1d95, #7c3aed); }
        .sup-tbl th {
          padding: 10px 12px; text-align: left;
          font-size: 10px; font-weight: 800; color: #fde68a;
          text-transform: uppercase; letter-spacing: .5px; white-space: nowrap;
        }
        .sup-tbl td {
          padding: 9px 12px; font-size: 12px; color: #374151;
          border-bottom: 1px solid #f3f0ff;
        }
        .sup-tbl tbody tr:last-child td { border-bottom: none; }
        .sup-tbl tbody tr:hover td { background: #faf5ff; }
        .sup-name-cell { display: flex; align-items: center; gap: 8px; }
        .sup-avatar {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #7c3aed, #4c1d95);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fde68a; font-size: 11px; flex-shrink: 0;
        }
        .sup-name-val { font-weight: 700; color: #4c1d95; }
        .sup-rem-chip {
          background: #fef3c7; color: #92400e;
          padding: 2px 8px; border-radius: 10px;
          font-size: 10px; font-weight: 700; white-space: nowrap;
        }
        .sup-rem-chip.zero { background: #dcfce7; color: #15803d; }
        .sup-btn-ledger {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px;
          background: rgba(124,58,237,.12); color: #7c3aed;
          border: 1px solid rgba(124,58,237,.3); border-radius: 6px;
          font-size: 11px; font-weight: 600; cursor: pointer;
          margin-right: 5px; transition: background .15s;
        }
        .sup-btn-ledger:hover { background: rgba(124,58,237,.22); }

        /* ── LEDGER MODAL ── */
        .ldg-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 10000;
        }
        .ldg-modal {
          background: #faf5ff; border-radius: 14px;
          width: 900px; max-width: 97vw; max-height: 95vh;
          overflow: hidden; display: flex; flex-direction: column;
          box-shadow: 0 24px 70px rgba(76,29,149,.3);
        }
        .ldg-head {
          background: linear-gradient(135deg, #4c1d95, #7c3aed);
          padding: 13px 18px; display: flex; align-items: center; gap: 10px; flex-shrink: 0;
        }
        .ldg-head-icon {
          width: 34px; height: 34px; background: rgba(255,255,255,.15);
          border-radius: 9px; display: flex; align-items: center; justify-content: center;
          color: #fde68a; font-size: 16px;
        }
        .ldg-head-title { font-size: 14px; font-weight: 800; color: #fff; }
        .ldg-head-sub   { font-size: 11px; color: rgba(255,255,255,.65); }
        .ldg-head-close {
          margin-left: auto; width: 28px; height: 28px;
          background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25);
          border-radius: 6px; color: #fff; font-size: 16px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .ldg-head-close:hover { background: rgba(255,255,255,.28); }

        /* Summary cards */
        .ldg-summary {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
          padding: 12px 16px; flex-shrink: 0;
          background: #fff; border-bottom: 1px solid #e9d5ff;
        }
        .ldg-card {
          background: #faf5ff; border: 1px solid #e9d5ff;
          border-radius: 10px; padding: 10px 12px; text-align: center;
        }
        .ldg-card-label { font-size: 10px; font-weight: 700; color: #8b5cf6; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 4px; }
        .ldg-card-val   { font-size: 17px; font-weight: 800; color: #4c1d95; }
        .ldg-card-val.credit  { color: #16a34a; }
        .ldg-card-val.debit   { color: #b91c1c; }
        .ldg-card-val.balance { color: #7c3aed; }
        .ldg-card.balance-card { background: linear-gradient(135deg, #ede9fe, #f5f3ff); border-color: #c4b5fd; }

        /* Body — two columns */
        .ldg-body {
          display: flex; flex: 1; overflow: hidden; gap: 0;
        }

        /* Left — stock + payments */
        .ldg-left {
          flex: 1; min-width: 0; overflow-y: auto;
          padding: 12px; display: flex; flex-direction: column; gap: 12px;
        }
        .ldg-section-title {
          font-size: 10px; font-weight: 800; color: #7c3aed;
          text-transform: uppercase; letter-spacing: .5px;
          display: flex; align-items: center; gap: 7px; margin-bottom: 6px;
        }
        .ldg-section-title::after { content: ''; flex: 1; height: 1px; background: #e9d5ff; }

        .ldg-tbl { width: 100%; border-collapse: collapse; font-size: 11px; }
        .ldg-tbl thead tr { background: linear-gradient(135deg, #4c1d95, #7c3aed); }
        .ldg-tbl th {
          padding: 7px 10px; text-align: left; font-size: 10px; font-weight: 700;
          color: #fde68a; text-transform: uppercase; letter-spacing: .4px; white-space: nowrap;
        }
        .ldg-tbl td { padding: 7px 10px; border-bottom: 1px solid #f3f0ff; color: #374151; }
        .ldg-tbl tbody tr:last-child td { border-bottom: none; }
        .ldg-tbl tbody tr:hover td { background: #faf5ff; }
        .ldg-tbl tfoot td { padding: 7px 10px; font-weight: 700; border-top: 2px solid #c4b5fd; background: #ede9fe; color: #4c1d95; }

        .ldg-pay-chip { background: #7c3aed; color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; }
        .ldg-rem-chip { background: #fee2e2; color: #b91c1c; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; }
        .ldg-rem-chip.zero { background: #dcfce7; color: #15803d; }
        .ldg-del-btn {
          padding: 2px 8px; background: rgba(239,68,68,.1); color: #dc2626;
          border: 1px solid rgba(239,68,68,.25); border-radius: 5px;
          font-size: 10px; font-weight: 600; cursor: pointer;
        }
        .ldg-del-btn:hover { background: rgba(239,68,68,.2); }
        .ldg-edt-btn {
          padding: 2px 8px; background: rgba(245,158,11,.12); color: #d97706;
          border: 1px solid rgba(245,158,11,.3); border-radius: 5px;
          font-size: 10px; font-weight: 600; cursor: pointer; margin-right: 4px;
        }
        .ldg-edt-btn:hover { background: rgba(245,158,11,.25); }
        .ldg-cancel-btn {
          width: 100%; padding: 7px; margin-top: 6px;
          background: #f5f3ff; color: #7c3aed;
          border: 1px solid #ddd6fe; border-radius: 7px;
          font-size: 11px; font-weight: 700; cursor: pointer;
        }
        .ldg-cancel-btn:hover { background: #ede9fe; }
        .ldg-edit-banner {
          background: #fef3c7; border: 1px solid #fcd34d; color: #92400e;
          padding: 6px 10px; border-radius: 7px;
          font-size: 11px; font-weight: 700; margin-bottom: 10px;
          display: flex; align-items: center; gap: 6px;
        }

        /* Full Ledger (In/Out) styles */
        .ldg-full-tbl { width: 100%; border-collapse: collapse; font-size: 11px; }
        .ldg-full-tbl thead tr { background: linear-gradient(135deg, #4c1d95, #7c3aed); }
        .ldg-full-tbl th {
          padding: 7px 10px; text-align: left; font-size: 10px; font-weight: 700;
          color: #fde68a; text-transform: uppercase; letter-spacing: .4px; white-space: nowrap;
        }
        .ldg-full-tbl td { padding: 7px 10px; border-bottom: 1px solid #f3f0ff; color: #374151; vertical-align: middle; }
        .ldg-full-tbl tbody tr:hover td { background: #faf5ff; }
        .ldg-full-tbl tfoot td { padding: 8px 10px; font-weight: 800; border-top: 2px solid #c4b5fd; background: #ede9fe; color: #4c1d95; }
        .ldg-type-chip {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 7px; border-radius: 10px;
          font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .3px;
        }
        .ldg-type-chip.opening { background: #ede9fe; color: #4c1d95; }
        .ldg-type-chip.stock   { background: #fee2e2; color: #b91c1c; }
        .ldg-type-chip.advance { background: #dbeafe; color: #1d4ed8; }
        .ldg-type-chip.payment { background: #dcfce7; color: #15803d; }
        .ldg-in  { color: #b91c1c; font-weight: 800; }
        .ldg-out { color: #16a34a; font-weight: 800; }
        .ldg-bal { color: #4c1d95; font-weight: 800; }
        .ldg-bal.zero { color: #16a34a; }
        .ldg-empty { text-align: center; padding: 18px; color: #9ca3af; font-size: 12px; }

        /* Right — payment form */
        .ldg-right {
          width: 260px; flex-shrink: 0; border-left: 1px solid #e9d5ff;
          background: #fff; display: flex; flex-direction: column;
          overflow-y: auto; padding: 12px;
        }
        .ldg-form-title {
          font-size: 10px; font-weight: 800; color: #7c3aed;
          text-transform: uppercase; letter-spacing: .5px;
          display: flex; align-items: center; gap: 7px; margin-bottom: 10px;
        }
        .ldg-form-title::after { content: ''; flex: 1; height: 1px; background: #e9d5ff; }
        .ldg-field { margin-bottom: 10px; }
        .ldg-field label { display: block; font-size: 10px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 4px; }
        .ldg-finput {
          width: 100%; padding: 7px 9px;
          border: 1px solid #ddd6fe; border-radius: 7px;
          font-size: 12px; color: #1e1b4b; outline: none;
          box-sizing: border-box; font-family: inherit;
        }
        .ldg-finput:focus { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124,58,237,.12); }
        .ldg-pay-btn {
          width: 100%; padding: 9px; margin-top: 4px;
          background: linear-gradient(135deg, #059669, #10b981);
          color: #fff; border: none; border-radius: 8px;
          font-size: 12px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .ldg-pay-btn:disabled { opacity: .5; cursor: not-allowed; }

        .sup-btn-edit {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px;
          background: rgba(245,158,11,.12); color: #d97706;
          border: 1px solid rgba(245,158,11,.3); border-radius: 6px;
          font-size: 11px; font-weight: 600; cursor: pointer;
          margin-right: 5px; transition: background .15s;
        }
        .sup-btn-edit:hover { background: rgba(245,158,11,.25); }
        .sup-btn-del {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px;
          background: rgba(239,68,68,.1); color: #dc2626;
          border: 1px solid rgba(239,68,68,.25); border-radius: 6px;
          font-size: 11px; font-weight: 600; cursor: pointer;
          transition: background .15s;
        }
        .sup-btn-del:hover { background: rgba(239,68,68,.2); }

        /* ── EMPTY / LOADING ── */
        .sup-empty {
          text-align: center; padding: 50px 20px; color: #a78bfa;
          background: #fff; border-radius: 10px;
          box-shadow: 0 1px 6px rgba(76,29,149,.08);
        }
        .sup-empty-icon { font-size: 32px; margin-bottom: 8px; }
        .sup-empty-text { font-size: 12px; color: #9ca3af; }

        /* ── PAGINATION ── */
        .sup-pagination {
          display: flex; justify-content: center; gap: 4px;
          padding: 10px 14px 14px; list-style: none; margin: 0;
          flex-wrap: wrap;
        }
        .sup-pagination .page-item .page-link {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 30px; height: 30px; padding: 0 8px;
          border: 1px solid #ddd6fe; border-radius: 6px;
          font-size: 11px; font-weight: 600; color: #7c3aed;
          background: #fff; cursor: pointer; text-decoration: none;
          transition: all .15s;
        }
        .sup-pagination .page-item .page-link:hover { background: #ede9fe; }
        .sup-pagination .page-item.active .page-link {
          background: linear-gradient(135deg, #4c1d95, #7c3aed);
          color: #fde68a; border-color: transparent;
        }
        .sup-pagination .page-item.disabled .page-link { opacity: .4; cursor: not-allowed; }

        /* ── MODAL ── */
        .sup-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
        }
        .sup-modal {
          background: #fff; border-radius: 14px;
          width: 480px; max-width: 95vw; max-height: 92vh;
          overflow: hidden; display: flex; flex-direction: column;
          box-shadow: 0 20px 60px rgba(76,29,149,.25);
        }
        .sup-modal-head {
          background: linear-gradient(135deg, #4c1d95, #7c3aed);
          padding: 13px 16px;
          display: flex; align-items: center; gap: 10px; flex-shrink: 0;
        }
        .sup-modal-head-icon {
          width: 30px; height: 30px; background: rgba(255,255,255,.15);
          border-radius: 7px; display: flex; align-items: center; justify-content: center;
          color: #fde68a; font-size: 13px;
        }
        .sup-modal-head-title { font-size: 13px; font-weight: 800; color: #fff; }
        .sup-modal-head-sub   { font-size: 10px; color: rgba(255,255,255,.65); }
        .sup-modal-close {
          margin-left: auto; width: 26px; height: 26px;
          background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25);
          border-radius: 6px; color: #fff; font-size: 15px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .sup-modal-close:hover { background: rgba(255,255,255,.28); }
        .sup-modal-body { padding: 16px; overflow-y: auto; flex: 1; }

        /* ── FORM ── */
        .sup-field { margin-bottom: 11px; }
        .sup-field label {
          display: block; font-size: 10px; font-weight: 700; color: #7c3aed;
          text-transform: uppercase; letter-spacing: .4px; margin-bottom: 4px;
        }
        .sup-finput {
          width: 100%; padding: 7px 10px;
          border: 1px solid #ddd6fe; border-radius: 7px;
          font-size: 12px; color: #1e1b4b; outline: none;
          box-sizing: border-box; transition: border .15s; font-family: inherit;
        }
        .sup-finput:focus { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124,58,237,.12); }
        .sup-finput.invalid { border-color: #f87171; }
        .sup-frow { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
        .sup-divider { height: 1px; background: #ede9fe; margin: 12px 0 10px; }
        .sup-section-label {
          font-size: 10px; font-weight: 800; color: #8b5cf6;
          text-transform: uppercase; letter-spacing: .5px; margin-bottom: 9px;
          display: flex; align-items: center; gap: 7px;
        }
        .sup-section-label::after { content: ''; flex: 1; height: 1px; background: #ede9fe; }
        .sup-submit {
          width: 100%; margin-top: 14px; padding: 10px;
          background: linear-gradient(135deg, #059669, #10b981);
          color: #fff; border: none; border-radius: 8px;
          font-size: 13px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: opacity .15s;
        }
        .sup-submit.editing { background: linear-gradient(135deg, #d97706, #f59e0b); color: #1a1a1a; }
        .sup-submit:disabled { opacity: .5; cursor: not-allowed; }
        .sup-err-text { font-size: 10px; color: #ef4444; margin-top: 3px; }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="sup-topbar">
        <div className="sup-topbar-icon"><i className="fas fa-truck"></i></div>
        <div>
          <div className="sup-topbar-title">Suppliers</div>
          <div className="sup-topbar-sub">Manage your product suppliers</div>
        </div>
        <div className="sup-topbar-count">{data.length} listed</div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="sup-toolbar">
        <div className="sup-search-wrap">
          <i className="fas fa-search sup-search-icon"></i>
          <input
            className="sup-search"
            type="text"
            placeholder="Search by name or phone…"
            value={searchInvoice}
            onChange={e => { setSearchInvoice(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <select className="sup-perpage" value={totalItem} onChange={e => { setTotalItemGet(e.target.value); setCurrentPage(1); }}>
          {[10, 20, 30, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
        </select>
        <button className="sup-add-btn" onClick={openAddModal}>
          <i className="fas fa-plus"></i> Add Supplier
        </button>
      </div>

      {/* ── TABLE ── */}
      <div className="sup-table-wrap">
        {loading ? (
          <div className="sup-empty">
            <div className="sup-empty-icon"><i className="fas fa-spinner fa-spin"></i></div>
            <div className="sup-empty-text">Loading suppliers…</div>
          </div>
        ) : data.length === 0 ? (
          <div className="sup-empty">
            <div className="sup-empty-icon"><i className="fas fa-truck"></i></div>
            <div className="sup-empty-text">
              {searchInvoice ? 'No suppliers match your search' : 'No suppliers yet — click Add Supplier to get started'}
            </div>
          </div>
        ) : (
          <table className="sup-tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Supplier</th>
                <th>Phone</th>
                <th>Account #</th>
                <th>Last Remaining Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s, idx) => {
                const rem = parseFloat(s.remaining_amount || 0);
                return (
                  <tr key={s.id}>
                    <td style={{ color: '#9ca3af', fontWeight: 600 }}>{(currentPage - 1) * totalItem + idx + 1}</td>
                    <td>
                      <div className="sup-name-cell">
                        <div className="sup-avatar"><i className="fas fa-building"></i></div>
                        <span className="sup-name-val">{s.full_name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{s.phone_no || '—'}</td>
                    <td>{s.account_no || '—'}</td>
                    <td>
                      <span className={`sup-rem-chip${rem === 0 ? ' zero' : ''}`}>
                        Rs. {rem.toFixed(0)}
                      </span>
                    </td>
                    {/* <td style={{ fontWeight: 700, color: '#7c3aed' }}>
                      Rs. {parseFloat(s.total_purchase_sum || 0).toFixed(0)}
                    </td> */}
                    <td>
                      <button className="sup-btn-ledger" onClick={() => openLedger(s.id)}>
                        <i className="fas fa-book-open"></i> Ledger
                      </button>
                      <button className="sup-btn-edit" onClick={() => editItem(s.id)}>
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button className="sup-btn-del" onClick={() => deleteItem(s.id)}>
                        <i className="fas fa-trash-alt"></i> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <ReactPaginate
          previousLabel={<i className="fas fa-chevron-left"></i>}
          nextLabel={<i className="fas fa-chevron-right"></i>}
          breakLabel="…"
          pageCount={totalPages}
          marginPagesDisplayed={1}
          pageRangeDisplayed={3}
          onPageChange={handlePageChange}
          containerClassName="sup-pagination"
          pageClassName="page-item"
          activeClassName="active"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakClassName="page-item"
          breakLinkClassName="page-link"
          disabledClassName="disabled"
        />
      )}

      {/* ── LEDGER MODAL ── */}
      {ledgerOpen && (
        <div className="ldg-overlay" onClick={() => setLedgerOpen(false)}>
          <div className="ldg-modal" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="ldg-head">
              <div className="ldg-head-icon"><i className="fas fa-book-open"></i></div>
              <div>
                <div className="ldg-head-title">
                  {ledgerLoading ? 'Loading…' : ledgerData?.supplier?.full_name} — Ledger
                </div>
                <div className="ldg-head-sub">Payment history &amp; outstanding balance</div>
              </div>
              <button className="ldg-head-close" onClick={() => setLedgerOpen(false)}>&times;</button>
            </div>

            {ledgerLoading ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', fontSize: 14, padding: 40 }}>
                <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }}></i> Loading ledger…
              </div>
            ) : ledgerData && (
              <>
                {/* Summary Cards */}
                <div className="ldg-summary">
                  <div className="ldg-card">
                    <div className="ldg-card-label">Opening Balance</div>
                    <div className="ldg-card-val">Rs. {parseFloat(ledgerData.summary.opening_balance).toLocaleString('en-PK', { minimumFractionDigits: 0 })}</div>
                  </div>
                  <div className="ldg-card">
                    <div className="ldg-card-label">Stock Remaining</div>
                    <div className="ldg-card-val debit">Rs. {parseFloat(ledgerData.summary.total_stock_remaining).toLocaleString('en-PK', { minimumFractionDigits: 0 })}</div>
                  </div>
                  <div className="ldg-card">
                    <div className="ldg-card-label">Total Paid</div>
                    <div className="ldg-card-val credit">Rs. {parseFloat(ledgerData.summary.total_paid).toLocaleString('en-PK', { minimumFractionDigits: 0 })}</div>
                  </div>
                  <div className="ldg-card balance-card">
                    <div className="ldg-card-label">Net Balance Due</div>
                    <div className="ldg-card-val balance">Rs. {parseFloat(ledgerData.summary.net_balance).toLocaleString('en-PK', { minimumFractionDigits: 0 })}</div>
                  </div>
                </div>

                {/* Body */}
                <div className="ldg-body">

                  {/* Left — stock entries + payment history */}
                  <div className="ldg-left">

                    {/* Stock Invoices */}
                    {/* <div>
                      <div className="ldg-section-title"><i className="fas fa-boxes"></i> Stock Invoices</div>
                      {ledgerData.stocks.length === 0 ? (
                        <div className="ldg-empty">No stock invoices found for this supplier</div>
                      ) : (
                        <table className="ldg-tbl">
                          <thead>
                            <tr>
                              <th>Invoice #</th>
                              <th>Date</th>
                              <th>Total Purchase</th>
                              <th>Advance Paid</th>
                              <th>Remaining</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ledgerData.stocks.map((s, i) => {
                              const rem = parseFloat(s.remaining_amount || 0);
                              return (
                                <tr key={i}>
                                  <td style={{ fontWeight: 700, color: '#4c1d95' }}>{s.invoice_no}</td>
                                  <td>{fmtDate(s.stock_date)}</td>
                                  <td style={{ fontWeight: 700 }}>Rs. {parseFloat(s.total_purchase || 0).toLocaleString('en-PK', { minimumFractionDigits: 0 })}</td>
                                  <td>
                                    <span className="ldg-pay-chip">Rs. {parseFloat(s.advance_payment || 0).toLocaleString('en-PK', { minimumFractionDigits: 0 })}</span>
                                  </td>
                                  <td>
                                    <span className={`ldg-rem-chip${rem <= 0 ? ' zero' : ''}`}>
                                      Rs. {rem.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={2}>Total</td>
                              <td>Rs. {ledgerData.stocks.reduce((s, r) => s + parseFloat(r.total_purchase || 0), 0).toLocaleString('en-PK', { minimumFractionDigits: 0 })}</td>
                              <td>Rs. {ledgerData.stocks.reduce((s, r) => s + parseFloat(r.advance_payment || 0), 0).toLocaleString('en-PK', { minimumFractionDigits: 0 })}</td>
                              <td>Rs. {ledgerData.summary.total_stock_remaining.toLocaleString('en-PK', { minimumFractionDigits: 0 })}</td>
                            </tr>
                          </tfoot>
                        </table>
                      )}
                    </div> */}

                    {/* Full Ledger (In/Out) */}
                    <div>
                      <div className="ldg-section-title"><i className="fas fa-balance-scale"></i> Full Ledger (In / Out)</div>
                      {(() => {
                        const fmt = (n) => Number(n).toLocaleString('en-PK', { minimumFractionDigits: 0 });
                        const events = [];
                        const opening = parseFloat(ledgerData.summary.opening_balance || 0);
                        if (opening !== 0) {
                          events.push({
                            date: null,
                            sortKey: '0000-00-00-0',
                            type: 'opening',
                            ref: '—',
                            desc: 'Opening Balance (carried forward)',
                            amount: opening,
                            outAmt: 0,
                            isOpening: true,
                          });
                        }
                        ledgerData.stocks.forEach((s, i) => {
                          const dateStr = s.stock_date ? new Date(s.stock_date).toISOString().split('T')[0] : '0000-00-00';
                          const purchase = parseFloat(s.total_purchase || 0);
                          const adv = parseFloat(s.advance_payment || 0);
                          if (purchase <= 0 && adv <= 0) return;
                          // If advance > 0 → show advance in Out.
                          // If advance == 0 → no advance recorded means full payment was made,
                          //                   so show the full purchase amount in Out.
                          const outAmt = adv > 0 ? adv : purchase;
                          events.push({
                            date: s.stock_date,
                            sortKey: `${dateStr}-1-${i}`,
                            type: 'stock',
                            ref: s.invoice_no,
                            desc: adv > 0
                              ? `Stock Purchase (advance Rs. ${fmt(adv)} paid)`
                              : `Stock Purchase (no advance — full Rs. ${fmt(purchase)} paid out)`,
                            amount: purchase,
                            outAmt,
                            isStock: true,
                          });
                        });
                        ledgerData.payments.forEach((p, i) => {
                          const dateStr = p.payment_date ? new Date(p.payment_date).toISOString().split('T')[0] : '0000-00-00';
                          events.push({
                            date: p.payment_date,
                            sortKey: `${dateStr}-2-${i}`,
                            type: 'payment',
                            ref: `#${p.id}`,
                            desc: p.notes || 'Payment to supplier',
                            amount: parseFloat(p.amount || 0),
                            outAmt: parseFloat(p.amount || 0),
                            isPayment: true,
                          });
                        });
                        events.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

                        let running = 0;
                        let totalAmount = 0;
                        let totalOut = 0;
                        const rows = events.map((ev, idx) => {
                          const inAmt = ev.isOpening ? 0 : running; // carry forward previous balance
                          let newBalance;
                          if (ev.isOpening) {
                            newBalance = ev.amount;
                          } else if (ev.isStock) {
                            newBalance = inAmt + ev.amount - ev.outAmt;
                          } else {
                            newBalance = inAmt - ev.outAmt;
                          }
                          totalAmount += ev.amount;
                          totalOut += ev.outAmt;
                          running = newBalance;
                          return { ...ev, inAmt, balance: newBalance, idx };
                        });

                        if (rows.length === 0) {
                          return <div className="ldg-empty">No ledger activity yet</div>;
                        }

                        return (
                          <table className="ldg-full-tbl">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Ref</th>
                                <th>Description</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                                <th style={{ textAlign: 'right' }}>In</th>
                                <th style={{ textAlign: 'right' }}>Out</th>
                                <th style={{ textAlign: 'right' }}>Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((r) => (
                                <tr key={r.idx}>
                                  <td style={{ color: '#9ca3af', fontWeight: 700 }}>{r.idx + 1}</td>
                                  <td>{r.date ? fmtDate(r.date) : '—'}</td>
                                  <td>
                                    <span className={`ldg-type-chip ${r.type}`}>
                                      {r.type === 'opening' ? 'Opening'
                                        : r.type === 'stock' ? 'Stock'
                                        : 'Payment'}
                                    </span>
                                  </td>
                                  <td style={{ fontWeight: 700, color: '#4c1d95' }}>{r.ref}</td>
                                  <td style={{ color: '#6b7280' }}>{r.desc}</td>
                                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>
                                    {r.amount > 0 ? `Rs. ${fmt(r.amount)}` : '—'}
                                  </td>
                                  <td style={{ textAlign: 'right' }} className={r.inAmt > 0 ? 'ldg-in' : ''}>
                                    {r.inAmt > 0 ? `Rs. ${fmt(r.inAmt)}` : '—'}
                                  </td>
                                  <td style={{ textAlign: 'right' }} className={r.outAmt > 0 ? 'ldg-out' : ''}>
                                    {r.outAmt > 0 ? `Rs. ${fmt(r.outAmt)}` : '—'}
                                  </td>
                                  <td style={{ textAlign: 'right' }} className={`ldg-bal ${r.balance <= 0 ? 'zero' : ''}`}>
                                    Rs. {fmt(r.balance)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td colSpan={5} style={{ textAlign: 'right' }}>Totals</td>
                                <td style={{ textAlign: 'right' }}>Rs. {fmt(totalAmount)}</td>
                                <td></td>
                                <td style={{ textAlign: 'right' }} className="ldg-out">Rs. {fmt(totalOut)}</td>
                                <td style={{ textAlign: 'right' }} className={`ldg-bal ${running <= 0 ? 'zero' : ''}`}>
                                  Rs. {fmt(running)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        );
                      })()}
                    </div>

                    {/* Payment History */}
                    <div>
                      <div className="ldg-section-title"><i className="fas fa-receipt"></i> Payment History</div>
                      {ledgerData.payments.length === 0 ? (
                        <div className="ldg-empty">No payments recorded yet</div>
                      ) : (
                        <table className="ldg-tbl">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Amount</th>
                              <th>Notes</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {ledgerData.payments.map((p) => (
                              <tr key={p.id} style={editingPaymentId === p.id ? { background: '#fef3c7' } : undefined}>
                                <td>{fmtDate(p.payment_date)}</td>
                                <td>
                                  <span className="ldg-pay-chip">Rs. {parseFloat(p.amount).toLocaleString('en-PK', { minimumFractionDigits: 0 })}</span>
                                </td>
                                <td style={{ color: '#6b7280' }}>{p.notes || '—'}</td>
                                <td style={{ whiteSpace: 'nowrap' }}>
                                  <button className="ldg-edt-btn" onClick={() => startEditPayment(p)} title="Edit">
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button className="ldg-del-btn" onClick={() => handleDeletePayment(p.id)} title="Delete">
                                    <i className="fas fa-trash-alt"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td>Total Paid</td>
                              <td>Rs. {ledgerData.summary.total_paid.toLocaleString('en-PK', { minimumFractionDigits: 0 })}</td>
                              <td colSpan={2}></td>
                            </tr>
                          </tfoot>
                        </table>
                      )}
                    </div>

                  </div>

                  {/* Right — Add / Edit Payment Form */}
                  <div className="ldg-right">
                    <div className="ldg-form-title">
                      <i className={editingPaymentId ? 'fas fa-edit' : 'fas fa-plus-circle'}></i>
                      {editingPaymentId ? ' Edit Payment' : ' Add Payment'}
                    </div>

                    {editingPaymentId && (
                      <div className="ldg-edit-banner">
                        <i className="fas fa-pen"></i> Editing payment #{editingPaymentId}
                      </div>
                    )}

                    <div className="ldg-field">
                      <label>Payment Date</label>
                      <input
                        className="ldg-finput"
                        type="date"
                        value={payForm.payment_date}
                        onChange={e => setPayForm(p => ({ ...p, payment_date: e.target.value }))}
                      />
                    </div>
                    <div className="ldg-field">
                      <label>Amount (Rs.) *</label>
                      <input
                        className="ldg-finput"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={payForm.amount}
                        onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))}
                      />
                    </div>
                    <div className="ldg-field">
                      <label>Notes</label>
                      <textarea
                        className="ldg-finput"
                        rows={3}
                        placeholder="Cash, cheque, bank transfer…"
                        value={payForm.notes}
                        onChange={e => setPayForm(p => ({ ...p, notes: e.target.value }))}
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    <button
                      className="ldg-pay-btn"
                      onClick={handleAddPayment}
                      disabled={paySubmitting}
                      style={editingPaymentId ? { background: 'linear-gradient(135deg,#d97706,#f59e0b)' } : undefined}
                    >
                      {paySubmitting
                        ? <><i className="fas fa-spinner fa-spin"></i> Saving…</>
                        : editingPaymentId
                          ? <><i className="fas fa-save"></i> Update Payment</>
                          : <><i className="fas fa-check-circle"></i> Record Payment</>
                      }
                    </button>

                    {editingPaymentId && (
                      <button className="ldg-cancel-btn" onClick={resetPayForm} type="button">
                        <i className="fas fa-times"></i> Cancel Edit
                      </button>
                    )}

                    {/* Balance reminder */}
                    <div style={{ marginTop: 16, padding: '10px 12px', background: '#faf5ff', border: '1px solid #ddd6fe', borderRadius: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 6 }}>Current Balance</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: ledgerData.summary.net_balance > 0 ? '#b91c1c' : '#16a34a' }}>
                        Rs. {parseFloat(ledgerData.summary.net_balance).toLocaleString('en-PK', { minimumFractionDigits: 0 })}
                      </div>
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>
                        {ledgerData.summary.net_balance > 0 ? 'Still owed to supplier' : 'Fully settled'}
                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="sup-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="sup-modal" onClick={e => e.stopPropagation()}>

            <div className="sup-modal-head">
              <div className="sup-modal-head-icon">
                <i className={isEditing ? 'fas fa-edit' : 'fas fa-plus'}></i>
              </div>
              <div>
                <div className="sup-modal-head-title">{isEditing ? 'Edit Supplier' : 'Add New Supplier'}</div>
                <div className="sup-modal-head-sub">{isEditing ? `Updating ${editFormData.full_name}` : 'Fill in the supplier details'}</div>
              </div>
              <button className="sup-modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <div className="sup-modal-body">
              <div className="sup-section-label"><i className="fas fa-id-card"></i> Contact Details</div>

              <div className="sup-field">
                <label>Supplier Name *</label>
                <input
                  className={`sup-finput${submitted && !editFormData.full_name ? ' invalid' : ''}`}
                  type="text"
                  placeholder="e.g. Ali Traders"
                  value={editFormData.full_name}
                  onChange={e => setEditFormData(p => ({ ...p, full_name: e.target.value }))}
                />
                {submitted && !editFormData.full_name && <div className="sup-err-text">Name is required</div>}
              </div>

              <div className="sup-frow">
                <div className="sup-field">
                  <label>Phone # *</label>
                  <input
                    className={`sup-finput${submitted && !editFormData.phone_no ? ' invalid' : ''}`}
                    type="text"
                    placeholder="0300-1234567"
                    value={editFormData.phone_no}
                    onChange={e => handlePhoneChange(e.target.value)}
                    maxLength={12}
                  />
                  {submitted && !editFormData.phone_no && <div className="sup-err-text">Phone is required</div>}
                </div>
                <div className="sup-field">
                  <label>Account #</label>
                  <input
                    className="sup-finput"
                    type="text"
                    placeholder="Bank account or ref"
                    value={editFormData.account_no}
                    onChange={e => setEditFormData(p => ({ ...p, account_no: e.target.value }))}
                  />
                </div>
              </div>

              <div className="sup-divider"></div>
              <div className="sup-section-label"><i className="fas fa-wallet"></i> Financial</div>

              <div className="sup-field">
                <label>Last Remaining Amount (Rs.)</label>
                <input
                  className="sup-finput"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={editFormData.remaining_amount}
                  onChange={e => setEditFormData(p => ({ ...p, remaining_amount: e.target.value }))}
                />
              </div>

              <button
                className={`sup-submit${isEditing ? ' editing' : ''}`}
                onClick={handleSubmit}
              >
                {isEditing
                  ? <><i className="fas fa-save"></i> Update Supplier</>
                  : <><i className="fas fa-plus-circle"></i> Add Supplier</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Supplier;
