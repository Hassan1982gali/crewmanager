// ✅ إعداد Supabase
const SUPABASE_URL = "https://hhglsrugbayccdboasaj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZ2xzcnVnYmF5Y2NkYm9hc2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NTEzMDIsImV4cCI6MjA1ODUyNzMwMn0._wHDCT00aa4IQYJNzpL4hjcz9BURslqJt9OUtfxjxlM";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ✅ التحقق من حالة تسجيل الدخول عند تحميل الصفحة
async function checkAuth() {
  const { data, error } = await sb.auth.getSession();

  if (!data.session) {
    window.location.href = "login.html";
  }
}

document.addEventListener("DOMContentLoaded", checkAuth);

// ✅ دالة تسجيل الخروج
async function logout() {
  const { error } = await sb.auth.signOut();
  if (!error) {
    window.location.href = "login.html";
  } else {
    console.error("❌ خطأ أثناء تسجيل الخروج:", error.message);
  }
}

// ✅ تحديد الحسابات والصلاحيات
const ADMIN_EMAILS = ["viewer@marine.com"]; // حساب الـ Admin
const VIEWER_EMAILS = ["hr@marine.com"]; // حساب المشاهدة فقط

async function checkUserRole() {
    const { data: { user } } = await sb.auth.getUser();
    
    if (!user) {
        window.location.href = "login.html"; // ✅ إعادة التوجيه لصفحة تسجيل الدخول
        return;
    }

    console.log("🔹 المستخدم الحالي:", user.email);

    // ✅ جلب دور المستخدم من قاعدة البيانات
    const { data, error } = await sb
        .from("user_roles")
        .select("role")
        .eq("email", user.email)
        .single();

    if (error || !data) {
        console.error("❌ فشل في جلب دور المستخدم:", error);
        return;
    }

    const userRole = data.role;
    console.log("🎭 دور المستخدم:", userRole);

    if (userRole === "viewer") {
        disableEditing(); // ✅ تعطيل الإضافات والتعديلات فقط، مع السماح بالبحث والتصفية
    }
}

// ✅ تنفيذ الدالة عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", checkUserRole);

// ✅ تعطيل التعديلات لمستخدم المشاهدة فقط
function disableEditing() {
    console.log("🔒 تم تفعيل وضع المشاهدة فقط");

    // ✅ إخفاء زر "إضافة موظف"
    const addButton = document.querySelector(".add-button");
    if (addButton) {
        addButton.style.display = "none";
    }

    // ✅ إخفاء أزرار التعديل والحذف فقط
    document.querySelectorAll(".edit-button, .delete-button").forEach(button => {
        button.style.display = "none"; 
    });

    // ✅ تعطيل جميع الحقول القابلة للتحرير داخل نافذتي التعديل والإضافة
    document.querySelectorAll("#editModal input, #editModal select, #editModal textarea").forEach(element => {
        element.disabled = true; 
    });

    // ✅ منع حفظ التعديلات
    document.querySelectorAll("button[onclick^='saveEditCrewMember']").forEach(button => {
        button.disabled = true;
    });

    // ✅ السماح باستخدام الفلاتر والبحث
    document.querySelectorAll(".filter-search, .checkbox-list input").forEach(input => {
        input.disabled = false; 
    });

    console.log("✅ الفلاتر والبحث متاحة في وضع المشاهدة");
}

// ✅ تسجيل الخروج
function logout() {
sb.auth.signOut().then(() => {
        window.location.href = "login.html"; // إعادة التوجيه لصفحة تسجيل الدخول بعد تسجيل الخروج
    });
}

// ✅ تنفيذ التحقق عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", checkUserRole);

// ✅ استدعاء التحقق عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", checkAuth);

// ✅ استدعاء التحقق عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", checkAuth);

// ✅ ترتيب الرتب
const rankOrder = [
  "ربان",
  "رئيس ضباط",
  "رئيس مهندسين",
  "ضابط ثاني",
  "ضابط ثالث",
  "ضابط رابع",
  "مهندس ثاني",
  "مهندس ثالث",
  "مهندس رابع",
  "مهندس كهرباء",
  "رقيب سطحة",
  "مراقب مضخة",
  "بحار",
  "كهربائي",
  "ميكانيك",
  "مراقب غرفة ماكنة",
  "طباخ",
  "مأمور مائدة",
];

function getServiceDuration(entry, nextEntry, prevEntry) {
  const today = new Date();

  const join = entry.join_date ? new Date(entry.join_date) : null;
  const leave = entry.leave_date ? new Date(entry.leave_date) : null;
  const nextJoin = nextEntry?.join_date ? new Date(nextEntry.join_date) : null;

  if (entry.ship !== "استراحة" && join && leave) {
    return calculateDuration(join, leave);
  }

  if (entry.ship !== "استراحة" && join && !leave && nextEntry?.ship === "استراحة" && nextEntry?.leave_date) {
    return calculateDuration(join, new Date(nextEntry.leave_date));
  }

  if (entry.ship !== "استراحة" && join && !leave) {
    return calculateDuration(join, today);
  }

  if (entry.ship === "استراحة" && leave && nextJoin) {
    return calculateDuration(leave, nextJoin);
  }

  if (entry.ship === "استراحة" && leave && !nextJoin) {
    return calculateDuration(leave, today);
  }

  return 0;
}

function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start) || isNaN(end)) return 0;
  return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

// ✅ دالة ذكية لحساب مدة الخدمة حسب الحالة والتواريخ
function smartServiceDuration(joinDate, leaveDate, status) {
  const today = new Date();

  if (status === "موظف") {
    if (joinDate && leaveDate) {
      return parseInt(calculateDuration(joinDate, leaveDate)) || 0;
    } else if (joinDate && !leaveDate) {
      return parseInt(calculateDuration(joinDate, today)) || 0;
    }
  }

  if (status === "استراحة") {
    if (leaveDate && !joinDate) {
      return parseInt(calculateDuration(leaveDate, today)) || 0;
    } else if (joinDate && leaveDate) {
      return parseInt(calculateDuration(leaveDate, joinDate)) || 0;
    }
  }

  return 0;
}

// ✅ تحميل بيانات الطاقم مع سجل الخدمة
async function loadEmployees(callback = null) {
  console.log("🚀 تحميل بيانات الطاقم...");

  // جلب بيانات الطاقم (تم إضافة job_number هنا)
  const { data: employees, error } = await sb
  .from("crew_list")
  .select("id, name, job_number, rank, ship, join_date, join_duration, leave_date, leave_duration, status, note, is_complete");

  if (error) {
    console.error("❌ خطأ أثناء جلب بيانات الطاقم:", error);
    return;
  }

  // جلب سجل الخدمة لكل موظف
  const historyMap = await loadHistory();

  // عرض الموظفين مع سجل الخدمة
  displayEmployees(employees, historyMap);

  // تنفيذ الفلترة إذا موجودة
  if (callback) callback();
}

async function addCertificate() {
    const urlParams = new URLSearchParams(window.location.search);
    const employeeId = urlParams.get("id");
  
    const name = document.getElementById("cert-name").value.trim();
    const issue = document.getElementById("cert-issue").value;
    const expiry = document.getElementById("cert-expiry").value;
  
    if (!name || !issue || !expiry) {
      alert("⚠️ الرجاء ملء جميع الحقول.");
      return;
    }
  
    const { error } = await sb.from("certificates").insert([{
      employee_id: employeeId,
      name,
      issue_date: issue,
      expiry_date: expiry
    }]);
  
    if (error) {
      alert("❌ حدث خطأ أثناء إضافة الشهادة.");
      console.error(error);
      return;
    }
  
    // ✅ إعادة تحميل الشهادات
    alert("✅ تم حفظ الشهادة.");
    document.getElementById("cert-name").value = "";
    document.getElementById("cert-issue").value = "";
    document.getElementById("cert-expiry").value = "";
    loadCertificates(employeeId); // تأكد الدالة موجودة وتعاد تحميل البيانات
  }  

