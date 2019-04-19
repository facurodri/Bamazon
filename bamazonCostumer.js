var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("cli-table");

var connection = mysql.createConnection({
    host: "localhost",
    // Your port; if not 3306
    port: 3306,
    // Your username
    user: "root",
    // Your password
    password: "Maradona10!",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    startProgram();
});


function startProgram() {
    console.log("\n\rBamazon Inventory\n\r");
    connection.query("SELECT * FROM products", function (err, response) {
        if (err) throw err;
        var table = new Table({
            head: ['ID', 'Product Name', 'Department', 'Price', 'Stock']
            , colWidths: [5, 25, 25, 10, 10]
        });
        for (var i = 0; i < response.length; i++) {
            table.push(
                [response[i].item_id, response[i].product_name, response[i].department_name, response[i].price, response[i].stock_quantity]
            );
        }
        console.log(table.toString());
        productSale();
    })
    // table is an Array, so you can `push`, `unshift`, `splice` and friends
    // connection.end();
}

function productSale() {
    inquirer
        .prompt([{
            name: "id",
            type: "list",
            message: "Select [BUY] or [Exit] Program?",
            choices: ["BUY", "EXIT"]
        }]).then(function (response) {
            if (response.id === "BUY") {
                //run DB function check connected IDs
                checkingSale();
            } else {
                connection.end();
            }

        })
}

function checkingSale() {
    inquirer.prompt([
        {
            name: "choice",
            type: "input",
            message: "Select by ID the item would you like to buy?"
        },
        {
            name: "amount",
            type: "input",
            message: "How many would you like to buy?"
        }
    ])
        .then(function (answer) {
            connection.query("SELECT * FROM products WHERE ?", { item_id: answer.choice }, function (err, res) {
                if (res[0].stock_quantity < parseInt(answer.amount)) {
                    console.log("\r\nUh Oh! Sorry, We are currently low on that item!");
                    console.log("\r\nItem Selected Id: #" + res[0].item_id + "\r\n");
                    console.log("Product Name: " + res[0].product_name);
                    console.log("Department: " + res[0].department_name);
                    console.log("Price: $" + parseInt(res[0].price));
                    console.log("Current in Stock Available: " + res[0].stock_quantity);
                    console.log("\r\nPlease pick a new amount\r\n");
                    checkingSale();
                } else {
                    var idChoice = answer.choice;
                    console.log("\n\r-^-^-^-^-^-^-^-^-^-\n\r");
                    console.log("Product ID: #" + idChoice);
                    console.log("You Ordered: "+ res[0].product_name);
                    console.log("Amount Purchacing: " + answer.amount);
                    console.log("\n\rTotal Price: $"+ (res[0].price * answer.amount).toFixed(2));
                    var newAmount = (res[0].stock_quantity) - (answer.amount);
                    var sqlVar = [ newAmount, idChoice ];
                    connection.query("UPDATE products SET stock_quantity=? WHERE item_id=?", sqlVar, function (err, res) {
                        if (err) throw err;
                        // console.log("this should be total: " + (res[0].price * answer.amount) );
                    });
                    console.log("\n\r-^-^-^-^-^-^-^-^-^-\n\r");
                    console.log("\r\n--------Updated Inventory--------\n\r");
                    console.log("Product Left: " + newAmount);
                }
                if (err) throw err;
                startProgram();
            });
        }
        )
};



