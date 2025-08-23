let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let chart;
let chartType = "pie";
let editIndex = null;
let dragOffsetX,
  dragOffsetY,
  isDragging = false;
const MONTHLY_BUDGET = 5000;

const categoryColors = {
  Canteen: "#f87171",
  Travel: "#22d3ee",
  Books: "#818cf8",
  Misc: "#fbbf24",
};

function toggleSummaryVisibility() {
  const summary = document.getElementById("summarySection");
  summary.style.display = expenses.length === 0 ? "none" : "block";
}

function showError(msg) {
  alert(msg);
}

function addExpense() {
  let amount = document.getElementById("amount").value.trim();
  let category = document.getElementById("category").value;
  let desc = document.getElementById("desc").value.trim();
  let date = document.getElementById("date").value;

  if (!amount || amount <= 0) {
    showError("Please enter a valid amount!");
    return;
  }
  if (!date) {
    showError("Please enter a valid date!");
    return;
  }
  if (new Date(date) > new Date()) {
    showError("Future dates are not allowed!");
    return;
  }

  let expense = { amount: parseFloat(amount), category, desc, date };
  const addBtn = document.querySelector(".input-group button");

  if (editIndex !== null) {
    expenses[editIndex] = expense;
    editIndex = null;
    addBtn.innerText = "╋ Add";
    addBtn.classList.remove("update-mode");
    document
      .querySelectorAll("tr.editing")
      .forEach((row) => row.classList.remove("editing"));
  } else {
    expenses.push(expense);
  }

  localStorage.setItem("expenses", JSON.stringify(expenses));
  displayExpenses();
  updateChart();
  updateBudgetBar();

  document.getElementById("amount").value = "";
  document.getElementById("desc").value = "";
  document.getElementById("date").value = "";
}

function displayExpenses() {
  let table = document.getElementById("expenseTable");
  table.innerHTML = "";
  let total = 0;

  expenses.forEach((exp, index) => {
    total += exp.amount;
    let row = `<tr id="row-${index}">
      <td style="color:${categoryColors[exp.category] || "#e2e8f0"}">₹${
      exp.amount
    }</td>
      <td style="color:${categoryColors[exp.category] || "#e2e8f0"}">${
      exp.category
    }</td>
      <td>${exp.desc || "-"}</td>
      <td>${formatDate(exp.date)}</td>
      <td>
        <button onclick="editExpense(${index})">✏️</button>
        <button onclick="deleteExpense(${index})">❌</button>
      </td>
    </tr>`;
    table.innerHTML += row;
  });

  if (expenses.length > 0) {
    let totalRow = `<tr style="font-weight:bold; background:#334155; color:#f1f5f9">
      <td colspan="5">Total: ₹${total}</td>
    </tr>`;
    table.innerHTML += totalRow;
  }

  toggleSummaryVisibility();
}

function editExpense(index) {
  let exp = expenses[index];
  document.getElementById("amount").value = exp.amount;
  document.getElementById("category").value = exp.category;
  document.getElementById("desc").value = exp.desc;
  document.getElementById("date").value = exp.date;
  editIndex = index;

  const addBtn = document.querySelector(".input-group button");
  addBtn.innerText = "Update";
  addBtn.classList.add("update-mode");

  document
    .querySelectorAll("tr.editing")
    .forEach((row) => row.classList.remove("editing"));
  let editingRow = document.getElementById(`row-${index}`);
  if (editingRow) editingRow.classList.add("editing");
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  displayExpenses();
  updateChart();
  updateBudgetBar();
}

function clearAll() {
  if (confirm("Are you sure you want to clear all expenses?")) {
    expenses = [];
    localStorage.removeItem("expenses");
    displayExpenses();
    updateChart();
    updateBudgetBar();
  }
}

function formatDate(dateStr) {
  let options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}

