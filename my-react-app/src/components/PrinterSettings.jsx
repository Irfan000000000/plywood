import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getCurrentUsername,
  getCurrentUserPrinter,
  fetchUserPrinter,
  saveUserPrinter,
} from "./services/printerService";

// LAN / shared printers are usually exposed as "\\PCNAME\PrinterName" (UNC).
// pdf-to-printer also sometimes returns them as "PrinterName on PCNAME".
const isNetworkPrinter = (name = "") =>
  /^\\\\/.test(name) || /\s+on\s+\\\\/i.test(name) || /\s+on\s+\S+/i.test(name);

function PrinterSettings({ onClose }) {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");
  const [savedName, setSavedName] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [filter, setFilter] = useState("all"); // all | local | network
  const [search, setSearch] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const username = getCurrentUsername();

  useEffect(() => {
    setLoading(true);
    // Start with whatever is cached from login response (fast paint),
    // then refresh from DB so other-PC changes appear too.
    const cached = getCurrentUserPrinter() || "";
    setSavedName(cached);
    setSelected(cached);

    const printerReq = axios
      .get(process.env.REACT_APP_API_URL + "/list-printers")
      .then((res) => {
        const list = res.data?.printers || [];
        setPrinters(list);
      })
      .catch(() => toast.error("Failed to load printer list from server"));

    const userReq = username
      ? fetchUserPrinter(username)
          .then((p) => {
            const v = p || "";
            setSavedName(v);
            setSelected((prev) => prev || v);
          })
          .catch(() => {/* keep cached */})
      : Promise.resolve();

    Promise.all([printerReq, userReq]).finally(() => setLoading(false));
  }, [refreshTick, username]);

  const normalized = useMemo(() => {
    return (printers || []).map((p, i) => {
      const name =
        typeof p === "string" ? p : p.name || p.deviceId || `Printer ${i + 1}`;
      return { name, type: isNetworkPrinter(name) ? "network" : "local" };
    });
  }, [printers]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return normalized.filter((p) => {
      if (filter === "local" && p.type !== "local") return false;
      if (filter === "network" && p.type !== "network") return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [normalized, filter, search]);

  const savedType = useMemo(() => {
    if (!savedName) return null;
    return isNetworkPrinter(savedName) ? "network" : "local";
  }, [savedName]);

  const save = async () => {
    if (!selected) {
      toast.error("Pehle aik printer select karein");
      return;
    }
    if (!username) {
      toast.error("Login required — apni ID se login karein phir save karein");
      return;
    }
    setSaving(true);
    try {
      const r = await saveUserPrinter(username, selected);
      if (r?.success) {
        setSavedName(selected);
        toast.success(
          `Saved: "${username}" ke login par hamesha "${selected}" par print hoga`
        );
      } else {
        toast.error(r?.error || "Save failed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.error || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    if (!username) {
      setSavedName("");
      setSelected("");
      return;
    }
    setSaving(true);
    try {
      const r = await saveUserPrinter(username, null);
      if (r?.success) {
        setSavedName("");
        setSelected("");
        toast.success("Printer setting clear ho gayi");
      } else {
        toast.error(r?.error || "Clear failed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.error || e.message || "Clear failed");
    } finally {
      setSaving(false);
    }
  };

  const testPrint = async () => {
    const target = selected || savedName;
    if (!target) {
      toast.error("Pehle aik printer select karein, phir test karein");
      return;
    }
    setTesting(true);
    try {
      const res = await axios.post(
        process.env.REACT_APP_API_URL + "/print-invoice",
        {
          invoiceData: [
            {
              item_name: "TEST PRINT",
              quantity: 1,
              price: 0,
              discount: 0,
            },
          ],
          grandTotal: "0.00",
          discountTotal: "0.00",
          netTotal: "0.00",
          advance: 0,
          balance: "0.00",
          printType: "all",
          printer: target,
          storeInfo: {
            name: "PRINTER TEST",
            address: username ? `User: ${username}` : "Printer Settings",
            phone: "—",
          },
        }
      );
      if (res.data?.success) {
        toast.success(`Test sent to "${res.data.printer || target}"`);
      } else {
        toast.error(res.data?.error || "Test print failed");
      }
    } catch (e) {
      toast.error(
        e?.response?.data?.error || e.message || "Test print failed"
      );
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Segoe UI',Tahoma,Geneva,Verdana,sans-serif",
        background: "#faf5ff",
        padding: 16,
      }}
    >
      <style>{`
        .pr-card { background:#fff; border:1.5px solid #ddd6fe; border-radius:12px; overflow:hidden; box-shadow:0 4px 14px rgba(124,58,237,.08); }
        .pr-head { background:linear-gradient(135deg,#4c1d95,#7c3aed); color:#fff; padding:12px 16px; display:flex; align-items:center; gap:10px; }
        .pr-head-icon { width:34px;height:34px;background:rgba(255,255,255,.15);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fde68a;font-size:15px; }
        .pr-head-title { font-size:14px; font-weight:800; line-height:1.2; }
        .pr-head-sub { font-size:11px; color:rgba(255,255,255,.65); }
        .pr-body { padding:16px; }
        .pr-info {
          background:#fef3c7; border:1px solid #fcd34d; color:#92400e;
          padding:9px 12px; border-radius:8px; font-size:11px; font-weight:600;
          margin-bottom:14px; display:flex; align-items:flex-start; gap:8px; line-height:1.45;
        }
        .pr-saved-banner {
          background:#dcfce7; border:1px solid #86efac; color:#15803d;
          padding:9px 12px; border-radius:8px; font-size:12px; font-weight:700;
          margin-bottom:14px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;
        }
        .pr-no-saved {
          background:#fee2e2; border:1px solid #fca5a5; color:#b91c1c;
          padding:9px 12px; border-radius:8px; font-size:12px; font-weight:700;
          margin-bottom:14px; display:flex; align-items:center; gap:8px;
        }
        .pr-label { display:block;font-size:10px;font-weight:800;color:#7c3aed;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px; }
        .pr-controls { display:flex; gap:8px; margin-bottom:10px; flex-wrap:wrap; align-items:center; }
        .pr-search {
          flex:1; min-width:180px; padding:8px 10px; border:1.5px solid #ddd6fe;
          border-radius:8px; font-size:12px; outline:none; color:#1e293b;
        }
        .pr-search:focus { border-color:#7c3aed; }
        .pr-tabs { display:inline-flex; background:#f5f3ff; border:1.5px solid #ddd6fe; border-radius:8px; padding:2px; }
        .pr-tab {
          padding:6px 12px; font-size:11px; font-weight:700;
          color:#7c3aed; background:transparent; border:none; border-radius:6px;
          cursor:pointer; transition:all .12s;
        }
        .pr-tab.active { background:#7c3aed; color:#fff; }
        .pr-list { border:1.5px solid #ddd6fe; border-radius:8px; max-height:280px; overflow-y:auto; background:#fff; }
        .pr-item {
          display:flex; align-items:center; gap:10px;
          padding:10px 12px; border-bottom:1px solid #f3e8ff; cursor:pointer;
          transition:background .12s; font-size:13px; color:#1e293b;
        }
        .pr-item:last-child { border-bottom:none; }
        .pr-item:hover { background:#f5f3ff; }
        .pr-item.selected { background:#ede9fe; font-weight:700; color:#4c1d95; }
        .pr-radio {
          width:16px; height:16px; border:2px solid #c4b5fd; border-radius:50%;
          flex-shrink:0; display:flex; align-items:center; justify-content:center;
        }
        .pr-radio.checked { border-color:#7c3aed; }
        .pr-radio.checked::after { content:''; width:8px; height:8px; background:#7c3aed; border-radius:50%; }
        .pr-badge {
          font-size:9px; font-weight:800; padding:2px 7px; border-radius:10px;
          letter-spacing:.4px; text-transform:uppercase;
        }
        .pr-badge-local   { background:#dbeafe; color:#1d4ed8; }
        .pr-badge-network { background:#fef3c7; color:#92400e; }
        .pr-badge-saved   { background:#dcfce7; color:#15803d; }
        .pr-empty { padding:24px; text-align:center; color:#9ca3af; font-size:12px; }
        .pr-actions { display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; }
        .pr-btn {
          display:inline-flex; align-items:center; gap:7px;
          padding:9px 16px; border:none; border-radius:8px;
          font-size:13px; font-weight:700; cursor:pointer; transition:all .15s;
        }
        .pr-btn-save {
          background:linear-gradient(135deg,#059669,#10b981); color:#fff;
          box-shadow:0 3px 10px rgba(16,185,129,.3);
        }
        .pr-btn-save:hover { background:linear-gradient(135deg,#047857,#059669); }
        .pr-btn-save:disabled { background:#d1d5db; cursor:not-allowed; box-shadow:none; }
        .pr-btn-test {
          background:linear-gradient(135deg,#2563eb,#3b82f6); color:#fff;
          box-shadow:0 3px 10px rgba(59,130,246,.3);
        }
        .pr-btn-test:hover { background:linear-gradient(135deg,#1d4ed8,#2563eb); }
        .pr-btn-test:disabled { background:#d1d5db; cursor:not-allowed; box-shadow:none; }
        .pr-btn-refresh {
          background:#f5f3ff; color:#7c3aed; border:1.5px solid #ddd6fe;
        }
        .pr-btn-refresh:hover { background:#ede9fe; }
        .pr-btn-clear {
          background:#fee2e2; color:#b91c1c; border:1.5px solid #fecaca;
        }
        .pr-btn-clear:hover { background:#fecaca; }
        .pr-btn-close {
          background:#f1f5f9; color:#475569; border:1.5px solid #e2e8f0; margin-left:auto;
        }
        .pr-btn-close:hover { background:#e2e8f0; }
        .pr-loading { padding:24px; text-align:center; color:#7c3aed; font-weight:700; font-size:13px; }
        .pr-counts { font-size:11px; color:#64748b; margin-left:auto; }
      `}</style>

      <div className="pr-card">
        <div className="pr-head">
          <div className="pr-head-icon">
            <i className="fas fa-print"></i>
          </div>
          <div>
            <div className="pr-head-title">Printer Settings</div>
            <div className="pr-head-sub">
              {username
                ? `Per-user setting — "${username}" ke login par yehi printer use hogi`
                : "Local ya LAN printer — kisi bhi ek ko select karke save karein"}
            </div>
          </div>
        </div>

        <div className="pr-body">
          <div className="pr-info">
            <i
              className="fas fa-info-circle"
              style={{ marginTop: 2, fontSize: 13 }}
            ></i>
            <div>
              Yeh list <b>server PC</b> ki Windows me visible saari printers
              dikhati hai — server se attached <b>Local</b> printers AND LAN
              par share ki gayi <b>Network</b> printers (jaise{" "}
              <code>{`\\\\PCName\\Printer`}</code>). Aap jis printer ka name
              save karenge, invoice print karte waqt seedha usi par print hoga.
            </div>
          </div>

          {savedName ? (
            <div className="pr-saved-banner">
              <i className="fas fa-check-circle"></i>
              <span>
                Currently saved:&nbsp;
                <span style={{ fontFamily: "monospace" }}>"{savedName}"</span>
              </span>
              <span
                className={`pr-badge ${
                  savedType === "network"
                    ? "pr-badge-network"
                    : "pr-badge-local"
                }`}
              >
                {savedType === "network" ? "LAN / Network" : "Local"}
              </span>
            </div>
          ) : (
            <div className="pr-no-saved">
              <i className="fas fa-exclamation-triangle"></i>
              Koi printer save nahi hai. Server ki default printer use hogi.
            </div>
          )}

          <label className="pr-label">Available printers</label>

          <div className="pr-controls">
            <input
              className="pr-search"
              placeholder="Search printer name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="pr-tabs">
              <button
                className={`pr-tab${filter === "all" ? " active" : ""}`}
                onClick={() => setFilter("all")}
                type="button"
              >
                All
              </button>
              <button
                className={`pr-tab${filter === "local" ? " active" : ""}`}
                onClick={() => setFilter("local")}
                type="button"
              >
                Local
              </button>
              <button
                className={`pr-tab${filter === "network" ? " active" : ""}`}
                onClick={() => setFilter("network")}
                type="button"
              >
                LAN / Network
              </button>
            </div>
            <span className="pr-counts">
              {visible.length} / {normalized.length} shown
            </span>
          </div>

          {loading ? (
            <div className="pr-loading">
              <i
                className="fas fa-spinner fa-spin"
                style={{ marginRight: 8 }}
              ></i>
              Loading printers…
            </div>
          ) : (
            <div className="pr-list">
              {visible.length === 0 ? (
                <div className="pr-empty">
                  <i
                    className="fas fa-print"
                    style={{
                      fontSize: 28,
                      color: "#e9d5ff",
                      display: "block",
                      marginBottom: 6,
                    }}
                  ></i>
                  {normalized.length === 0
                    ? "No printers detected on the server"
                    : "Filter ke mutabiq koi printer nahi mili"}
                </div>
              ) : (
                visible.map((p, i) => {
                  const isSelected = selected === p.name;
                  return (
                    <div
                      key={p.name + i}
                      className={`pr-item${isSelected ? " selected" : ""}`}
                      onClick={() => setSelected(p.name)}
                    >
                      <div
                        className={`pr-radio${isSelected ? " checked" : ""}`}
                      ></div>
                      <i
                        className={
                          p.type === "network"
                            ? "fas fa-network-wired"
                            : "fas fa-print"
                        }
                        style={{ color: "#7c3aed", fontSize: 13 }}
                      ></i>
                      <span style={{ flex: 1, wordBreak: "break-all" }}>
                        {p.name}
                      </span>
                      <span
                        className={`pr-badge ${
                          p.type === "network"
                            ? "pr-badge-network"
                            : "pr-badge-local"
                        }`}
                      >
                        {p.type === "network" ? "LAN" : "Local"}
                      </span>
                      {savedName === p.name && (
                        <span className="pr-badge pr-badge-saved">SAVED</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          <div className="pr-actions">
            <button
              className="pr-btn pr-btn-save"
              onClick={save}
              disabled={saving || !selected || selected === savedName}
            >
              <i
                className={saving ? "fas fa-spinner fa-spin" : "fas fa-save"}
              ></i>{" "}
              {saving ? "Saving…" : "Save Printer"}
            </button>
            <button
              className="pr-btn pr-btn-test"
              onClick={testPrint}
              disabled={testing || (!selected && !savedName)}
              type="button"
              title="Selected printer par aik test page print karein"
            >
              <i
                className={
                  testing ? "fas fa-spinner fa-spin" : "fas fa-paper-plane"
                }
              ></i>{" "}
              {testing ? "Testing…" : "Test Print"}
            </button>
            <button
              className="pr-btn pr-btn-refresh"
              onClick={() => setRefreshTick((t) => t + 1)}
              type="button"
            >
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
            {savedName && (
              <button
                className="pr-btn pr-btn-clear"
                onClick={clear}
                type="button"
              >
                <i className="fas fa-trash-alt"></i> Clear
              </button>
            )}
            {onClose && (
              <button
                className="pr-btn pr-btn-close"
                onClick={onClose}
                type="button"
              >
                <i className="fas fa-times"></i> Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrinterSettings;
