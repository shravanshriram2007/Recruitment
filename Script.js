let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let chart;

// ✅ Hide/show summary depending on expenses
function toggleSummaryVisibility() {
  const summary = document.getElementById("summarySection");
  if (expenses.length === 0) {
    summary.style.display = "none";
  } else {
    summary.style.display = "block";
  }
}

function addExpense() {
  let amount = document.getElementById("amount").value;
  let category = document.getElementById("category").value;
  let desc = document.getElementById("desc").value;
  let date = document.getElementById("date").value;

  if (date === "" && amount === "") {
    alert("Please enter date and amount !");
    return;
  }
  if (amount === "" || amount < 0) {
    alert("Please enter a valid amount !");
    return;
  } else if (date === "") {
    alert("Please enter date !");
    return;
  }

  let expense = { amount: parseFloat(amount), category, desc, date };
  expenses.push(expense);
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
    let row = `<tr>
      <td>₹${exp.amount}</td>
      <td>${exp.category}</td>
      <td>${exp.desc || "-"}</td>
      <td>${formatDate(exp.date)}</td>
      <td><button onclick="deleteExpense(${index})">❌</button></td>
    </tr>`;
    table.innerHTML += row;
  });

  if (expenses.length > 0) {
    let totalRow = `<tr style="font-weight:bold; background:#eee">
      <td colspan="5">Total: ₹${total}</td>
    </tr>`;
    table.innerHTML += totalRow;
  }

  toggleSummaryVisibility(); // ✅ Update visibility
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  displayExpenses();
  updateChart();
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
      type: "pie",
      data: {
        labels: Object.keys(categoryTotals),
        datasets: [
          {
            data: Object.values(categoryTotals),
            backgroundColor: ["#667eea", "#43cea2", "#ff7675", "#fdcb6e"],
            radius: 300,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
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
displayExpenses();
updateChart();
toggleSummaryVisibility();