async function showAddHistoryModal() {
    document.getElementById("addHistoryModal").style.display = "block";

    // جلب أسماء الموظفين
    const { data, error } = await sb.from("crew_list").select("id, name");
    const select = document.getElementById("history-employee");
    select.innerHTML = "";

    data.forEach(emp => {
        const option = document.createElement("option");
        option.value = emp.id;
        option.textContent = emp.name;
        select.appendChild(option);
    });
}

function closeAddHistoryModal() {
    document.getElementById("addHistoryModal").style.display = "none";
}

async function saveHistoryRecord() {
    const employee_id = document.getElementById("history-employee").value;
    const ship = document.getElementById("history-ship").value;
    const status = document.getElementById("history-status").value;
    const join_date = document.getElementById("history-joinDate").value;
    const leave_date = document.getElementById("history-leaveDate").value;
    const rank = document.getElementById("history-rank").value;

    const duration = parseInt(calculateDuration(join_date, leave_date)) || 0;

    const { error } = await sb.from("history").insert([{
        employee_id,
        ship,
        status,
        join_date,
        leave_date,
        duration,
        rank,
    }]);

    if (error) {
        alert("❌ فشل في إضافة السجل");
        console.error(error);
    } else {
        alert("✅ تم إضافة السجل بنجاح");
        closeAddHistoryModal();
    }
}

async function showSeaTime(employeeId) {
  const modal = document.getElementById("seaTimeModal");
  const tableBody = document.getElementById("seaTimeTableBody");

  if (!modal || !tableBody) {
    console.error("❌ لم يتم العثور على عناصر النافذة.");
    return;
  }

  // ✅ جلب اسم الموظف
  const { data: empData, error: empError } = await sb
    .from("crew_list")
    .select("name")
    .eq("id", employeeId)
    .single();

  // ✅ جلب الرتبة الأصلية من crew_list
  const { data: crewData } = await sb
    .from("crew_list")
    .select("id, rank")
    .eq("id", employeeId)
    .single();

  if (!empError && empData) {
    const title = modal.querySelector("h2");
    if (title) {
      title.innerHTML = `📄 سجل الخدمة البحرية – <span style="color:#007BFF">${empData.name}</span>`;
    }
    modal.setAttribute("data-employee-name", empData.name);
  }

  tableBody.innerHTML = "";

  // ✅ جلب سجل الخدمة
  const { data, error } = await sb
    .from("history")
    .select("*")
    .eq("employee_id", employeeId);

  if (error) {
    console.error("❌ فشل في جلب السجل:", error);
    tableBody.innerHTML = "<tr><td colspan='7'>حدث خطأ أثناء تحميل البيانات</td></tr>";
    modal.style.display = "block";
    return;
  }

  if (!data || data.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='7'>لا يوجد سجل لهذا الموظف</td></tr>";
  } else {
    // ✅ ترتيب حسب التاريخ
    data.sort((a, b) => {
      const dateA = new Date(a.join_date || a.leave_date || "1900-01-01");
      const dateB = new Date(b.join_date || b.leave_date || "1900-01-01");
      return dateA - dateB;
    });

    const reversedData = [...data].reverse();

    reversedData.forEach((entry) => {
      const realIndex = data.indexOf(entry);
      const nextEntry = data[realIndex + 1];
      const prevEntry = data[realIndex - 1];
      const duration = getServiceDuration(entry, nextEntry, prevEntry);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.ship || "-"}</td>
        <td>${entry.status || "-"}</td>
        <td>${entry.join_date || "-"}</td>
        <td>${entry.leave_date || "-"}</td>
        <td>${duration} يوم</td>
        <td>${
  entry.rank && entry.rank.trim() !== ""
    ? entry.rank
    : (!entry.leave_date ? crewData?.rank : "-")
}</td>
        <td><button onclick="deleteHistoryRecord('${entry.id}')" style="color: red;">🗑</button></td>
      `;
      tableBody.appendChild(row);
    });
  }

  modal.style.display = "block";
}

async function deleteHistoryRecord(historyId) {
  if (!confirm("⚠ هل تريد بالتأكيد حذف هذا السجل؟")) return;

  const { error } = await sb
    .from("history")
    .delete()
    .eq("id", historyId);

  if (error) {
    alert("❌ فشل في حذف السجل");
    console.error(error);
  } else {
    alert("✅ تم حذف السجل بنجاح");

   // ✅ لا تعيد فتح المودال تلقائيًا بعد الحذف
document.getElementById("seaTimeModal").style.display = "none";
  }
}

// ✅ دالة إغلاق النافذة
function closeSeaTimeModal() {
    const modal = document.getElementById("seaTimeModal");
    if (modal) modal.style.display = "none";
}

// ✅ دالة فتح نافذة السجل
function showSeaTimeModal() {
  const modal = document.getElementById("seaTimeModal");
  if (modal) modal.style.display = "flex";
}

// ✅ دالة لاسترجاع الفلاتر المحددة قبل التحديث
function getSelectedFilters(filterId) {
    let filter = document.getElementById(filterId);
    return filter ? Array.from(filter.selectedOptions).map(option => option.value) : [];
}

// ✅ دالة لتطبيق الفلاتر بعد التحديث
function setSelectedFilters(filterId, selectedValues) {
    let filter = document.getElementById(filterId);
    if (filter) {
        Array.from(filter.options).forEach(option => {
            option.selected = selectedValues.includes(option.value);
        });
    }
}

// ✅ عرض الموظفين في جدول - نسخة محسّنة لحساب المدد وتحديث الملاحظات والخدمة السابقة
function displayEmployees(employees, historyMap = new Map()) {
  const tableBody = document.getElementById("employee-table-body");
  if (!tableBody) {
    console.error("❌ العنصر employee-table-body غير موجود في الصفحة.");
    return;
  }
  tableBody.innerHTML = "";

  const showIncompleteOnly = document.getElementById("filter-incomplete-only")?.checked;

  if (showIncompleteOnly) {
    employees = employees.filter(emp => emp.is_complete === false);
  }

  // فرز البيانات حسب الترتيب المفضل للرتب
  employees.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));

  const fragment = document.createDocumentFragment();

  employees.forEach((crew, index) => {
    // ✅ تجهيز الخدمة السابقة كدوائر
    let historyHTML = "";
    const historyRecords = historyMap.get(String(crew.id)) || [];
const hideRest = document.getElementById("toggle-rest-filter")?.checked;

historyRecords.forEach(record => {
  const ship = record.ship ?? "غير معروفة";
  if (!hideRest && ship === "استراحة") return;

  if (record.duration && record.duration > 0) {
    historyHTML += `<span class="history-badge">${ship} ${record.duration}</span> `;
  } else {
    historyHTML += `<span class="history-badge gray" title="لا توجد مدة مسجلة">${ship}</span> `;
  }
});

    let leaveDuration = 0;
    let joinDuration = 0;

    const today = new Date();
    const joinDate = crew.join_date ? new Date(crew.join_date) : null;
    const leaveDate = crew.leave_date ? new Date(crew.leave_date) : null;

    if (joinDate && !leaveDate) {
      joinDuration = calculateDuration(joinDate, today);
    } else if (joinDate && leaveDate) {
      joinDuration = calculateDuration(joinDate, leaveDate);
      leaveDuration = calculateDuration(leaveDate, today);
    } else if (!joinDate && leaveDate) {
      leaveDuration = calculateDuration(leaveDate, today);
    }

    let row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
        <td style="${crew.is_complete === false ? 'background-color:#ffe6e6; color:#d32f2f; font-weight:bold;' : ''}">
  ${crew.is_complete === false ? '<span title="ملف غير مكتمل (نقص شهادات)">⚠️</span> ' : ''}${crew.name ?? "غير معروف"}
</td>
<td>
        <input type="text" class="job-number-field no-print" data-id="${crew.id}" value="${crew.job_number ?? ""}" placeholder="—" style="width: 70px; text-align: center; border: 1px dashed transparent; background: transparent; font-family: 'Cairo', sans-serif;">
        <div class="print-job-number-only" style="display: none;">${crew.job_number ?? "—"}</div>
      </td>
      <td>${crew.rank ?? "غير معروف"}</td>
      <td>${crew.ship ?? "غير معروف"}</td>
      <td>${crew.join_date ?? "غير متوفر"}</td>
      <td>${joinDuration} يوم</td>
      <td>${crew.leave_date ?? "غير متوفر"}</td>
      <td class="leave-duration">${leaveDuration} يوم</td>
      <td>${crew.status ?? "غير معروف"}</td>
      <td class="history-col">
  <div class="history-wrap">
    ${historyHTML}
  </div>
</td>
      <td>
        <textarea 
          class="note-field no-print"
          data-id="${crew.id}"
          rows="2"
          style="width: 100%;">${crew.note ?? ""}</textarea>
        <div class="print-note-only">${(crew.note ?? "").replace(/\n/g, "<br>")}</div>
      </td>
      <td class="actions-cell">
        <button class="action-btn btn-edit" onclick="editCrewMember('${crew.id}')">✏ تعديل</button>
        <button class="action-btn btn-delete" onclick="deleteCrewMember('${crew.id}')">🗑 حذف</button>
        <button class="action-btn btn-history" onclick="showSeaTime('${crew.id}')">📄 السجل</button>
        <button class="action-btn btn-profile" onclick="showEmployeeProfile('${crew.id}')">📋 ملف الموظف</button>
      </td>
    `;

    const leaveCell = row.querySelector(".leave-duration");
    if (parseInt(leaveDuration) > 60) {
      leaveCell.style.backgroundColor = "#ffcccc";
      leaveCell.style.color = "red";
    }

    fragment.appendChild(row);
  });

  tableBody.appendChild(fragment);

  setTimeout(() => {
    document.querySelectorAll(".note-field").forEach((noteField) => {
      noteField.style.height = "auto";
      noteField.style.height = noteField.scrollHeight + "px";

      noteField.addEventListener("input", () => {
        noteField.style.height = "auto";
        noteField.style.height = noteField.scrollHeight + "px";
      });

      noteField.addEventListener("blur", async (event) => {
            const newNote = event.target.value;
            const crewId = event.target.dataset.id;
          
            const { error } = await sb
              .from("crew_list")
              .update({ note: newNote })
              .eq("id", crewId);
          
            if (error) {
              console.error("❌ فشل في تحديث الملاحظة:", error);
              alert("حدث خطأ أثناء حفظ الملاحظة!");
            } else {
              console.log("✅ تم حفظ الملاحظة!");
          
              // ✅ تحديث نسخة الطباعة مباشرة
              const printNoteDiv = noteField.parentElement.querySelector(".print-note-only");
              if (printNoteDiv) {
                printNoteDiv.innerHTML = newNote.replace(/\n/g, "<br>");
              }
            }
          });      
        });

        // 👇👇 الكود الجديد الخاص بالحفظ التلقائي للرقم الوظيفي 👇👇
        document.querySelectorAll(".job-number-field").forEach((jobField) => {
          jobField.addEventListener("focus", () => {
            jobField.style.border = "1px dashed #1a237e"; // إظهار إطار عند الكتابة
          });
          jobField.addEventListener("blur", async (event) => {
            jobField.style.border = "1px dashed transparent"; // إخفاء الإطار بعد الانتهاء
            const newJobNum = event.target.value;
            const crewId = event.target.dataset.id;
            
            const { error } = await sb.from("crew_list").update({ job_number: newJobNum }).eq("id", crewId);
            
            if (!error) {
              console.log("✅ تم حفظ الرقم الوظيفي!");
              // تحديث نسخة الطباعة
              const printDiv = jobField.parentElement.querySelector(".print-job-number-only");
              if (printDiv) printDiv.innerText = newJobNum || "—";
            } else {
              console.error("❌ فشل في تحديث الرقم الوظيفي:", error);
            }
          });
        });
        // 👆👆 نهاية كود الرقم الوظيفي 👆👆

      }, 0);
    }

