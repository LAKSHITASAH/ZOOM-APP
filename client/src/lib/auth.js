const KEY = "zc_token";
const UKEY = "zc_user";
const USERS_KEY = "zc_users_db";

function rid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function setAuth(token, user) {
  localStorage.setItem(KEY, token);
  localStorage.setItem(UKEY, JSON.stringify(user));
}
export function clearAuth() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(UKEY);
}
export function getToken() {
  return localStorage.getItem(KEY);
}
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(UKEY) || "null");
  } catch {
    return null;
  }
}
export function isAuthed() {
  return !!getToken();
}

// OFFLINE AUTH
export function offlineRegister({ name, email, password }) {
  const users = getUsers();
  const e = String(email || "").trim().toLowerCase();

  if (!name || name.trim().length < 2) throw new Error("Name must be at least 2 characters.");
  if (!e.includes("@")) throw new Error("Enter a valid email.");
  if (!password || password.length < 4) throw new Error("Password must be at least 4 characters.");

  const exists = users.find((u) => u.email === e);
  if (exists) throw new Error("Account already exists. Please sign in.");

  const user = { id: rid(), name: name.trim(), email: e, password };
  users.push(user);
  saveUsers(users);

  const token = "offline_" + rid();
  setAuth(token, { id: user.id, name: user.name, email: user.email });
  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

export function offlineLogin({ email, password }) {
  const users = getUsers();
  const e = String(email || "").trim().toLowerCase();

  const user = users.find((u) => u.email === e);
  if (!user) throw new Error("No account found. Please create one.");
  if (user.password !== password) throw new Error("Wrong password.");

  const token = "offline_" + rid();
  setAuth(token, { id: user.id, name: user.name, email: user.email });
  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

export function offlineDemoLogin() {
  const email = `demo${Math.floor(Math.random() * 100000)}@test.com`;
  const password = "demo1234";
  return offlineRegister({ name: "Demo User", email, password });
}
