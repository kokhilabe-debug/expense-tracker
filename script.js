let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let chart;

displayExpenses();
calculateTotal();
renderChart();

function addExpense() {

    let category = document.getElementById("category").value;
    let amount = parseFloat(document.getElementById("amount").value);
    let date = document.getElementById("date").value;

    if (category === "" || isNaN(amount) || date === "") {
        alert("Please enter all details");
        return;
    }

    let expense = {
        category: category,
        amount: amount,
        date: date
    };

    expenses.push(expense);

    saveToLocalStorage();
    displayExpenses();
    calculateTotal();
    renderChart();

    document.getElementById("category").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";
}

function displayExpenses() {
    let list = document.getElementById("expenseList");
    list.innerHTML = "";

    expenses.forEach(function (exp, index) {

        let li = document.createElement("li");

        li.innerHTML = `
            <div>
                <strong>${exp.category}</strong> - ₹${exp.amount}
                <br>
                <small>${exp.date}</small>
            </div>
            <button class="delete-btn" onclick="deleteExpense(${index})">Delete</button>
        `;

        list.appendChild(li);
    });
}

function deleteExpense(index) {
    expenses.splice(index, 1);

    saveToLocalStorage();
    displayExpenses();
    calculateTotal();
    renderChart();
}

function clearAll() {
    expenses = [];
    saveToLocalStorage();
    displayExpenses();
    calculateTotal();
    renderChart();
}

function calculateTotal() {
    let total = 0;
    let highest = 0;

    expenses.forEach(function (exp) {
        total += exp.amount;
        if (exp.amount > highest) {
            highest = exp.amount;
        }
    });

    document.getElementById("total").textContent = total;

    document.getElementById("summary").innerHTML =
        `Transactions: ${expenses.length} | Highest Expense: ₹${highest}`;
}

function saveToLocalStorage() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function renderChart() {

    let categoryTotals = {};

    expenses.forEach(function(exp) {
        if (categoryTotals[exp.category]) {
            categoryTotals[exp.category] += exp.amount;
        } else {
            categoryTotals[exp.category] = exp.amount;
        }
    });

    let labels = Object.keys(categoryTotals);
    let data = Object.values(categoryTotals);

    let ctx = document.getElementById("expenseChart").getContext("2d");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: data
            }]
        },
        options: {
            plugins: {
                datalabels: {
                    color: "#fff",
                    font: {
                        weight: "bold"
                    },
                    formatter: function(value, context) {
                        let total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        let percentage = ((value / total) * 100).toFixed(1) + "%";
                        return percentage;
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