// ✅ ربط checkbox لإخفاء الاستراحة
document.getElementById("toggle-rest-filter").addEventListener("change", () => {
  loadEmployees(); // إعادة تحميل الجدول مع الفلتر الجديد
});

// ✅ دالة فرز البيانات بناءً على المدة
let sortOrder = {
  join_duration: "asc",
  leave_duration: "asc",
};

function sortByDuration(type) {
    let tableBody = document.getElementById("employee-table-body");
    let rows = Array.from(tableBody.rows);

    rows.sort((a, b) => {
        let durationA = parseInt(a.cells[type === "join_duration" ? 5 : 7].textContent.replace(" يوم", "").trim()) || 0;
        let durationB = parseInt(b.cells[type === "join_duration" ? 5 : 7].textContent.replace(" يوم", "").trim()) || 0;

        return sortOrder[type] === "asc" ? durationA - durationB : durationB - durationA;
    });

    // تبديل نوع الفرز بين تصاعدي وتنازلي
    sortOrder[type] = sortOrder[type] === "asc" ? "desc" : "asc";

    // إعادة ترتيب الصفوف
    rows.forEach(row => tableBody.appendChild(row));
}

function addNewItem(type) {
  const labels = {
    rank: "الرتبة",
    ship: "الناقلة",
    status: "الحالة"
  };

  const containerId = {
    rank: "ranks-container",
    ship: "ships-container",
    status: "status-container"
  };

  const label = labels[type];
  const container = document.getElementById(containerId[type]);

  const newItem = prompt(`📝 أدخل ${label} جديدة:`);
  if (!newItem) return;

  const div = document.createElement("div");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `${type}-${newItem}`;
  checkbox.value = newItem;
  checkbox.checked = true;

  const labelEl = document.createElement("label");
  labelEl.setAttribute("for", checkbox.id);
  labelEl.textContent = newItem;

  div.appendChild(checkbox);
  div.appendChild(labelEl);

  container.appendChild(div);

  alert(`✅ تم إضافة ${label}: ${newItem}`);
}

function promptAddOption(type) {
  const labelMap = {
    ship: "الناقلة",
    rank: "الرتبة",
    status: "الحالة"
  };

  const newOption = prompt(`اكتب ${labelMap[type]} الجديدة:`);
  if (!newOption) return;

  const select = document.getElementById(`filter-${type}`);
  const option = document.createElement("option");
  option.value = newOption;
  option.textContent = newOption;
  select.appendChild(option);

  alert(`✅ تمّت إضافة ${labelMap[type]}: ${newOption}`);
}

// ✅ التأكد من وجود حاوية الفلاتر الأساسية: .filters-container
function ensureFiltersContainer() {
  let filtersContainer = document.querySelector(".filters-container");
  if (!filtersContainer) {
    console.warn("⚠ لم يتم العثور على .filters-container، سيتم إنشاؤها تلقائيًا.");
    filtersContainer = document.createElement("div");
    filtersContainer.className = "filters-container";
    document.body.prepend(filtersContainer);
  }
}

