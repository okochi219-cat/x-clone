const { createClient } = supabase;
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- DOM refs ---
const authScreen = document.getElementById("auth-screen");
const mainScreen = document.getElementById("main-screen");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authMessage = document.getElementById("auth-message");
const userEmailDisplay = document.getElementById("user-email-display");
const tweetInput = document.getElementById("tweet-input");
const charCount = document.getElementById("char-count");
const tweetBtn = document.getElementById("tweet-btn");
const tweetList = document.getElementById("tweet-list");

// --- Auth state ---
client.auth.onAuthStateChange((_event, session) => {
  if (session) {
    showMain(session.user);
  } else {
    showAuth();
  }
});

function showAuth() {
  authScreen.style.display = "block";
  mainScreen.style.display = "none";
}

function showMain(user) {
  authScreen.style.display = "none";
  mainScreen.style.display = "block";
  userEmailDisplay.textContent = user.email;
  loadTweets();
}

function setMessage(text, isSuccess = false) {
  authMessage.textContent = text;
  authMessage.className = "message" + (isSuccess ? " success" : "");
}

// --- Toggle login / register ---
document.getElementById("go-register").addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.style.display = "none";
  registerForm.style.display = "flex";
  setMessage("");
});

document.getElementById("go-login").addEventListener("click", (e) => {
  e.preventDefault();
  registerForm.style.display = "none";
  loginForm.style.display = "flex";
  setMessage("");
});

// --- Login ---
document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  if (!email || !password) return setMessage("メールとパスワードを入力してください");
  setMessage("ログイン中...");
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) setMessage(error.message);
});

// --- Register ---
document.getElementById("register-btn").addEventListener("click", async () => {
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  if (!email || !password) return setMessage("メールとパスワードを入力してください");
  setMessage("登録中...");
  const { error } = await client.auth.signUp({ email, password });
  if (error) {
    setMessage(error.message);
  } else {
    setMessage("確認メールを送りました。メールを確認してください。", true);
  }
});

// --- Logout ---
document.getElementById("logout-btn").addEventListener("click", async () => {
  await client.auth.signOut();
});

// --- Char counter ---
tweetInput.addEventListener("input", () => {
  const remaining = 280 - tweetInput.value.length;
  charCount.textContent = remaining;
  charCount.className = remaining <= 20 ? (remaining <= 0 ? "danger" : "warn") : "";
  tweetBtn.disabled = tweetInput.value.trim().length === 0 || remaining < 0;
});

// --- Post tweet ---
tweetBtn.addEventListener("click", async () => {
  const content = tweetInput.value.trim();
  if (!content) return;
  tweetBtn.disabled = true;
  const { data: { user } } = await client.auth.getUser();
  const { error } = await client.from("tweets").insert({ content, user_id: user.id, author_email: user.email });
  if (!error) {
    tweetInput.value = "";
    charCount.textContent = "280";
    charCount.className = "";
    loadTweets();
  }
  tweetBtn.disabled = false;
});

// --- Load tweets ---
async function loadTweets() {
  tweetList.innerHTML = '<div class="empty-state">読み込み中...</div>';
  const { data, error } = await client
    .from("tweets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    tweetList.innerHTML = '<div class="empty-state">エラーが発生しました</div>';
    return;
  }

  if (!data || data.length === 0) {
    tweetList.innerHTML = '<div class="empty-state">まだ投稿がありません。最初のポストをしよう！</div>';
    return;
  }

  tweetList.innerHTML = data.map((t) => `
    <div class="tweet-item">
      <span class="tweet-author">${escapeHtml(t.author_email)}</span>
      <p class="tweet-content">${escapeHtml(t.content)}</p>
      <span class="tweet-time">${formatDate(t.created_at)}</span>
    </div>
  `).join("");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
