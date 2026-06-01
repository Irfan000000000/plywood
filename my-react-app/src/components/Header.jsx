import React from 'react';
import authService from './services/authService';
import { useAuth } from './AuthContext';

function Header() {
  const { user } = useAuth();

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  if (!user) return null;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1100,
      background: 'linear-gradient(135deg, #3b0764 0%, #4c1d95 100%)',
      boxShadow: '0 2px 8px rgba(59,7,100,.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '6px 16px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{
          width: 30, height: 30,
          background: 'rgba(255,255,255,.15)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fde68a', fontSize: 14,
        }}>
          <i className="fas fa-cut"></i>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>Beauty POS</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', lineHeight: 1 }}>Hair Salon Management</div>
        </div>
      </div>

      {/* Username + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px',
          background: 'rgba(255,255,255,.13)',
          border: '1px solid rgba(255,255,255,.22)',
          borderRadius: 20,
          fontSize: 12, fontWeight: 600, color: '#fde68a',
        }}>
          <i className="fas fa-user-circle"></i>
          {user.user.full_name || user.user.username || user.user.user_type}
          <span style={{
            fontSize: 10, fontWeight: 500,
            color: 'rgba(255,255,255,.65)',
            background: 'rgba(255,255,255,.1)',
            borderRadius: 10, padding: '1px 7px',
          }}>
            {user.user.user_type}
          </span>
        </span>

        <button
          onClick={handleLogout}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '5px 13px',
            background: 'rgba(239,68,68,.2)',
            border: '1px solid rgba(239,68,68,.4)',
            borderRadius: 6,
            fontSize: 12, fontWeight: 600, color: '#fca5a5',
            cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.38)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,.2)'}
        >
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
