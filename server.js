// IMPORTING PACKAGES
const inquirer = require('inquirer');
const cTable = require('console.table');
const mysql = require('mysql2/promise');
require('dotenv').config();

// SETTING UP CONNECTION TO MYSQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'company_db'
}, console.log('Connected to company_db'));


let openingGraphic = `
 ______   __  __   _____    _         ____   __     __  ______   ______ 
|  ____| |  \\/  | |  __ \\  | |       / __ \\  \\ \\   / / |  ____| |  ____|
| |__    | \\  / | | |__) | | |      | |  | |  \\ \\_/ /  | |__    | |__   
|  __|   | |\\/| | |  ___/  | |      | |  | |   \\   /   |  __|   |  __|  
| |____  | |  | | | |      | |____  | |__| |    | |    | |____  | |____ 
|______| |_|  |_| |_|      |______|  \\____/     |_|    |______| |______|
 __  __              _   _               _____   ______   _____         
|  \\/  |     /\\     | \\ | |     /\\      / ____| |  ____| |  __ \\        
| \\  / |    /  \\    |  \\| |    /  \\    | |  __  | |__    | |__) |       
| |\\/| |   / /\\ \\   | . \` |   / /\\ \\   | | |_ | |  __|   |  _  /        
| |  | |  / ____ \\  | |\\  |  / ____ \\  | |__| | | |____  | | \\ \\        
|_|  |_| /_/    \\_\\ |_| \\_| /_/    \\_\\  \\_____| |______| |_|  \\_\\       
                                                                                                                                             
`
// HOME CHOICES AND HOME PROMPT
let homePromptChoices = [ 'view all departments', 'view all roles', 'view all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role' ];

let homePrompt = [
    {
        type: 'list',
        name: 'homeOption',
        message: 'What would you like to do? :)',
        choices: homePromptChoices
    }
];



// prompt user with list of choices and trigger appropiate function on switch statement
let home = () => {
    console.log('\n');
    inquirer.prompt(homePrompt).then(choice => {
        switch(choice.homeOption){
            case 'view all departments':
                viewDepartments();
                break;
            case 'view all roles':
                viewRoles();
                break;
            case 'view all employees':
                viewEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateEmployeeRole();
                break;
        }
    })
}

// query the database to console.table departments then return to home screen
let viewDepartments = async () => {
    const sql = 'select id, name as department from department group by name';

    await db.then(conn => conn.query(sql))
    .then(([rows, feilds]) => console.table('\n', rows))
    
    home();
}

// query the database to console.table roles then return to home screen
let viewRoles = async () => {
    let sql = 'select r.id, r.title, r.salary, d.name AS department FROM role r LEFT JOIN department d ON r.department_id = d.id';

    await db.then(conn => conn.query(sql))
    .then(([rows, feilds]) => console.table('\n', rows))
    
    home();

}

// query the database for employees and joining appropriate data to console.table the data
let viewEmployees = async () => {
    let sql = `select e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON d.id = r.department_id LEFT JOIN employee m ON m.id = e.manager_id`;

    await db.then(conn => conn.query(sql))
    .then(([rows, feilds]) => {console.table('\n', rows)})
    
    home();

}


// function to add department, takes user input and inserts it into the department table then returns to home screen
let addDepartment = async () => {
    await inquirer.prompt([
        {
            type: 'input',
            name: 'department',
            message: 'Enter the name of the department'
        }
    ])
    .then((response) => {
        let sql = `INSERT INTO department (name) VALUES ("${response.department}")`;
        db.then(conn => conn.query(sql))
        
        

    }).catch((err) => console.error(err))

    home();

}

// function to add role by creating an array of departments and passing it into the role prompt and using the user input and department choice to build a sql string to insert the data 
let addRole = async () => {
    departmentArray = await db.then(conn => conn.query('select id, name from department group by name'))
    .then(array => array[0].map(({name, id}) => ({name: name, value: id})))

    addRolePrompt(departmentArray);
}


let addRolePrompt = async (departmentArray) => {
    await inquirer.prompt([
        {
            type: 'input',
            name: 'roleName',
            message: 'What is the name of the role?'
        },
        {
            type: 'input',
            name: 'roleSalary',
            message: 'What is the salary of the role?'
        },
        {
            type: 'list',
            name: 'roleDepartment',
            message: 'Which department does this role belong to?',
            choices: departmentArray
        }
    ])
    .then((response) => {
        let sql = `INSERT INTO role (title, salary, department_id)
                   VALUES ("${response.roleName}", "${response.roleSalary}", "${response.roleDepartment}")`;


        db.then(conn => conn.query(sql));

    }).catch((err) => console.error(err));

    home();
}


// function to add an employee by first creating arrays of employees and roles, passing them into the add employee prompt and using the user input and choices on employee and role to build an sql string to insert the data into the employee table
let addEmployee = async () => {
    let managerArray = await db.then(conn => conn.query(`select id, CONCAT(first_name, ' ', last_name) AS manager from employee`))
    .then(array => array[0].map(({manager, id}) => ({name: manager, value: id})))

    let roleArray = await db.then(conn => conn.query(`SELECT r.id, r.title FROM role r`))
    .then(array => array[0].map(({title, id}) => ({name: title, value: id})));


    addEmployeePrompt(roleArray, managerArray);
    
}

let addEmployeePrompt = async (roleArray, managerArray) => {
    await inquirer.prompt([
        {
            type: 'input',
            name: 'employeeFirstName',
            message: "What is the employee's first name?"
        },
        {
            type: 'input',
            name: 'employeeLastName',
            message: "What is the employee's last name?"
        },
        {
            type: 'list',
            name: 'employeeRole',
            message: "What is the employee's role?",
            choices: roleArray
        },
        {
            type: 'list',
            name: 'employeeManager',
            message: "Who is the employee's manager?",
            choices: managerArray
        }
    ])
    .then((response) => {
        let sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
        VALUES ("${response.employeeFirstName}", "${response.employeeLastName}", "${response.employeeRole}", "${response.employeeManager}")`;


        db.then(conn => conn.query(sql))
        
    }).catch(err => console.error(err));

    home();
}


// function to update an employee's role by creating an array of employees and roles, passing them into the update employee prompt, building a sql query string using the user input and choices on drop down menu to update the selected employee with the selected role
let updateEmployeeRole = async () => {

    let employeeArray = await db.then(conn => conn.query(`SELECT id, CONCAT(first_name, ' ', last_name) AS employee from employee`)).then(array => array[0].map(({employee, id}) => ({name: employee, value: id})))

    let roleArray = await db.then(conn => conn.query(`SELECT id, title FROM role`)).then(array => array[0].map(({title, id}) => ({name: title, value: id})))


    updateEmployeeRolePrompt(roleArray, employeeArray);
}

let updateEmployeeRolePrompt = async (roleArray, employeeArray) => {
    await inquirer.prompt([
        {
            type: 'list',
            name: 'employeeChoice',
            message: `Which employee's role do you want to update?`,
            choices: employeeArray
        },
        {
            type: 'list',
            name: 'roleChoice',
            message: 'Which role do you want to assign to the selected employee?',
            choices: roleArray
        }
    ])
    .then((response) => {
        let sql = `UPDATE employee SET role_id = ${response.roleChoice} WHERE id = ${response.employeeChoice}`;

        db.then(conn => conn.query(sql));

    }).catch((err) => console.error(err));

    home();
    
}


// function to display the opening graphic and start the program
let start = () => {
    console.log(openingGraphic);
    home();
}

// starts program
start();
