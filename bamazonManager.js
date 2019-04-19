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
    managerScreen();
});

function exitAp() {
    inquirer
        .prompt([{
            name: "yes",
            message: "Exit?",
            type: "confirm"

        }]).then(function (response) {
            if (!response.yes) {
                managerScreen();
            } else {
                connection.end();
            }
        }
        )
}
function displayProducts() {

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
        managerScreen();
    })
}
function proTable (res) {
     var table = new Table({
            head: ['Item ID', 'Product Name', 'Department', 'In Stock']
            , colWidths: [10, 25, 25, 25]
        });
        for(var i =0; i < res.length ; i++){
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, res[i].stock_quantity]
            );

        }
        console.log(table.toString());
}
function lowItems() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
        if (err) throw err;
        if (res === undefined){
            console.log("Invalid Entry.Please type the correct amount")
        }
        console.log("\r\nUh oh, We are getting low on these items:\r\n");
            proTable(res);
        // console.log(res.stock_quantity);
        // if (!res.stock_quantity) {
        // } else {
        //     console.log("--------------------------------------------------\n");
        //     console.log("\nGood Job! Everything is Stocked\n");
        //     console.log("--------------------------------------------------\n");
        // }
        // for (var i = 0; i < res.length; i++) {
        //     if (res[i].stock_quantity <= 5) {
        //         console.log("--------------------------------------------------\n");

        //         if (table.length > 0) {
        //             console.log("--------------------------------------------------\n");
        //         }


        //     }
            // else {
            //     for (var j = 0; j < res.length; j++) {
            //         var inStock = [];
            //         if (res[j].stock_quantity > 5) {
            //             inStock.push(res[i].stock_quantity);
            //         }
            //     }

            // }
            
           
            console.log("\rGo back to the [Main Menu] for other options\r");
            console.log("Thank you\n");
            managerScreen();
        })
}

function addStock() {
    inquirer.prompt([
        {
            name: "userInput",
            type: "input",
            message: "Which item would you like to stock up?"
        },
        {
            type: "input",
            name: "amount",
            message: "How much would you like to add?"
        }
    ])
        .then(function (response) {
            connection.query("SELECT * FROM products WHERE ?", { item_id: response.userInput }, function (err, res) {
                if (err) throw err;
                var itemToAdd = parseInt(response.userInput);
                var newAmount = parseInt(res[0].stock_quantity) + parseInt(response.amount);
                var sqlVar = [newAmount, itemToAdd];
                connection.query("UPDATE products SET stock_quantity=? WHERE item_id=?", sqlVar, function (err, res) {
                    if (err) throw err;
                });
                if (!itemToAdd || itemToAdd === 0) {
                    console.log("Invalid Entry. Please try again");
                    addStock();
                } else {
                    console.log("\r\nItem Changed: " + res[0].product_name);
                    console.log("\r\nAmount Added to Stock: " + response.amount);
                    console.log("\r\nTotal Amount Of Units In Stock Now: " + newAmount + "\r\n");
                    managerScreen();
                }
            })
        });

}
function addProduct() {

    inquirer.prompt([
        {
            name: "department",
            type: "input",
            message: "Which Department would you like to add to?"
        },
        {
            type: "input",
            name: "itemName",
            message: "What is the name of New Product?"
        },
        {
            name: "unitPrice",
            type: "input",
            message: "Unit Price for New Item?"
        },
        {
            name: "stock",
            type: "input",
            message: "How much initial stock inventory?"
        }
    ])
        .then(function (response1) {
            connection.query("INSERT INTO products SET ?",
                {
                    department_name: response1.department,
                    product_name: response1.itemName,
                    price: response1.unitPrice,
                    stock_quantity: response1.stock
                }, function (err, res) {
                    if (err) throw err;
                    console.log(response1.department);
                    console.log(response1.itemName);
                    console.log(response1.unitPrice);
                    console.log(response1.stock);
                    console.log("");
                    managerScreen();
                });
        }
        );

}

function managerScreen() {
    console.log("Welcome!\r");
    inquirer
        .prompt([{
            name: "id",
            type: "list",
            message: "\nWhat would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
        }]).then(function (response) {
            var choice = response.id;

            switch (choice) {
                case "View Products for Sale":
                    displayProducts();
                    break;
                case "View Low Inventory":
                    lowItems();
                    break;
                case "Add to Inventory":
                    addStock()
                    break;
                case "Add New Product":
                    addProduct()
                    break;
                default:
                    exitAp();
                // connection.end();
            }

        })
}