function updateChart() {
  let categoryTotals = {};
  expenses.forEach((exp) => {
    categoryTotals[exp.category] =
      (categoryTotals[exp.category] || 0) + exp.amount;
  });

  let ctx = document.getElementById("expenseChart").getContext("2d");
  if (chart) chart.destroy();

  if (expenses.length > 0) {
    chart = new Chart(ctx, {
      type: chartType,
      data: {
        labels: Object.keys(categoryTotals),
        datasets: [
          {
            data: Object.values(categoryTotals),
            backgroundColor: Object.keys(categoryTotals).map(
              (cat) => categoryColors[cat] || "#64748b"
            ),
            borderRadius: chartType === "bar" ? 12 : 0,
            borderWidth: 2,
            borderColor: "#0f172a",
            hoverOffset: 12,
            radius: chartType === "pie" ? "75%" : undefined,
            barThickness: chartType === "bar" ? 40 : undefined,
            maxBarThickness: chartType === "bar" ? 50 : undefined,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#f1f5f9",
              font: {
                family: "Inter, sans-serif",
                size: 14,
                weight: "600",
              },
              padding: 14,
            },
          },
          tooltip: {
            backgroundColor: "#1e293b",
            titleColor: "#f1f5f9",
            bodyColor: "#e2e8f0",
            borderColor: "#334155",
            borderWidth: 1,
          },
        },
        scales:
          chartType === "bar"
            ? {
                x: {
                  ticks: {
                    color: "#f1f5f9",
                    font: {
                      family: "Inter, sans-serif",
                      size: 13,
                      weight: "500",
                    },
                  },
                  grid: { color: "rgba(255,255,255,0.1)" },
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: "#f1f5f9",
                    font: {
                      family: "Inter, sans-serif",
                      size: 13,
                      weight: "500",
                    },
                  },
                  grid: { color: "rgba(255,255,255,0.1)" },
                },
              }
            : {},
      },
    });
  }
}

function toggleChartType() {
  chartType = chartType === "pie" ? "bar" : "pie";
  updateChart();
}

function updateBudgetBar() {
  let total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  let percent = Math.min((total / MONTHLY_BUDGET) * 100, 100);
  document.getElementById("budgetBar").style.width = percent + "%";
}
function toggleChat() {
  const chatbot = document.getElementById("chatbot");
  const toggleBtn = document.getElementById("chat-toggle");
  const chatBox = document.getElementById("chat-messages");

  if (chatbot.style.display === "none" || chatbot.style.display === "") {
    chatbot.style.display = "flex";
    toggleBtn.style.display = "none";

    if (chatBox.innerHTML.trim() === "") {
      chatBox.innerHTML = `<div style=\"background:#273449; padding:8px; border-radius:8px; margin-bottom:6px; color:#e2e8f0\"><b>Bot:</b> 👋 Hi! I can help you with your expenses.<br>
        - \"What is my total?\"<br>
        - \"What is my biggest expense?\"<br>
        - \"Add 200 to Canteen today\"<br>
        - \"Show me Travel expenses\"<br>
        - \"Expenses this month\"<br>
        - \"Expenses last week\"<br>
        - \"Expenses in July\"<br>
        - \"Clear all expenses\"</div>`;
    }
  } else {
    chatbot.style.display = "none";
    toggleBtn.style.display = "block";
  }
}

