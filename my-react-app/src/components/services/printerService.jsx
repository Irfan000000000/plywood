import axios from "axios";

// The full login response is stored in localStorage under "user" by
// authService — { auth, token, user: { username, user_type, user_id, printer_name } }
function readLoginResponse() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getCurrentUsername() {
  return readLoginResponse()?.user?.username || null;
}

export function getCurrentUserPrinter() {
  return readLoginResponse()?.user?.printer_name || null;
}

// Update the cached login response so subsequent reads see the new
// printer immediately without re-logging-in.
export function setCachedUserPrinter(printerName) {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return;
    const obj = JSON.parse(raw);
    if (obj && obj.user) {
      obj.user.printer_name = printerName || null;
      localStorage.setItem("user", JSON.stringify(obj));
    }
  } catch {
    /* noop */
  }
}

// Persist on the server (DB) AND update local cache.
export async function saveUserPrinter(username, printerName) {
  const res = await axios.post(
    process.env.REACT_APP_API_URL + "/user-printer",
    { username, printer: printerName || null }
  );
  if (res.data?.success) {
    setCachedUserPrinter(printerName || null);
  }
  return res.data;
}

export async function fetchUserPrinter(username) {
  const res = await axios.get(
    process.env.REACT_APP_API_URL + "/user-printer",
    { params: { username } }
  );
  const printer = res.data?.printer || null;
  setCachedUserPrinter(printer);
  return printer;
}
