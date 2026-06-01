import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const StaffManagement = ({ onClose }) => {
  const [staffList, setStaffList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    cnic: "",
    phone_no: "",
    salary: "",
    commission_rate: 0,
    date_joined: new Date().toISOString().split('T')[0],
    status: "active"
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/staff`);
      setStaffList(response.data.results || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to fetch staff list");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format CNIC as 12345-1234567-1
    if (name === "cnic") {
      let formatted = value.replace(/\D/g, "");
      if (formatted.length > 5) {
        formatted = formatted.slice(0, 5) + "-" + formatted.slice(5);
      }
      if (formatted.length > 13) {
        formatted = formatted.slice(0, 13) + "-" + formatted.slice(13);
      }
      if (formatted.length > 15) {
        formatted = formatted.slice(0, 15);
      }
      setFormData({ ...formData, [name]: formatted });
    }
    // Format phone number
    else if (name === "phone_no") {
      let input = value.replace(/\D/g, "");
      if (!input.startsWith("92") && input.length > 0) {
        input = "92" + input;
      }
      if (input.length > 12) {
        input = input.slice(0, 12);
      }
      setFormData({ ...formData, [name]: input });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.cnic) {
      toast.error("Name and CNIC are required!");
      return;
    }

    setLoading(true);
    try {
      if (editingStaff) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/staff/${editingStaff.id}`, formData);
        toast.success("Staff updated successfully!");
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/staff`, formData);
        toast.success("Staff added successfully!");
      }
      
      fetchStaff();
      closeModal();
    } catch (error) {
      console.error("Error saving staff:", error);
      toast.error(error.response?.data?.error || "Failed to save staff");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name || "",
      age: staff.age || "",
      cnic: staff.cnic || "",
      phone_no: staff.phone_no || "",
      salary: staff.salary || "",
      commission_rate: staff.commission_rate || "",
      date_joined: staff.date_joined ? staff.date_joined.split('T')[0] : "",
      status: staff.status || "active"
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/staff/${id}`);
      toast.success("Staff deleted successfully!");
      fetchStaff();
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error("Failed to delete staff");
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setEditingStaff(null);
    setFormData({
      name: "",
      age: "",
      cnic: "",
      phone_no: "",
      salary: "",
      commission_rate: "",
      date_joined: new Date().toISOString().split('T')[0],
      status: "active"
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const filteredStaff = staffList.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.cnic.includes(searchTerm) ||
    (staff.phone_no && staff.phone_no.includes(searchTerm))
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: '#faf5ff', minHeight: '100%' }}>
      <style>{`
        /* ── TOP BAR ── */
        .sm-topbar {
          background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 2px 8px rgba(76,29,149,.3);
        }
        .sm-topbar-icon {
          width: 32px; height: 32px;
          background: rgba(255,255,255,.15);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: #fde68a; font-size: 15px;
        }
        .sm-topbar-title { font-size: 14px; font-weight: 800; color: #fff; }
        .sm-topbar-sub   { font-size: 11px; color: rgba(255,255,255,.65); }
        .sm-topbar-count {
          margin-left: auto;
          background: rgba(255,255,255,.15);
          border: 1px solid rgba(255,255,255,.25);
          color: #fde68a;
          padding: 3px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
        }

        /* ── TOOLBAR ── */
        .sm-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: #fff;
          border-bottom: 1px solid #e9d5ff;
        }
        .sm-search-wrap {
          flex: 1;
          position: relative;
          max-width: 380px;
        }
        .sm-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #a78bfa;
          font-size: 13px;
        }
        .sm-search {
          width: 100%;
          padding: 7px 10px 7px 32px;
          border: 1px solid #ddd6fe;
          border-radius: 8px;
          font-size: 12px;
          outline: none;
          box-sizing: border-box;
          color: #1e1b4b;
        }
        .sm-search:focus { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124,58,237,.12); }
        .sm-add-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 16px;
          background: linear-gradient(135deg, #4c1d95, #7c3aed);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity .15s;
        }
        .sm-add-btn:hover { opacity: .88; }

        /* ── TABLE ── */
        .sm-table-wrap {
          padding: 14px;
          overflow-x: auto;
        }
        .sm-tbl {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 6px rgba(76,29,149,.1);
        }
        .sm-tbl thead tr {
          background: linear-gradient(135deg, #4c1d95, #7c3aed);
        }
        .sm-tbl th {
          padding: 10px 12px;
          text-align: left;
          font-size: 10px;
          font-weight: 800;
          color: #fde68a;
          text-transform: uppercase;
          letter-spacing: .5px;
          white-space: nowrap;
        }
        .sm-tbl td {
          padding: 9px 12px;
          font-size: 12px;
          color: #374151;
          border-bottom: 1px solid #f3f0ff;
        }
        .sm-tbl tbody tr:last-child td { border-bottom: none; }
        .sm-tbl tbody tr:hover td { background: #faf5ff; }
        .sm-name { font-weight: 700; color: #4c1d95; display: flex; align-items: center; gap: 8px; }
        .sm-avatar {
          width: 30px; height: 30px;
          background: linear-gradient(135deg, #7c3aed, #4c1d95);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fde68a; font-size: 12px; flex-shrink: 0;
        }
        .sm-badge-active   { background: #dcfce7; color: #15803d; padding: 2px 9px; border-radius: 10px; font-size: 10px; font-weight: 700; }
        .sm-badge-inactive { background: #fee2e2; color: #b91c1c; padding: 2px 9px; border-radius: 10px; font-size: 10px; font-weight: 700; }
        .sm-salary-val { font-weight: 700; color: #7c3aed; }
        .sm-btn-edit {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px;
          background: rgba(245,158,11,.12);
          color: #d97706;
          border: 1px solid rgba(245,158,11,.3);
          border-radius: 6px;
          font-size: 11px; font-weight: 600;
          cursor: pointer;
          margin-right: 5px;
          transition: background .15s;
        }
        .sm-btn-edit:hover { background: rgba(245,158,11,.25); }
        .sm-btn-del {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px;
          background: rgba(239,68,68,.1);
          color: #dc2626;
          border: 1px solid rgba(239,68,68,.25);
          border-radius: 6px;
          font-size: 11px; font-weight: 600;
          cursor: pointer;
          transition: background .15s;
        }
        .sm-btn-del:hover { background: rgba(239,68,68,.2); }

        /* ── EMPTY / LOADING ── */
        .sm-empty {
          text-align: center;
          padding: 50px 20px;
          color: #a78bfa;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 1px 6px rgba(76,29,149,.08);
        }
        .sm-empty-icon { font-size: 36px; margin-bottom: 10px; }
        .sm-empty-text { font-size: 13px; color: #9ca3af; }

        /* ── MODAL ── */
        .sm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .sm-modal {
          background: #fff;
          border-radius: 14px;
          width: 560px;
          max-width: 95vw;
          max-height: 92vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(76,29,149,.25);
        }
        .sm-modal-head {
          background: linear-gradient(135deg, #4c1d95, #7c3aed);
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .sm-modal-head-icon {
          width: 32px; height: 32px;
          background: rgba(255,255,255,.15);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          color: #fde68a; font-size: 14px;
        }
        .sm-modal-head-title { font-size: 14px; font-weight: 800; color: #fff; }
        .sm-modal-head-sub   { font-size: 11px; color: rgba(255,255,255,.65); }
        .sm-modal-close {
          margin-left: auto;
          width: 28px; height: 28px;
          background: rgba(255,255,255,.15);
          border: 1px solid rgba(255,255,255,.25);
          border-radius: 6px;
          color: #fff; font-size: 16px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .sm-modal-close:hover { background: rgba(255,255,255,.28); }
        .sm-modal-body {
          padding: 18px;
          overflow-y: auto;
          flex: 1;
        }

        /* ── FORM ── */
        .sm-field { margin-bottom: 12px; }
        .sm-field label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: #7c3aed;
          text-transform: uppercase;
          letter-spacing: .4px;
          margin-bottom: 4px;
        }
        .sm-finput {
          width: 100%;
          padding: 7px 10px;
          border: 1px solid #ddd6fe;
          border-radius: 7px;
          font-size: 12px;
          color: #1e1b4b;
          outline: none;
          box-sizing: border-box;
          transition: border .15s;
          font-family: inherit;
        }
        .sm-finput:focus { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124,58,237,.12); }
        .sm-frow { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .sm-divider {
          height: 1px; background: #ede9fe;
          margin: 14px 0 12px;
        }
        .sm-section-label {
          font-size: 10px; font-weight: 800; color: #8b5cf6;
          text-transform: uppercase; letter-spacing: .5px;
          margin-bottom: 10px;
          display: flex; align-items: center; gap: 7px;
        }
        .sm-section-label::after { content: ''; flex: 1; height: 1px; background: #ede9fe; }
        .sm-submit {
          width: 100%;
          margin-top: 16px;
          padding: 10px;
          background: linear-gradient(135deg, #059669, #10b981);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: opacity .15s;
        }
        .sm-submit.editing { background: linear-gradient(135deg, #d97706, #f59e0b); color: #1a1a1a; }
        .sm-submit:disabled { opacity: .5; cursor: not-allowed; }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="sm-topbar">
        <div className="sm-topbar-icon"><i className="fas fa-users"></i></div>
        <div>
          <div className="sm-topbar-title">Staff Management</div>
          <div className="sm-topbar-sub">Manage salon staff members</div>
        </div>
        <div className="sm-topbar-count">
          {filteredStaff.length} member{filteredStaff.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="sm-toolbar">
        <div className="sm-search-wrap">
          <i className="fas fa-search sm-search-icon"></i>
          <input
            className="sm-search"
            type="text"
            placeholder="Search by name, CNIC or phone…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="sm-add-btn" onClick={openModal}>
          <i className="fas fa-user-plus"></i> Add Staff
        </button>
      </div>

      {/* ── TABLE ── */}
      <div className="sm-table-wrap">
        {loading ? (
          <div className="sm-empty">
            <div className="sm-empty-icon"><i className="fas fa-spinner fa-spin"></i></div>
            <div className="sm-empty-text">Loading staff…</div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="sm-empty">
            <div className="sm-empty-icon"><i className="fas fa-user-slash"></i></div>
            <div className="sm-empty-text">
              {searchTerm ? 'No staff match your search' : 'No staff members yet — click Add Staff to get started'}
            </div>
          </div>
        ) : (
          <table className="sm-tbl">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>CNIC</th>
                <th>Phone</th>
                <th>Salary</th>
                <th>Date Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map(staff => (
                <tr key={staff.id}>
                  <td>
                    <div className="sm-name">
                      <div className="sm-avatar"><i className="fas fa-user"></i></div>
                      {staff.name}
                    </div>
                  </td>
                  <td>{staff.age || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{staff.cnic}</td>
                  <td>{staff.phone_no || '—'}</td>
                  <td className="sm-salary-val">Rs. {parseFloat(staff.salary || 0).toFixed(0)}</td>
                  <td>{staff.date_joined ? new Date(staff.date_joined).toLocaleDateString() : '—'}</td>
                  <td>
                    <span className={staff.status === 'active' ? 'sm-badge-active' : 'sm-badge-inactive'}>
                      {staff.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="sm-btn-edit" onClick={() => handleEdit(staff)}>
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button className="sm-btn-del" onClick={() => handleDelete(staff.id)}>
                      <i className="fas fa-trash-alt"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="sm-overlay" onClick={closeModal}>
          <div className="sm-modal" onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="sm-modal-head">
              <div className="sm-modal-head-icon">
                <i className={editingStaff ? 'fas fa-user-edit' : 'fas fa-user-plus'}></i>
              </div>
              <div>
                <div className="sm-modal-head-title">{editingStaff ? 'Edit Staff Member' : 'Add New Staff'}</div>
                <div className="sm-modal-head-sub">{editingStaff ? `Updating ${editingStaff.name}` : 'Fill in the details below'}</div>
              </div>
              <button className="sm-modal-close" onClick={closeModal}>&times;</button>
            </div>

            {/* Modal Body */}
            <div className="sm-modal-body">

              <div className="sm-section-label"><i className="fas fa-id-card"></i> Personal Info</div>

              <div className="sm-field">
                <label>Full Name *</label>
                <input className="sm-finput" type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter full name" />
              </div>

              <div className="sm-frow">
                <div className="sm-field">
                  <label>Age</label>
                  <input className="sm-finput" type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="25" min="18" max="100" />
                </div>
                <div className="sm-field">
                  <label>CNIC *</label>
                  <input className="sm-finput" type="text" name="cnic" value={formData.cnic} onChange={handleInputChange} placeholder="12345-1234567-1" />
                </div>
              </div>

              <div className="sm-field">
                <label>Phone Number</label>
                <input className="sm-finput" type="text" name="phone_no" value={formData.phone_no} onChange={handleInputChange} placeholder="923001234567" />
              </div>

              <div className="sm-divider"></div>
              <div className="sm-section-label"><i className="fas fa-briefcase"></i> Employment Details</div>

              <div className="sm-frow">
                <div className="sm-field">
                  <label>Salary (Rs.)</label>
                  <input className="sm-finput" type="number" name="salary" value={formData.salary} onChange={handleInputChange} placeholder="30000" min="0" step="0.01" />
                </div>
                <div className="sm-field d-none">
                  <label>Commission Rate (%)</label>
                  <input className="sm-finput" type="number" name="commission_rate" value={formData.commission_rate} onChange={handleInputChange} placeholder="5.00" min="0" max="100" step="0.01" />
                </div>
              </div>

              <div className="sm-frow">
                <div className="sm-field">
                  <label>Date Joined</label>
                  <input className="sm-finput" type="date" name="date_joined" value={formData.date_joined} onChange={handleInputChange} />
                </div>
                <div className="sm-field">
                  <label>Status</label>
                  <select className="sm-finput" name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <button className={`sm-submit${editingStaff ? ' editing' : ''}`} onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><i className="fas fa-spinner fa-spin"></i> Saving…</>
                  : editingStaff
                    ? <><i className="fas fa-save"></i> Update Staff</>
                    : <><i className="fas fa-user-plus"></i> Add Staff Member</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;