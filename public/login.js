const { createClient } = supabase;

const sb = createClient(
  'https://hhglsrugbayccdboasaj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZ2xzcnVnYmF5Y2NkYm9hc2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NTEzMDIsImV4cCI6MjA1ODUyNzMwMn0._wHDCT00aa4IQYJNzpL4hjcz9BURslqJt9OUtfxjxlM'
);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  form.addEventListener("submit", async function (e) {
    e.preventDefault(); // يمنع ريفريش الصفحة
    await login();      // استدعاء دالة تسجيل الدخول
  });
});

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorDiv = document.getElementById("error");

  errorDiv.textContent = "";

  if (!email || !password) {
    errorDiv.textContent = "⚠ يرجى إدخال البريد وكلمة المرور";
    return;
  }

  const { data, error } = await sb.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    errorDiv.textContent = "❌ البريد أو كلمة المرور غير صحيحة";
    console.error("خطأ:", error.message);
  } else {
    // ✅ تحويل المستخدم بعد الدخول
    window.location.href = "index.html";
  }
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById("password");
    const type = passwordInput.getAttribute("type");
    passwordInput.setAttribute("type", type === "password" ? "text" : "password");
  }  