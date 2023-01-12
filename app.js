var mysql = require('mysql');
var express = require('express');
var exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

require('dotenv').config();
const encoder = express.urlencoded();

var app = express();
const port = process.env.Port || 5600;

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(express.static('public'));
app.use(express.static('public/img'));
app.use(express.static('public/css'));
app.engine('hbs', exphbs.engine( {extname: '.hbs'}));
app.set('view engine', 'hbs');

const routes = require('./server/routes/user');
app.use('/', routes);
app.listen(port, () => {console.log('listening on port '+ port)});



//in dono mai queries mai where condition hard code hai uske liye bs variables create karke user input lena hoga like what to delete or update
/*
//Deleting record from department table
connection.connect(function(err) {
    connection.query("Delete from department where Dept_ID = 6", function(error, rows, field){
        if(!!error){
            console.log('Error in Deletion');
        } else {
            console.log('Deleted Successfully');           
        }
    });
})
*/

/*
//Updating record from department table
connection.connect(function(err) {
    connection.query("update employee set Email_ID = 'N@gmail.com' where EMP_ID=2", function(error, rows, field){
        if(!!error){
            console.log('Error in updation');
        } else {
            console.log('Updated Successfully');           
        }
    });
})
*/