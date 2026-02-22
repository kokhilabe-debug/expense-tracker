let expenses = [];   // JSON array

function addExpense() {

    let category = document.getElementById("category").value;
    let amount = parseFloat(document.getElementById("amount").value);

    if(category === "" || isNaN(amount)) {
        alert("Please enter valid details");
        return;
    }

    // JSON object
    let expense = {
        category: category,
        amount: amount
    };

    expenses.push(expense);

    displayExpenses();
    calculateTotal();

    document.getElementById("category").value = "";
    document.getElementById("amount").value = "";
}

function displayExpenses() {
    let list = document.getElementById("expenseList");
    list.innerHTML = "";

    expenses.forEach(function(exp) {
        let li = document.createElement("li");
        li.textContent = exp.category + " - ₹" + exp.amount;
        list.appendChild(li);
    });
}

function calculateTotal() {
    let total = 0;

    expenses.forEach(function(exp) {
        total += exp.amount;
    });

    document.getElementById("total").textContent = total;
}