const SUPABASE_URL = "https://hhglsrugbayccdboasaj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZ2xzcnVnYmF5Y2NkYm9hc2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NTEzMDIsImV4cCI6MjA1ODUyNzMwMn0._wHDCT00aa4IQYJNzpL4hjcz9BURslqJt9OUtfxjxlM";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("🔗 الاتصال بـ Supabase:", SUPABASE_URL);

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("login-error");
    errorMsg.textContent = "";

    if (!email || !password) {
        errorMsg.textContent = "⚠ يرجى إدخال البريد الإلكتروني وكلمة المرور!";
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        errorMsg.textContent = "❌ فشل تسجيل الدخول: " + error.message;
        return;
    }

    alert("✅ تسجيل الدخول ناجح!");
    window.location.href = "index.html";
}