function sendMessage() {
  let input = document.getElementById("chatText").value.trim();
  if (!input) return;

  let chatBox = document.getElementById("chat-messages");
  chatBox.innerHTML += `<div style=\"background:#374151; padding:6px; border-radius:6px; margin-bottom:6px; color:#f1f5f9\"><b>You:</b> ${input}</div>`;

  let response = handleChatCommand(input);

  chatBox.innerHTML += `<div style=\"background:#273449; padding:6px; border-radius:6px; margin-bottom:6px; color:#e2e8f0\"><b>Bot:</b> ${response}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  document.getElementById("chatText").value = "";
}

function handleChatCommand(input) {
  let lowerInput = input.toLowerCase();

  if (lowerInput.includes("total")) {
    let total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    return `Your total expenses are <b style=\"color:#818cf8\">₹${total}</b>.`;
  }

  if (lowerInput.includes("biggest")) {
    let categoryTotals = {};
    expenses.forEach((exp) => {
      categoryTotals[exp.category] =
        (categoryTotals[exp.category] || 0) + exp.amount;
    });
    if (Object.keys(categoryTotals).length > 0) {
      let maxCat = Object.keys(categoryTotals).reduce((a, b) =>
        categoryTotals[a] > categoryTotals[b] ? a : b
      );
      return `Your biggest spending is on <b style=\"color:${categoryColors[maxCat]}\">${maxCat}</b> (₹${categoryTotals[maxCat]}).`;
    } else {
      return "No expenses recorded yet.";
    }
  }

  if (lowerInput.startsWith("add")) {
    let match = input.match(/add (\d+) to (\w+)(?: on (.+))?/i);
    if (match) {
      let amount = parseFloat(match[1]);
      let category = match[2].charAt(0).toUpperCase() + match[2].slice(1);
      let date = match[3] ? new Date(match[3]) : new Date();
      if (isNaN(amount) || !categoryColors[category]) {
        return "I couldn’t understand the category or amount.";
      }
      expenses.push({
        amount,
        category,
        desc: "Added via chat",
        date: date.toISOString().split("T")[0],
      });
      localStorage.setItem("expenses", JSON.stringify(expenses));
      displayExpenses();
      updateChart();
      updateBudgetBar();
      return `Added <b>₹${amount}</b> to <b style=\"color:${categoryColors[category]}\">${category}</b>!`;
    }
    return "Try: Add 200 to Travel today";
  }

  if (lowerInput.includes("show me")) {
    let catMatch = input.match(/show me (\w+)/i);
    if (catMatch) {
      let category = catMatch[1].charAt(0).toUpperCase() + catMatch[1].slice(1);
      let total = expenses
        .filter((e) => e.category === category)
        .reduce((sum, e) => sum + e.amount, 0);
      return total > 0
        ? `You’ve spent <b>₹${total}</b> on <b style=\"color:${categoryColors[category]}\">${category}</b>.`
        : `No expenses found for ${category}.`;
    }
  }
  if (lowerInput.includes("this month")) {
    let now = new Date();
    let total = expenses
      .filter((e) => {
        let d = new Date(e.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, e) => sum + e.amount, 0);
    return `This month’s expenses: <b>₹${total}</b>`;
  }

  if (lowerInput.includes("last week")) {
    let now = new Date();
    let weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    let total = expenses
      .filter((e) => {
        let d = new Date(e.date);
        return d >= weekAgo && d <= now;
      })
      .reduce((sum, e) => sum + e.amount, 0);
    return `Expenses in the last 7 days: <b>₹${total}</b>`;
  }

  let monthMatch = input.match(/expenses in (\w+)/i);
  if (monthMatch) {
    let monthName = monthMatch[1].toLowerCase();
    let monthIndex = new Date(Date.parse(monthName + " 1, 2023")).getMonth();
    let total = expenses
      .filter((e) => new Date(e.date).getMonth() === monthIndex)
      .reduce((sum, e) => sum + e.amount, 0);
    return `Expenses in ${
      monthName.charAt(0).toUpperCase() + monthName.slice(1)
    }: <b>₹${total}</b>`;
  }

  if (lowerInput.includes("clear all")) {
    clearAll();
    return "All expenses cleared!";
  }

  return "I didn’t understand that. Try: Add 200 to Travel today, Show me Canteen expenses, or Expenses this month.";
}

function startDrag(e) {
  isDragging = true;
  const chatbot = document.getElementById("chatbot");
  dragOffsetX = e.clientX - chatbot.getBoundingClientRect().left;
  dragOffsetY = e.clientY - chatbot.getBoundingClientRect().top;
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", stopDrag);
}

function drag(e) {
  if (isDragging) {
    const chatbot = document.getElementById("chatbot");
    chatbot.style.left = e.clientX - dragOffsetX + "px";
    chatbot.style.top = e.clientY - dragOffsetY + "px";
    chatbot.style.right = "auto";
    chatbot.style.bottom = "auto";
    chatbot.style.position = "fixed";
  }
}
