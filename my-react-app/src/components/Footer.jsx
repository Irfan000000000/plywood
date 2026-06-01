import React, { useState, useEffect } from 'react';
import authService from './services/authService';
import { useAuth } from './AuthContext';
import { usePOS } from './POSContext';

function Footer() {
  const { user } = useAuth();
  const { openSection, openCheckout, cartCount } = usePOS();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isAdmin = user?.user.user_type !== 'Receptionist';

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  return (
    <footer style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <style>{`
        .footer-wrap {
          background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%);
          box-shadow: 0 -3px 12px rgba(76,29,149,.35);
          z-index: 1000;
          flex-shrink: 0;
        }

        /* ── NAV BUTTONS ROW ── */
        .footer-nav {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px;
          padding: 7px 14px;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-right: 10px;
          padding-right: 12px;
          border-right: 1px solid rgba(255,255,255,.25);
          flex-shrink: 0;
        }
        .footer-brand-icon {
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,.15);
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          color: #fde68a;
        }
        .footer-brand-name { font-size: 12px; font-weight: 800; color: #fff; line-height: 1.2; }
        .footer-brand-sub  { font-size: 10px; color: rgba(255,255,255,.65); }

        .fnav-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 11px;
          background: rgba(255,255,255,.13);
          color: #fff;
          border: 1px solid rgba(255,255,255,.2);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background .15s;
          text-decoration: none;
          white-space: nowrap;
        }
        .fnav-btn:hover { background: rgba(255,255,255,.26); color: #fff; text-decoration: none; }
        .fnav-btn:disabled { opacity: .4; cursor: not-allowed; }

        .fnav-btn.accent {
          background: #f59e0b;
          color: #1a1a1a;
          border-color: #d97706;
          font-weight: 700;
        }
        .fnav-btn.accent:hover { background: #d97706; color: #fff; }
        .fnav-btn.accent:disabled { background: #9ca3af; border-color: #9ca3af; color: #fff; cursor: not-allowed; }

        .fnav-cart-badge {
          background: #fff;
          color: #7c3aed;
          font-size: 10px;
          font-weight: 800;
          border-radius: 10px;
          padding: 1px 6px;
          margin-left: 2px;
        }

        .fnav-sep {
          width: 1px;
          height: 20px;
          background: rgba(255,255,255,.25);
          flex-shrink: 0;
          margin: 0 4px;
        }

        .fnav-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          padding-left: 10px;
          border-left: 1px solid rgba(255,255,255,.2);
        }
        .fnav-user-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 11px;
          background: rgba(255,255,255,.13);
          border: 1px solid rgba(255,255,255,.2);
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          color: #fde68a;
          white-space: nowrap;
        }
        .fnav-logout {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          background: rgba(239,68,68,.2);
          border: 1px solid rgba(239,68,68,.4);
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #fca5a5;
          cursor: pointer;
          text-decoration: none;
          white-space: nowrap;
          transition: background .15s;
        }
        .fnav-logout:hover { background: rgba(239,68,68,.38); color: #fff; text-decoration: none; }

        @media (max-width: 768px) {
          .footer-nav { padding: 6px 10px; gap: 3px; }
          .footer-info { flex-direction: column; align-items: flex-start; padding: 6px 10px; }
          .fnav-btn { font-size: 11px; padding: 4px 8px; }
        }
      `}</style>

      <div className="footer-wrap">

        {/* ── NAV BUTTONS ── */}
        <div className="footer-nav">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-brand-icon"><i className="fas fa-cut"></i></div>
            <div>
              <div className="footer-brand-name">POS</div>
              <div className="footer-brand-sub">ZeeTech</div>
            </div>
          </div>


          <button className="fnav-btn" onClick={() => openSection("medicine")}> + New Item</button>
          <button className="fnav-btn" onClick={() => openSection("stock")}><i className="fas fa-truck"></i> Create Stock</button>


          {isAdmin && <>
            <button className="fnav-btn d-none" onClick={() => openSection("stock_report")}><i className="fas fa-chart-line"></i> Stock Report</button>
            <button className="fnav-btn" onClick={() => openSection("income_report")}><i className="fas fa-hand-holding-usd"></i> Income Report</button>
          </>}

          <button className="fnav-btn" onClick={() => openSection("invoice")}><i className="fas fa-receipt"></i> Invoices</button>
          <button className="fnav-btn" onClick={() => openSection("add_expense")}><i className="fas fa-minus-circle"></i> Expense</button>
          <button className="fnav-btn" onClick={() => openSection("add_transactions")}><i className="fas fa-exchange-alt"></i> Transactions</button>
          <button className="fnav-btn" onClick={() => openSection("bank_accounts")}><i className="fas fa-credit-card"></i> Bank</button>
          <button className="fnav-btn" onClick={() => openSection("heads")}><i className="fas fa-wallet"></i> Heads</button>
          <button className="fnav-btn" onClick={() => openSection("staff_management")}><i className="fas fa-users"></i> Staff</button>
          <button className="fnav-btn" onClick={() => openSection("staff_salary")}><i className="fas fa-money-bill"></i> Salary</button>
          <button className="fnav-btn" onClick={() => openSection("grand_ledger")}><i className="fas fa-balance-scale"></i> Grand Ledger</button>
          <button className="fnav-btn" onClick={() => openSection("printer_settings")}><i className="fas fa-print"></i> Printer</button>

          {/* <div className="fnav-sep"></div> */}

          <button
            className="fnav-btn accent d-none"
            onClick={openCheckout}
            disabled={cartCount === 0}>
            <i className="fas fa-cash-register"></i>
            Checkout
            {cartCount > 0 && <span className="fnav-cart-badge">{cartCount}</span>}
          </button>

          {/* User + Logout — pushed to far right */}
          <div className="fnav-right">
            <span className="fnav-user-pill">
              <i className="fas fa-user-circle"></i>
              {/* user?.user.full_name ||  */}
              {user?.user.username || user?.user.user_type}
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', background: 'rgba(255,255,255,.1)', borderRadius: 10, padding: '1px 6px' }}>
                {user?.user.user_type}
              </span>
            </span>
            <a href="#" className="fnav-logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