async function loadFilterOptions(column, containerId) {
  console.log(`🚀 تحميل ${column} للفلاتر...`);
  const { data, error } = await sb.from("crew_list").select(column);
  if (error) {
    console.error(`❌ خطأ أثناء جلب ${column}:`, error);
    return;
  }

  const uniqueValues = [...new Set(data.map(row => row[column]).filter(Boolean))];
  populateFilterDropdown(containerId, uniqueValues);
}

// ✅ تحديث الملخص بعد كل فلترة
function filterCrew() {
    console.log("🔍 تشغيل الفلترة...");

    // ✅ استخراج القيم المحددة من كل فلتر
    let selectedRanks = Array.from(document.querySelectorAll('#ranks-container input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    let selectedShips = Array.from(document.querySelectorAll('#ships-container input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    let selectedStatuses = Array.from(document.querySelectorAll('#status-container input[type="checkbox"]:checked'))
        .map(cb => cb.value);

    console.log("✅ الفلاتر المحددة:", { selectedRanks, selectedShips, selectedStatuses });

    let rows = document.querySelectorAll("#employee-table-body tr");
    rows.forEach((row) => {
        // 🔴 التعديل صار هنا: غيرنا الأرقام إلى 3 و 4 و 9
        let rankColumn = row.cells[3].textContent.trim();
        let shipColumn = row.cells[4].textContent.trim();
        let statusColumn = row.cells[9].textContent.trim();

        let matchesRank = selectedRanks.length === 0 || selectedRanks.includes(rankColumn);
        let matchesShip = selectedShips.length === 0 || selectedShips.includes(shipColumn);
        let matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(statusColumn);

        // ✅ إظهار الصف إذا تطابق مع الفلاتر، وإخفاؤه إذا لم يتطابق
        row.style.display = (matchesRank && matchesShip && matchesStatus) ? "" : "none";
    });

    updateRowIndices(); // ✅ إعادة ترقيم الصفوف بعد التصفية
}

// ✅ إعادة ترقيم الصفوف
function updateRowIndices() {
  let rows = document.querySelectorAll("#employee-table-body tr");
  let index = 1;
  rows.forEach((row) => {
    if (row.style.display !== "none") {
      row.cells[0].textContent = index++;
    }
  });
}

// ✅ تعديل بيانات الموظف وحفظها
async function saveEditCrewMember() {
    let memberId = document.getElementById("editModal").getAttribute("data-member-id");
    if (!memberId) {
        console.error("⚠ خطأ! لا يوجد ID للموظف.");
        return;
    }

    let name = document.getElementById("edit-name").value;
    let rank = document.getElementById("edit-rank").value;
    let ship = document.getElementById("edit-ship").value || "غير محدد";
    let joinDate = document.getElementById("edit-joinDate").value;
    let leaveDate = document.getElementById("edit-leaveDate").value;
    let status = document.getElementById("edit-status").value;
    let note = document.getElementById("edit-note").value;

    let joinDuration = calculateDuration(joinDate, leaveDate);
    let leaveDuration = calculateDuration(leaveDate, new Date());
    joinDuration = joinDuration !== null ? parseInt(joinDuration) : null;
    leaveDuration = leaveDuration !== null ? parseInt(leaveDuration) : null;

    let updatedData = {
        name: name || null,
        rank: rank || null,
        ship: ship || "غير محدد",
        join_date: joinDate || null,
        join_duration: joinDuration,
        leave_date: leaveDate || null,
        leave_duration: leaveDuration,
        status: status || null,
        note: note || null,
    };

const { data: oldData, error: oldError } = await sb
  .from("crew_list")
  .select("ship, status, join_date, leave_date")
  .eq("id", memberId)
  .single();

if (oldError || !oldData) {
  console.error("❌ فشل في جلب بيانات الموظف الأصلية:", oldError);
  return;
}

    console.log("📌 تحديث بيانات الموظف:", updatedData);

    // ✅ حفظ الفلاتر المحددة قبل التحديث
    let selectedRanks = getSelectedFilters("filter-rank");
    let selectedShips = getSelectedFilters("filter-ship");
    let selectedStatuses = getSelectedFilters("filter-status");

    sb
        .from("crew_list")
        .update(updatedData)
        .eq("id", memberId)
        .then(async ({ error }) => {
            if (error) {
                console.error("❌ خطأ في تحديث الموظف:", error);
                alert("⚠ حدث خطأ أثناء تحديث الموظف.");
            } else {
                // ✅ التحقق إذا البيانات المهمة تغيّرت فعلاً
const changed =
    oldData.ship !== ship ||
    oldData.status !== status ||
    oldData.join_date !== joinDate ||
    oldData.leave_date !== leaveDate;

    if (changed) {
      let historyRecord = {
          employee_id: memberId,
          ship,
          status,
          join_date: joinDate || null,
          leave_date: leaveDate || null,
      };
  
      // 🧠 حساب المدة حسب حالة البيانات
if (joinDate && leaveDate) {
  historyRecord.duration = parseInt(calculateDuration(joinDate, leaveDate)) || 0;
} else if (joinDate && !leaveDate) {
  historyRecord.duration = parseInt(calculateDuration(joinDate, new Date())) || 0;
} else if (!joinDate && leaveDate) {
  historyRecord.duration = parseInt(calculateDuration(leaveDate, new Date())) || 0;
} else {
  historyRecord.duration = 0;
}
  
      await sb.from("history").insert([historyRecord]);
  
      console.log("✅ تمت إضافة سجل جديد إلى جدول history");
  }  

alert("✅ تم تحديث الموظف بنجاح.");
closeEditModal();
await recalculateHistoryDurations(memberId);
loadEmployees(() => {
    setSelectedFilters("filter-rank", selectedRanks);
    setSelectedFilters("filter-ship", selectedShips);
    setSelectedFilters("filter-status", selectedStatuses);
    filterCrew();
});
            }
        });
}

async function recalculateHistoryDurations(employeeId) {
  const { data: history, error } = await sb
    .from("history")
    .select("*")
    .eq("employee_id", employeeId)
    .order("join_date", { ascending: false }) // ترتيب تنازلي حسب تاريخ الصعود
    .order("leave_date", { ascending: false }); // ولو ماكو صعود نستخدم النزول

  if (error) {
    console.error("❌ فشل في جلب سجل الخدمة:", error.message);
    return;
  }

  let updates = [];

  for (let i = 0; i < history.length; i++) {
    const current = history[i];
    const next = history[i + 1];

    let duration = 0;

    if (current.join_date && !current.leave_date && next && next.leave_date) {
      duration = calculateDuration(current.join_date, next.leave_date); // صعود إلى نزول التالي
    } else if (!current.join_date && current.leave_date && next && next.join_date) {
      duration = calculateDuration(next.join_date, current.leave_date); // صعود السابق إلى نزولي
    } else if (current.join_date && current.leave_date) {
      duration = calculateDuration(current.join_date, current.leave_date); // طبيعي
    } else {
      duration = 0; // ما نكدر نحسب
    }

    updates.push({
      id: current.id,
      duration: parseInt(duration),
    });
  }

  // 📝 إرسال التحديثات كلها
  for (let update of updates) {
    await sb
      .from("history")
      .update({ duration: update.duration })
      .eq("id", update.id);
  }

  console.log("✅ تم تحديث مدد سجل الخدمة تلقائياً");
}

async function editCrewMember(crewId) {
    console.log("🔹 تعديل الموظف:", crewId);

    const { data, error } = await sb
        .from("crew_list")
        .select("*")
        .eq("id", crewId)
        .single();

    if (error || !data) {
        console.error("❌ خطأ: الموظف غير موجود في Supabase!", error);
        return;
    }

    // ✅ تعبئة البيانات الأساسية
    document.getElementById("edit-name").value = data.name || "";
    document.getElementById("edit-joinDate").value = data.join_date || "";
    document.getElementById("edit-leaveDate").value = data.leave_date || "";
    document.getElementById("edit-note").value = data.note || "";

    console.log("🚀 تحميل القوائم المنسدلة...");

    // ✅ تحميل القوائم المنسدلة للرتب، الناقلات، والحالات مع التأكد من انتظار البيانات
    await loadDropdown("edit-rank", "rank", data.rank);
    await loadDropdown("edit-ship", "ship", data.ship);
    await loadDropdown("edit-status", "status", data.status);

    // ✅ فتح النافذة
    document.getElementById("editModal").setAttribute("data-member-id", crewId);
    document.getElementById("editModal").style.display = "block";
}

async function loadDropdown(selectId, column, selectedValue) {
  let selectElement = document.getElementById(selectId);
  if (!selectElement) return;

  // ✅ إزالة القيم السابقة
  selectElement.innerHTML = `<option value="">اختر ${column}</option>`;

  // ✨ استخدام قائمة الرتب الأصلية إذا كان المطلوب هو "rank"
  let values = [];
  if (column === "rank") {
    values = [...rankOrder]; // 🎯 الحل هنا
  } else {
    const { data, error } = await sb.from("crew_list").select(column);
    if (error) {
      console.error(`❌ خطأ أثناء تحميل ${column}:`, error);
      return;
    }
    values = [...new Set(data.map(crew => crew[column]).filter(Boolean))];
  }

  values.forEach(value => {
    let option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    if (value === selectedValue) option.selected = true;
    selectElement.appendChild(option);
  });

  console.log(`✅ تم تحميل ${column} بنجاح:`, values);
}

// ✅ تحميل بيانات القوائم المنسدلة في نافذة "إضافة موظف"
async function loadAddModalData() {
    console.log("🚀 تحميل بيانات نافذة إضافة موظف...");

    try {
        const { data, error } = await sb.from("crew_list").select("rank, ship, status");

        if (error) {
            console.error("❌ خطأ أثناء تحميل بيانات الإضافة:", error);
            return;
        }

        if (!data || data.length === 0) {
            console.warn("⚠ لا توجد بيانات متاحة للرتب، الناقلات، أو الحالات.");
            return;
        }

        // استخراج القيم الفريدة والتحقق من أنها نصوص فقط
        let ranks = [...new Set(data.map(crew => crew.rank).filter(value => typeof value === "string" && value.trim() !== ""))];
        if (!ranks.includes("ضابط ثاني")) ranks.push("ضابط ثاني");
if (!ranks.includes("ضابط ثالث")) ranks.push("ضابط ثالث");
        let ships = [...new Set(data.map(crew => crew.ship).filter(value => typeof value === "string" && value.trim() !== ""))];
        let statuses = [...new Set(data.map(crew => crew.status).filter(value => typeof value === "string" && value.trim() !== ""))];

        console.log("✅ الرتب:", ranks);
        console.log("✅ الناقلات:", ships);
        console.log("✅ الحالات:", statuses);

        // تعبئة القوائم المنسدلة
        populateDropdown("add-rank", ranks);
        populateDropdown("add-ship", ships);
        populateDropdown("add-status", statuses);

    } catch (err) {
        console.error("❌ خطأ غير متوقع أثناء تحميل بيانات الإضافة:", err);
    }
}

// ✅ دالة ذكية لتعبئة القوائم المنسدلة وتطبيق ترتيب مخصص للرُتب + تفعيل البحث
function populateDropdown(selectId, values) {
  const selectElement = document.getElementById(selectId);
  if (!selectElement) {
    console.error(`❌ العنصر ${selectId} غير موجود.`);
    return;
  }

  selectElement.innerHTML = `<option value="">اختر</option>`;

  if (!values || !Array.isArray(values)) {
    console.warn(`⚠ البيانات الممررة إلى ${selectId} ليست مصفوفة.`);
    return;
  }

  // ✅ ترتيب خاص إذا كان الفلتر هو rankFilter
  if (selectId === "rankFilter" && typeof rankOrder !== "undefined") {
    values = [...values].sort((a, b) => {
      return rankOrder.indexOf(a) - rankOrder.indexOf(b);
    });
  }

  values.forEach(value => {
    if (typeof value === "string") {
      const option = document.createElement("option");
      option.value = value.trim();
      option.textContent = value.trim();
      selectElement.appendChild(option);
    } else {
      console.warn(`⚠ تم العثور على قيمة غير نصية في ${selectId}:`, value);
    }
  });

  console.log(`✅ تم تعبئة ${selectId} بعدد ${values.length} خيارات.`);

  // ✅ تفعيل البحث داخل القائمة إذا كانت المكتبة موجودة
  if (typeof MultiselectDropdown !== "undefined" && MultiselectDropdown.init) {
    MultiselectDropdown.init();
  }
}

// ✅ حذف الموظف
async function deleteCrewMember(memberId) {
  if (!confirm("⚠ هل أنت متأكد أنك تريد حذف هذا الموظف؟")) return;

  const { error } = await sb.from("crew_list").delete().eq("id", memberId);
  if (error) {
    alert("⚠ لم يتمكن من حذف الموظف.");
    console.error("❌ خطأ أثناء حذف الموظف:", error);
    return;
  }

  alert("✅ تم حذف الموظف بنجاح.");
  loadEmployees();
}

// ✅ إغلاق نافذة التعديل
function closeEditModal() {
  let modal = document.getElementById("editModal");
  if (modal) {
    modal.style.display = "none";
  } else {
    console.error("❌ خطأ: لم يتم العثور على نافذة التعديل.");
  }
}

async function loadHistory() {
  const { data, error } = await sb
    .from("history")
    .select("*"); // نحتاج كل الأعمدة لحساب المدة

  if (error) {
    console.error("❌ فشل تحميل سجل الخدمة:", error);
    return new Map();
  }

  const historyMap = new Map();

  // نرتب البيانات حسب employee_id
  const groupedByEmployee = {};

  data.forEach(record => {
    const empId = String(record.employee_id);
    if (!groupedByEmployee[empId]) {
      groupedByEmployee[empId] = [];
    }
    groupedByEmployee[empId].push(record);
  });

  for (const [empId, records] of Object.entries(groupedByEmployee)) {
    // ترتيب السجلات حسب التاريخ مثل ما تسوي بالسجل
    records.sort((a, b) => {
      const dateA = new Date(a.join_date || a.leave_date || "1900-01-01");
      const dateB = new Date(b.join_date || b.leave_date || "1900-01-01");
      return dateA - dateB;
    });

    const historyList = [];

    for (let i = 0; i < records.length; i++) {
      const entry = records[i];
      const nextEntry = records[i + 1] || null;
      const prevEntry = records[i - 1] || null;

      const duration = getServiceDuration(entry, nextEntry, prevEntry);

      historyList.push({
        ship: entry.ship,
        duration: duration
      });
    }

    historyMap.set(empId, historyList);
  }

  return historyMap;
}

function populateFilterDropdown(containerId, values) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = ""; // تنظيف الحاوية

  values.forEach(value => {
    // ✅ إنشاء label يحتضن checkbox + النص (أفضل تنسيق)
    const label = document.createElement("label");
    label.classList.add("checkbox-option");
    label.setAttribute("for", `${containerId}-${value}`);

    // ✅ إنشاء الجيك بوكس
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `${containerId}-${value}`;
    checkbox.value = value;
    checkbox.addEventListener("change", filterCrew); // فلترة مباشرة عند التغيير

    // ✅ إضافة النص بجانب الجيك
    const text = document.createTextNode(value);

    // ✅ ترتيبهم داخل الـ label
    label.appendChild(checkbox);
    label.appendChild(text);

    // ✅ إضافة الـ label إلى القائمة
    container.appendChild(label);
  });
}

// ✅ تصفية القائمة المنسدلة بناءً على البحث
function filterDropdown(containerId, inputElement) {
  const filter = inputElement.value.toLowerCase();
  const container = document.getElementById(containerId);
  if (!container) return;

  const labels = container.querySelectorAll("label");

  labels.forEach(label => {
    const text = label.textContent.toLowerCase();
    const match = text.includes(filter);
    label.style.display = match ? "flex" : "none"; // ✅ يختفي أو يظهر حسب البحث
  });
}

// ✅ تطبيق الفلترة عند الضغط على OK
function applyFilters() {
  // ✅ تحديث عدد المختارات داخل الأزرار
  updateFilterButtonText('ranks-container', 'ranks-button', '🎖 الرتب');
  updateFilterButtonText('ships-container', 'ships-button', '🚢 الناقلات');
  updateFilterButtonText('status-container', 'status-button', '🟢 الحالات');

  // ✅ شغل الفلترة
  filterCrew();

  // ✅ أغلق القوائم بعد الاختيار
  closeAllDropdowns();
}

function updateFilterButtonText(containerId, buttonId, label) {
  const checkboxes = document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`);
  const count = checkboxes.length;
  const button = document.getElementById(buttonId);
  if (button) {
    button.innerHTML = count > 0 ? `${label} (${count}) ⬇` : `${label} ⬇`;
  }
}

function closeAllDropdowns() {
    document.querySelectorAll(".dropdown-content").forEach(dropdown => {
        dropdown.classList.remove("active");
    });
}

// ✅ مسح التحديد عند الضغط على Cancel
function clearFilters(containerId) {
    let checkboxes = document.querySelectorAll(`#${containerId} input[type='checkbox']`);
    checkboxes.forEach(cb => cb.checked = false);
    filterCrew(); // ✅ إعادة تحميل كل البيانات
}

// ✅ تحميل الموظفين والفلاتر عند تشغيل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  loadEmployees(); // تحميل بيانات الموظفين
  // ✅ تشغيل الفلتر عند تغيير حالة الـ checkbox
document.getElementById("filter-incomplete-only")?.addEventListener("change", () => {
  loadEmployees(); // يعيد تحميل الجدول
});
  ensureFiltersContainer(); // يتأكد من وجود .filters-container

  // ✅ تحميل الفلاتر باستخدام الدالة الموحدة
  loadFilterOptions("rank", "ranks-container");
  loadFilterOptions("ship", "ships-container");
  loadFilterOptions("status", "status-container");
});

