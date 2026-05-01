$(document).ready(function() {
    $("#addBtn").click(function() {
        addExpense();
    });

    // Allow Enter key to add expense
    $(document).keypress(function(e) {
        if (e.which == 13 && ($("#category").is(":focus") || $("#amount").is(":focus") || $("#date").is(":focus"))) {
            addExpense();
        }
    });
});

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let chart;

displayExpenses();
calculateTotal();
renderChart();

function addExpense() {
    let category = $("#category").val().trim();
    let amount = parseFloat($("#amount").val());
    let date = $("#date").val();

    if (category === "" || isNaN(amount) || amount <= 0 || date === "") {
        showNotification("Please enter all details correctly", "error");
        return;
    }

    let expense = {
        category: category,
        amount: amount,
        date: date,
        id: Date.now() // Add unique ID
    };

    expenses.push(expense);
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending

    saveToLocalStorage();
    displayExpenses();
    calculateTotal();
    renderChart();

    // Clear inputs
    document.getElementById("category").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";

    showNotification("Expense added successfully!", "success");
    document.getElementById("category").focus();
}

function displayExpenses() {
    let list = document.getElementById("expenseList");
    list.innerHTML = "";

    if (expenses.length === 0) {
        list.innerHTML = '<li style="text-align: center; color: #718096; padding: 30px;">No expenses yet. Add one to get started!</li>';
        return;
    }

    expenses.forEach(function (exp, index) {
        let li = document.createElement("li");
        let formattedDate = formatDate(exp.date);

        li.innerHTML = `
            <div>
                <strong>${escapeHtml(exp.category)}</strong> - ₹${exp.amount.toFixed(2)}
                <br>
                <small>${formattedDate}</small>
            </div>
            <button class="delete-btn" onclick="deleteExpense(${index})">
                <i class="fas fa-trash"></i> Delete
            </button>
        `;

        list.appendChild(li);
    });
}

function deleteExpense(index) {
    if (confirm("Are you sure you want to delete this expense?")) {
        expenses.splice(index, 1);
        saveToLocalStorage();
        displayExpenses();
        calculateTotal();
        renderChart();
        showNotification("Expense deleted successfully!", "success");
    }
}

function clearAll() {
    if (expenses.length === 0) {
        showNotification("No expenses to clear", "warning");
        return;
    }

    if (confirm("Are you sure you want to delete all expenses? This cannot be undone.")) {
        expenses = [];
        saveToLocalStorage();
        displayExpenses();
        calculateTotal();
        renderChart();
        showNotification("All expenses cleared!", "success");
    }
}

function calculateTotal() {
    let total = 0;
    let highest = 0;
    let average = 0;

    if (expenses.length > 0) {
        expenses.forEach(function (exp) {
            total += exp.amount;
            if (exp.amount > highest) {
                highest = exp.amount;
            }
        });
        average = (total / expenses.length).toFixed(2);
    }

    document.getElementById("total").textContent = total.toFixed(2);

    let summaryHtml = `
        <strong>📊 Summary:</strong><br>
        Transactions: <strong>${expenses.length}</strong> | 
        Average: <strong>₹${average}</strong> | 
        Highest: <strong>₹${highest.toFixed(2)}</strong>
    `;

    document.getElementById("summary").innerHTML = summaryHtml;
}

function saveToLocalStorage() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}

function renderChart() {
    let categoryTotals = {};

    expenses.forEach(function (exp) {
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

    if (labels.length === 0) {
        ctx.fillStyle = "#cbd5e0";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("No data to display", ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }

    // Generate random colors
    let colors = generateColors(labels.length);

    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: "#ffffff",
                borderWidth: 3,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        padding: 15,
                        font: {
                            size: 13,
                            weight: 600
                        },
                        boxWidth: 12,
                        boxHeight: 12,
                        borderRadius: 3,
                        color: "#2d3748"
                    }
                },
                datalabels: {
                    color: "#ffffff",
                    font: {
                        weight: "bold",
                        size: 13
                    },
                    formatter: (value, context) => {
                        let total = context.chart.data.datasets[0].data
                            .reduce((a, b) => a + b, 0);
                        let percentage = (value / total * 100).toFixed(1);
                        return percentage + "%";
                    }
                },
                tooltip: {
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: "bold"
                    },
                    bodyFont: {
                        size: 13
                    },
                    borderColor: "#667eea",
                    borderWidth: 1
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// UTILITY FUNCTIONS

function formatDate(dateStr) {
    let options = { year: 'numeric', month: 'short', day: 'numeric' };
    let date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-IN', options);
}

function generateColors(count) {
    const baseColors = [
        '#667eea', '#764ba2', '#f093fb', '#4facfe',
        '#43e97b', '#fa709a', '#fee140', '#30cfd0',
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731',
        '#5f27cd', '#00d2d3', '#ff9ff3', '#54a0ff'
    ];

    let colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
}

function escapeHtml(text) {
    let map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showNotification(message, type) {
    // Create notification element
    let notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 14px 20px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-width: 300px;
    `;

    if (type === 'success') {
        notification.style.backgroundColor = '#48bb78';
        notification.style.color = 'white';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#e53e3e';
        notification.style.color = 'white';
    } else if (type === 'warning') {
        notification.style.backgroundColor = '#ed8936';
        notification.style.color = 'white';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    // Add animation keyframes if not already present
    if (!document.getElementById('notification-animation')) {
        let style = document.createElement('style');
        style.id = 'notification-animation';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
