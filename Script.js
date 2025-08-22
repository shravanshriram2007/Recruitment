let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let chart;
let editIndex = null;
let dragOffsetX,
  dragOffsetY,
  isDragging = false;

function toggleSummaryVisibility() {
  const summary = document.getElementById("summarySection");
  summary.style.display = expenses.length === 0 ? "none" : "block";
}

function addExpense() {
  let amount = document.getElementById("amount").value.trim();
  let category = document.getElementById("category").value;
  let desc = document.getElementById("desc").value.trim();
  let date = document.getElementById("date").value;

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount!");
    return;
  }
  if (!date) {
    alert("Please enter a valid date!");
    return;
  }
  if (new Date(date) > new Date()) {
    alert("Future dates are not allowed!");
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
      <td>₹${exp.amount}</td>
      <td>${exp.category}</td>
      <td>${exp.desc || "-"}</td>
      <td>${formatDate(exp.date)}</td>
      <td>
        <button onclick="editExpense(${index})">Edit</button>
        <button onclick="deleteExpense(${index})">❌</button>
      </td>
    </tr>`;
    table.innerHTML += row;
  });

  if (expenses.length > 0) {
    let totalRow = `<tr style="font-weight:bold; background:#eee">
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
}

function clearAll() {
  if (confirm("Are you sure you want to clear all expenses?")) {
    expenses = [];
    localStorage.removeItem("expenses");
    displayExpenses();
    updateChart();
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
    const categoryColors = {
      Canteen: "#ff7675",
      Travel: "#43cea2",
      Books: "#667eea",
      Misc: "#fdcb6e",
    };

    chart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: Object.keys(categoryTotals),
        datasets: [
          {
            data: Object.values(categoryTotals),
            backgroundColor: Object.keys(categoryTotals).map(
              (cat) => categoryColors[cat] || "#ccc"
            ),
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "black",
              font: {
                size: 14,
                weight: "bold",
                family: "Arial, sans-serif",
              },
            },
          },
        },
      },
    });
  }
}

/* ✅ Chatbot Functions */
function toggleChat() {
  const chatbot = document.getElementById("chatbot");
  const toggleBtn = document.getElementById("chat-toggle");
  const chatBox = document.getElementById("chat-messages");

  if (chatbot.style.display === "none" || chatbot.style.display === "") {
    chatbot.style.display = "flex";
    toggleBtn.style.display = "none";

    if (chatBox.innerHTML.trim() === "") {
      chatBox.innerHTML = `<div><b>Bot:</b> 👋 Hi! I can help you with your expenses.<br>
        - "What is my total?"<br>
        - "What is my biggest expense?"<br>
        - "Add 200 to Canteen today"<br>
        - "Show me Travel expenses"<br>
        - "Expenses this month"<br>
        - "Clear all expenses"<br>
        - "help" (see all options)</div>`;
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
  chatBox.innerHTML += `<div><b>You:</b> ${input}</div>`;

  let response = "I didn’t understand that.";
  let lowerInput = input.toLowerCase();

  if (lowerInput.includes("total")) {
    let total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    response = `Your total expenses are ₹${total}.`;
  } else if (lowerInput.includes("biggest")) {
    let categoryTotals = {};
    expenses.forEach((exp) => {
      categoryTotals[exp.category] =
        (categoryTotals[exp.category] || 0) + exp.amount;
    });
    if (Object.keys(categoryTotals).length > 0) {
      let maxCat = Object.keys(categoryTotals).reduce((a, b) =>
        categoryTotals[a] > categoryTotals[b] ? a : b
      );
      response = `Your biggest spending is on ${maxCat} (₹${categoryTotals[maxCat]}).`;
    } else {
      response = "No expenses recorded yet.";
    }
  } else if (lowerInput.includes("clear all")) {
    clearAll();
    response = "All expenses cleared!";
  } else if (lowerInput.startsWith("add")) {
    let match = input.match(/add\s+(\d+)\s+(?:to\s+)?(\w+)/i);
    if (match) {
      let amount = parseFloat(match[1]);
      let category =
        match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();
      let date = new Date().toISOString().split("T")[0];
      let expense = { amount, category, desc: "Added via chat", date };
      expenses.push(expense);
      localStorage.setItem("expenses", JSON.stringify(expenses));
      displayExpenses();
      updateChart();
      response = `Added ₹${amount} to ${category} (today).`;
    } else {
      response = "Please use format: Add 200 to Canteen today.";
    }
  } else if (lowerInput.startsWith("show me")) {
    let match = input.match(/show me (\w+)/i);
    if (match) {
      let category =
        match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      let filtered = expenses.filter((exp) => exp.category === category);
      if (filtered.length > 0) {
        response =
          `Here are your ${category} expenses:<br>` +
          filtered
            .map((exp) => `- ₹${exp.amount} (${formatDate(exp.date)})`)
            .join("<br>");
      } else {
        response = `No expenses found in ${category}.`;
      }
    }
  } else if (lowerInput.includes("this month")) {
    let now = new Date();
    let filtered = expenses.filter((exp) => {
      let d = new Date(exp.date);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    });
    if (filtered.length > 0) {
      let total = filtered.reduce((sum, exp) => sum + exp.amount, 0);
      response =
        `Your expenses this month are ₹${total}.<br>` +
        filtered
          .map(
            (exp) =>
              `- ₹${exp.amount} (${exp.category}, ${formatDate(exp.date)})`
          )
          .join("<br>");
    } else {
      response = "No expenses recorded this month.";
    }
  } else if (lowerInput.includes("help")) {
    response = `I can help you with:<br>
      - "What is my total?"<br>
      - "What is my biggest expense?"<br>
      - "Add 200 to Canteen today"<br>
      - "Show me Travel expenses"<br>
      - "Expenses this month"<br>
      - "Clear all expenses"`;
  }

  chatBox.innerHTML += `<div><b>Bot:</b> ${response}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;

  document.getElementById("chatText").value = "";
}

/* ✅ Dragging Logic */
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

function stopDrag() {
  isDragging = false;
  document.removeEventListener("mousemove", drag);
  document.removeEventListener("mouseup", stopDrag);
}

document.getElementById("chatText").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

displayExpenses();
updateChart();