// ✅ إظهار نافذة إضافة موظف وتحميل البيانات
function showAddModal() {
  console.log("🟢 فتح نافذة إضافة موظف...");
  
  let modal = document.getElementById("addModal");
  if (!modal) {
      console.error("❌ خطأ: لم يتم العثور على نافذة إضافة الموظف!");
      return;
  }

  // تحميل القيم في القوائم المنسدلة
  loadAddModalData();

  // ✅ عرض نافذة الإضافة فقط
  modal.style.display = "flex";
}

// ✅ دالة إغلاق نافذة إضافة الموظف
function closeAddModal() {
    let modal = document.getElementById("addModal");
    if (modal) {
        modal.style.display = "none";
    } else {
        console.error("❌ خطأ: لم يتم العثور على نافذة الإضافة.");
    }
}

// ✅ جعل الدالة متاحة عالميًا
window.showAddModal = showAddModal;
window.closeAddModal = closeAddModal;

// ✅ دالة حفظ الموظف الجديد في قاعدة البيانات
async function saveNewCrewMember() {
    let name = document.getElementById("add-name").value;
    let rank = document.getElementById("add-rank").value;
    let ship = document.getElementById("add-ship").value || "غير محدد";
    let joinDate = document.getElementById("add-joinDate").value;
    let leaveDate = document.getElementById("add-leaveDate").value;
    let status = document.getElementById("add-status").value;
    let note = document.getElementById("add-note").value;

    let joinDuration = calculateDuration(joinDate, leaveDate);
    let leaveDuration = calculateDuration(leaveDate, new Date());

    let newEmployee = {
        name: name || null,
        rank: rank || null,
        ship: ship || "غير محدد",
        join_date: joinDate || null,
        join_duration: joinDuration,
        leave_date: leaveDate || null,
        leave_duration: leaveDuration,
        status: status || null,
        note: note || null,
    };

    console.log("📌 إضافة موظف جديد:", newEmployee);

    const { error } = await sb.from("crew_list").insert([newEmployee]);
    if (error) {
        console.error("❌ خطأ أثناء إضافة الموظف:", error);
        alert("⚠ حدث خطأ أثناء إضافة الموظف.");
    } else {
        alert("✅ تم إضافة الموظف بنجاح.");
        closeAddModal();
        loadEmployees();
    }
}

// ✅ جعل الدالة متاحة عالميًا
window.saveNewCrewMember = saveNewCrewMember;

// ✅ تحميل الفلاتر عند تشغيل الصفحة
async function loadFilterOptions(column, containerId) {
  console.log(`🚀 تحميل ${column} للفلاتر...`);
  
  let uniqueValues = [];

  if (column === "rank") {
    uniqueValues = [...rankOrder]; // ✅ استخدم القائمة المرتبة يدويًا
  } else {
    const { data, error } = await sb.from("crew_list").select(column);
    if (error) {
      console.error(`❌ خطأ أثناء جلب ${column}:`, error);
      return;
    }
    uniqueValues = [...new Set(data.map(row => row[column]).filter(Boolean))];
  }

  populateFilterDropdown(containerId, uniqueValues);
}


function toggleDropdown(dropdownId) {
    console.log("تم النقر على زر الفلتر:", dropdownId); // 🔍 التحقق من النقر على الزر
    let dropdown = document.getElementById(dropdownId);
    
    if (dropdown) {
        let allDropdowns = document.querySelectorAll(".dropdown-content");
        
        // إغلاق جميع القوائم الأخرى عند فتح واحدة جديدة
        allDropdowns.forEach(menu => {
            if (menu.id !== dropdownId) {
                menu.classList.remove("active");
            }
        });

        // تبديل حالة القائمة المنسدلة
        dropdown.classList.toggle("active");
        console.log("تم تبديل حالة القائمة:", dropdown.classList.contains("active")); // 🔍 التحقق من تفعيلها
    } else {
        console.error("❌ القائمة غير موجودة:", dropdownId);
    }
}

// ✅ دالة البحث عن اسم الموظف
function searchByName() {
    let input = document.getElementById("search-input").value.toLowerCase();
    let rows = document.querySelectorAll("#employee-table-body tr");

    rows.forEach(row => {
        let nameCell = row.cells[1].textContent.toLowerCase(); // عمود الاسم
        if (nameCell.includes(input)) {
            row.style.display = ""; // عرض الصف إذا كان مطابق
        } else {
            row.style.display = "none"; // إخفاء الصف إذا لم يكن مطابق
        }
    });

    updateRowIndices(); // تحديث أرقام الصفوف بعد البحث
}

function generatePrintSummary() {
    let summaryData = {}; // تخزين عدد الموظفين لكل رتبة
    let rows = document.querySelectorAll("#employee-table-body tr");

    rows.forEach(row => {
        if (row.style.display !== "none") { // ✅ يأخذ فقط البيانات الظاهرة (المفلترة)
            let rank = row.cells[2].textContent.trim();
            if (!summaryData[rank]) {
                summaryData[rank] = 0;
            }
            summaryData[rank]++;
        }
    });

    let summaryPrintBody = document.getElementById("summary-print-body");
    summaryPrintBody.innerHTML = ""; // تفريغ الجدول قبل التحديث

    if (Object.keys(summaryData).length === 0) {
        summaryPrintBody.innerHTML = "<tr><td colspan='2'>لا توجد بيانات مطابقة للفلاتر</td></tr>";
        return;
    }

    Object.entries(summaryData).forEach(([rank, count]) => {
        let row = document.createElement("tr");
        row.innerHTML = `<td>${rank}</td><td>${count}</td>`;
        summaryPrintBody.appendChild(row);
    });

    // ✅ جعل جدول الملخص للطباعة مرئيًا فقط أثناء الطباعة
    document.querySelector(".summary-table-print").style.display = "table";
}

function getSelectedItems(containerId) {
  const checkboxes = document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`);
  return Array.from(checkboxes).map(cb => cb.value);
}

function generateFilterSummaryHTML() {
  const selectedRanks = getSelectedItems('ranks-container');
  const selectedShips = getSelectedItems('ships-container');
  const selectedStatuses = getSelectedItems('status-container');

  let summary = "";

  if (selectedRanks.length > 0) {
    summary += `🎖 الرتب: ${selectedRanks.join(", ")}<br>`;
  }
  if (selectedShips.length > 0) {
    summary += `⛴️ الناقلات: ${selectedShips.join(", ")}<br>`;
  }
  if (selectedStatuses.length > 0) {
    summary += `🟢 الحالات: ${selectedStatuses.join(", ")}<br>`;
  }

  return summary || "لا توجد فلاتر مفعّلة.";
}

function printFilteredData() {
    updateSummaryTable(); // تحديث ملخص الطاقم بناءً على البيانات المفلترة

    let filteredRows = Array.from(document.querySelectorAll("#employee-table-body tr"))
        .filter(row => row.style.display !== "none"); // الاحتفاظ فقط بالبيانات المفلترة

    if (filteredRows.length === 0) {
        alert("⚠ لا توجد بيانات للطباعة بناءً على الفلترة الحالية.");
        return;
    }

    // جلب التاريخ الحالي للطباعة
    let printDate = new Date().toLocaleDateString('ar-IQ');

    let printWindow = window.open('', '', 'width=1000,height=800');
    printWindow.document.write(`
        <html dir="rtl">
        <head>
            <title>🖨️ تقرير طواقم شركة ناقلات النفط</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                @page { size: A4 landscape; margin: 15mm; }
                body { 
                    font-family: 'Cairo', sans-serif; 
                    color: #000; 
                    background: #fff; 
                    font-size: 12px; 
                    margin: 0;
                }
                .print-header { 
                    text-align: center; 
                    margin-bottom: 20px; 
                    border-bottom: 3px solid #1a237e; 
                    padding-bottom: 10px; 
                }
                .print-header h1 { font-size: 24px; color: #1a237e; margin: 0; }
                .print-header h2 { font-size: 16px; color: #555; margin: 5px 0 0 0; font-weight: 600; }
                .meta-info { 
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 20px; 
                    font-size: 13px; 
                    background: #f9f9f9; 
                    padding: 10px 15px; 
                    border: 1px solid #ddd; 
                    border-radius: 6px; 
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 20px; 
                }
                th, td { 
                    border: 1px solid #333; 
                    padding: 8px 4px; 
                    text-align: center; 
                    vertical-align: middle; 
                    word-wrap: break-word; 
                }
                th { 
                    background-color: #e0e0e0; 
                    font-weight: bold; 
                    font-size: 13px; 
                    color: #000;
                }
                .summary-table { width: 40%; margin: 0 auto 20px; }
                tr { page-break-inside: avoid; } /* تمنع انقسام الصف بين صفحتين */
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1>⚓ شركة ناقلات النفط العراقية</h1>
                <h2>قسم الملاحين - شعبة التطقيم | تقرير الطواقم المفلتر</h2>
            </div>

            <div class="meta-info">
                <div><strong>الفلاتر المطبقة:</strong><br>${generateFilterSummaryHTML() || "الكل (بدون فلاتر)"}</div>
                <div style="text-align: left;"><strong>تاريخ الطباعة:</strong> <br>${printDate}</div>
            </div>

            <table class="summary-table">
                <thead><tr><th>الرتبة</th><th>العدد</th></tr></thead>
                <tbody id="print-summary-body">${document.getElementById("summary-body").innerHTML}</tbody>
            </table>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>الاسم</th>
                        <th>الرقم الوظيفي</th> <!-- ضفنا العنوان هنا -->
                        <th>الرتبة</th>
                        <th>الناقلة</th>
                        <th>تاريخ الالتحاق</th>
                        <th>مدة الالتحاق</th>
                        <th>تاريخ النزول</th>
                        <th>مدة النزول</th>
                        <th>الحالة</th>
                        ${document.body.classList.contains("print-history") ? `<th>الخدمة السابقة</th>` : ""}
                        <th>الملاحظات</th>
                    </tr>
                </thead>
                <tbody>
                  ${filteredRows.map(row => {
                    let cells = row.querySelectorAll("td");
                    const showHistory = document.body.classList.contains("print-history");
                    let rowHtml = Array.from(cells).map((cell, index) => {
                      if (!showHistory && index === 10) return ''; // الخدمة السابقة (صار رقمها 10)
                      if (index === 12) return ''; // الإجراءات (صار رقمها 12)

                      if (index === 2) { // الرقم الوظيفي للطباعة
                        const printJobNum = cell.querySelector(".print-job-number-only");
                        return `<td>${printJobNum ? printJobNum.innerText : ""}</td>`;
                      }
                      if (index === 11) { // الملاحظات للطباعة
                        const printNote = cell.querySelector(".print-note-only");
                        return `<td>${printNote ? printNote.innerHTML : ""}</td>`;
                      }
                      return `<td>${cell.innerText}</td>`;
                    }).filter(Boolean).join('');
                    return `<tr>${rowHtml}</tr>`;
                  }).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `);

    printWindow.document.close();
    // تأخير بسيط لضمان تحميل الخطوط قبل ظهور نافذة الطباعة
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

function printSeaTime() {
  const table = document.getElementById("seaTimeTable");
  const name = document.getElementById("seaTimeModal")?.getAttribute("data-employee-name") || "بدون اسم";

  if (!table) {
    alert("❌ لم يتم العثور على جدول السجل.");
    return;
  }

  const printWindow = window.open('', '', 'width=900,height=700');

  printWindow.document.write(`
    <html>
    <head>
      <title>🖨️ سجل الخدمة البحرية</title>
      <style>
        body { font-family: 'Cairo', sans-serif; direction: rtl; text-align: center; }
        h2 { margin-top: 10px; }
        h3 { margin-top: 5px; font-weight: normal; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 8px; }
        th { background-color: #e3f2fd; color: #0d47a1; }
      </style>
    </head>
    <body>
      <h2>📄 سجل الخدمة البحرية</h2>
      <h3>الاسم: <strong>${name}</strong></h3>
      ${table.outerHTML}
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
}

function printCertificates() {
    const name = document.getElementById("profile-name").textContent;
    const certTable = document.querySelector("#certificateTableBody").innerHTML;
  
    const printWindow = window.open("", "", "width=900,height=700");
    printWindow.document.write(`
      <html><head><title>طباعة الشهادات</title>
      <style>
        body { font-family: Arial; direction: rtl; padding: 20px; }
        h2 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: center; }
        th { background-color: #dcedc8; }
      </style>
      </head><body>
      <h2>📄 شهادات الموظف</h2>
      <p>👤 الاسم: <strong>${name}</strong></p>
      <table>
        <thead>
          <tr>
            <th>اسم الشهادة</th>
            <th>تاريخ الإصدار</th>
            <th>تاريخ النفاذ</th>
          </tr>
        </thead>
        <tbody>${certTable}</tbody>
      </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
  
  function printSeaService() {
    const name = document.getElementById("profile-name").textContent;
    const seaTable = document.querySelector("#seaTimeProfileBody").innerHTML;
  
    const printWindow = window.open("", "", "width=900,height=700");
    printWindow.document.write(`
      <html><head><title>طباعة الخدمة البحرية</title>
      <style>
        body { font-family: Arial; direction: rtl; padding: 20px; }
        h2 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: center; }
        th { background-color: #bbdefb; }
      </style>
      </head><body>
      <h2>📄 سجل الخدمة البحرية</h2>
      <p>👤 الاسم: <strong>${name}</strong></p>
      <table>
        <thead>
          <tr>
            <th>الناقلة</th>
            <th>الحالة</th>
            <th>من تاريخ</th>
            <th>إلى تاريخ</th>
            <th>المدة</th>
            <th>الرتبة</th>
          </tr>
        </thead>
        <tbody>${seaTable}</tbody>
      </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }  

function updateSummaryTable() {
    let summaryBody = document.getElementById("summary-body");
    let rows = Array.from(document.querySelectorAll("#employee-table-body tr"))
        .filter(row => row.style.display !== "none");

    let rankCounts = {};

    rows.forEach(row => {
        let rank = row.cells[2].textContent.trim();
        rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });

    summaryBody.innerHTML = Object.entries(rankCounts)
        .map(([rank, count]) => `<tr><td>${rank}</td><td>${count}</td></tr>`)
        .join('');
}

// ✅ جلب الموظفين بعد الفلترة
function getFilteredEmployees() {
    let rows = document.querySelectorAll("#employee-table-body tr");
    let employees = [];

    rows.forEach(row => {
        if (row.style.display !== "none") {
            let crew = {
                rank: row.cells[2].textContent.trim(),
            };
            employees.push(crew);
        }
    });

    return employees;
}

function exportFilteredToExcel() {
  const table = document.getElementById("employee-table-body");
  const rows = Array.from(table.querySelectorAll("tr"))
    .filter(row => row.style.display !== "none") // فقط الصفوف الظاهرة

  if (rows.length === 0) {
    alert("⚠ لا توجد بيانات حالياً للتصدير");
    return;
  }

  const data = [];
  const headers = [
    "الاسم", "الرتبة", "الناقلة", "تاريخ الصعود", "مدة الصعود", "تاريخ النزول", "مدة النزول", "الحالة", "ملاحظات"
  ];

  data.push(headers);

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    const rowData = [
      cells[1]?.textContent.trim(), // الاسم
      cells[2]?.textContent.trim(), // الرتبة
      cells[3]?.textContent.trim(), // الناقلة
      cells[4]?.textContent.trim(), // تاريخ الصعود
      cells[5]?.textContent.trim(), // مدة الصعود
      cells[6]?.textContent.trim(), // تاريخ النزول
      cells[7]?.textContent.trim(), // مدة النزول
      cells[8]?.textContent.trim(), // الحالة
      cells[9]?.textContent.trim(), // الملاحظات
    ];
    data.push(rowData);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "طاقم السفينة");

  XLSX.writeFile(workbook, "crew_list_backup.xlsx");
}

function showEmployeeProfile(id) {
    window.open(`employee-profile.html?id=${id}`, "_blank", "width=1000,height=700");
  }
  
  window.showEmployeeProfile = showEmployeeProfile;  

// ✅ فرز البيانات حسب مدة النزول (تصاعدي / تنازلي)
function sortByLeaveDuration(order) {
  let tableBody = document.getElementById("employee-table-body");
  let rows = Array.from(tableBody.rows);

  rows.sort((a, b) => {
    let durationA = a.querySelector(".leave-duration")
      ? parseInt(
          a.querySelector(".leave-duration").textContent.replace(" يوم", "").trim()
        )
      : 0;
    let durationB = b.querySelector(".leave-duration")
      ? parseInt(
          b.querySelector(".leave-duration").textContent.replace(" يوم", "").trim()
        )
      : 0;

    durationA = isNaN(durationA) ? 0 : durationA;
    durationB = isNaN(durationB) ? 0 : durationB;

    return order === "asc" ? durationA - durationB : durationB - durationA;
  });

  rows.forEach((row) => tableBody.appendChild(row));
}

function updatePrintFiltersSummary() {
  const selectedRanks = getSelectedItems('ranks-container');
  const selectedShips = getSelectedItems('ships-container');
  const selectedStatuses = getSelectedItems('status-container');

  let summary = "";

  if (selectedRanks.length > 0) {
    summary += `🎖 الرتب: ${selectedRanks.join(", ")}<br>`;
  }
  if (selectedShips.length > 0) {
    summary += `⛴️ الناقلات: ${selectedShips.join(", ")}<br>`;
  }
  if (selectedStatuses.length > 0) {
    summary += `🟢 الحالات: ${selectedStatuses.join(", ")}<br>`;
  }

  document.getElementById("print-filter-summary").style.display = "block";
  document.getElementById("filter-details-print").innerHTML = summary;
}

document.addEventListener("DOMContentLoaded", () => {
  loadEmployees();
  ensureFiltersContainer();
  loadFilterOptions("rank", "ranks-container");
  loadFilterOptions("ship", "ships-container");
  loadFilterOptions("status", "status-container");

  // ✅ إظهار/إخفاء عمود الخدمة السابقة
  const checkbox = document.getElementById("toggle-history-col");
  const table = document.querySelector(".table-container table");

  if (table) {
    table.classList.add("hide-history");
  }

  if (checkbox) {
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        table.classList.remove("hide-history");
        document.body.classList.add("print-history");
      } else {
        table.classList.add("hide-history");
        document.body.classList.remove("print-history");
      }
    });
  }
});

// ✅ جعل الدوال متاحة عالميًا
window.loadEmployees = loadEmployees;
window.filterCrew = filterCrew;
window.editCrewMember = editCrewMember;
window.deleteCrewMember = deleteCrewMember;
window.closeEditModal = closeEditModal;
window.saveEditCrewMember = saveEditCrewMember;
window.updateRowIndices = updateRowIndices;
window.sortByLeaveDuration = sortByLeaveDuration;
window.showSeaTime = showSeaTime;
window.closeSeaTimeModal = closeSeaTimeModal;
// ✅ زر تثبيت التطبيق (PWA)
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const installBtn = document.getElementById('install-app-btn');
  if (installBtn) {
    installBtn.style.display = 'block';

    installBtn.addEventListener('click', () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();

        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('✅ تم تثبيت التطبيق');
          } else {
            console.log('❌ تم إلغاء التثبيت');
          }
          deferredPrompt = null;
          installBtn.style.display = 'none';
        });
      }
    });
  }
});
