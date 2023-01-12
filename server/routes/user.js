var express = require('express');
const mysql = require('mysql');
var router = express.Router();
var connection = require('../../dbConnection');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var uuid = require('uuid');
var exphbs = require('express-handlebars'); 
const fileUpload = require('express-fileupload');
const { route } = require('express/lib/application');
var alert=require('alert');
//const http = require('http');
//const fs = require('fs');

router.use(session({   //login session
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
router.use(fileUpload());

router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json());


//Login
router.get('/', function(req, res){
    res.render('login');
});
//authorize login
router.post('/auth', function(req, res, next){
    var username = req.body.username;
    var password = req.body.password;
    if (username && password) {
		connection.query("SELECT * FROM login WHERE Username = ? and Password=?", [username, password], function (error, results, fields) {
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.username = username;
                req.session.loginID = results[0].LoginID;
                //console.log(req.session.loginID);
				res.redirect('/welcome');
			} else {
                alert('Please enter a valid username!');
                res.redirect('/');
				//res.send('Incorrect Username and/or Password!');
			}			
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
    
});

//Home page
router.get('/welcome', function(request, response) {
    response.render('welcome', { login: request.session.loggedin, username: request.session.username });
});
router.get('/login', function(req, res){
    res.render('login');
});
//Sign up
router.get('/signup', function(req, res){
    res.render('signup');
});
router.post('/signup',function(req, res, next){
    var username=req.body.username;
    var Password=req.body.Password;
    var cpassword=req.body.cpassword;    
    var StdName=req.body.StdName;
    var ContactNo=req.body.ContactNo;
    var Gender=req.body.Gender;
    var Email=req.body.Email;
    var DegreeProgram=req.body.DegreeProgram;
    connection.query("SELECT * FROM login WHERE Username = ?", [username], function (error, result) { 
        //check if username exists
        if (result.length <= 0) {
            console.log("result: "+result);
            if(Password===cpassword)
                connection.query("SElECT * FROM student WHERE email = ?", [Email], function(err, results){
                if(results.length>0){
                    alert('email already in use');
res.redirect('/signup');
                //res.send('email already in use');
                console.log(results);
                //res.end();

            }
                else{
                connection.query("INSERT INTO student(StdName, ContactNo, Gender, Email, DegreeProgram) VALUES(?, ?, ?, ?, ?)",[StdName, ContactNo, Gender, Email, DegreeProgram],function(error,results,fields){});
                //console.log(results);

                connection.query("INSERT INTO login(username, password) VALUES(?, ?)", [username, Password], function(error,result,fields){});
                //console.log(result); 
                //res.redirect('/welcome');
                req.session.loggedin = true;
                req.session.username = username;
                res.render('welcome', { login: req.session.loggedin, username: req.session.username });
            }
            })
            else
            //res.send('confirm password not matching the password');
            alert('confirm password not matching the password');
            res.redirect('/signup');
        }
        else
        alert('confirm password not matching the password');
        res.redirect('/signup');
        //res.send('username already in use');
        //res.end();
        ///alert msg should be shown that username is in use and option to reenter values should be given..pata nai kese
    });
    //res.end();
   // res.render('login');
});

router.get('/uploadres', function(req, res){  
    //var courses = `SELECT CourseName FROM COURSES`;
            connection.query("SELECT CourseName FROM course", function(err, result) {
                if (err) throw err;
                else
                console.log(JSON.parse(JSON.stringify(result)));
                res.render('addresource', {dropdownVals: JSON.parse(JSON.stringify(result))});  
            });
    
});
router.get('/resources', function(req, res, next) {
    var sql='SELECT * FROM resource';
    connection.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('res-list', { title: 'Resource List', resources: data});
  });
});
router.get('/resources/edit/:id', function(req, res, next) {
    var Id= req.params.id;
    var sql=`SELECT * FROM resource WHERE ResID=${Id}`;
    connection.query("SELECT CourseID, CourseName FROM course", function(error, result) {
        if (error) throw error;
        console.log(JSON.parse(JSON.stringify(result)));
        //res.render('resources', {dropdownVals: JSON.parse(JSON.stringify(result))}); 
        connection.query(sql, function (err, data) {
            if (err) throw err;
            res.render('update-res', { dropdownVals: JSON.parse(JSON.stringify(result)), resource: data[0]});
          }); 
    });



});
router.post('/resources/edit/:id', function(req, res, next) {
  var id= req.params.id;
  var updateData=req.body;
  var sql = `UPDATE resource SET ? WHERE ResID= ?`;
  connection.query(sql, [updateData, id], function (err, data) {
  if (err) throw err;
  console.log(data.affectedRows + " record(s) updated");
});
res.redirect('/resources');
});
router.get('/resources/delete/:id', function(req, res, next) {
    var id= req.params.id;
      var sql = 'DELETE FROM resource WHERE ResID = ?';
      connection.query(sql, [id], function (err, data) {
      if (err) throw err;
      console.log(data.affectedRows + " record(s) updated");
    });
    res.redirect('/resources');
    
});
router.get('/tuition', function(req, res){
    var sql='SELECT t.TutorID, t.TutorName, s.FreeSlot, c.CourseTaught FROM tutor t inner join slots s on t.TutorID=s.TutorID inner join coursetaught c on c.TutorID=s.TutorID';
    connection.query(sql, function (err, data, fields) {
    if (err) throw err;
    console.log(data);
    req.session.TutorID=data.TutorID;
    req.session.TutorName=data.TutorName;
    req.session.FreeSlot=data.FreeSlot;
    req.session.CourseTaught=data.CourseTaught;

    res.render('tuition', { title: 'Tutor List', tutor: data});
  });
});
router.post('/tuition', function(req, res){
    connection.query("Select CourseID from course where CourseName=?", [req.session.CourseTaught], function(error, result){
        req.session.CourseID=result.courseID;
    })
    console.log('heyyyyyyyyyyyyyyyyy'+req.session.CourseID);
    var sql='Insert into tuition(TutorID, BookedSlot, StdID, CourseID) VALUES(?, ?, ?, ?)';
    connection.query(sql, [req.session.TutorID, req.session.FreeSlot=FreeSlot, req.session.loginID, req.session.CourseID], function (err, data, fields) {});
});
router.get('/addtutor', function(req, res){
    connection.query("SELECT CourseName FROM course", function(err, result) {
        if (err) throw err;
        else
        //console.log(JSON.parse(JSON.stringify(result)));
        res.render('addtutor', {dropdownVals: JSON.parse(JSON.stringify(result))});  
    });
});
router.post('/addtutor', function(req, res){
    var tutorname=req.body.tutorname;
    var coursename=req.body.coursename;
    var slot1=req.body.slot1;
    //var slot2=req.body.slot2;
    var tid;
    var flag=0;
    connection.query("SELECT TutorID FROM tutor Where TutorName=?",[tutorname],function(error,results,fields){
        if(results.length>0){
            tid=results[0].TutorID;
        }
    });
    var sql='SELECT t.TutorID, t.TutorName, s.FreeSlot, c.CourseTaught FROM tutor t inner join slots s on t.TutorID=s.TutorID inner join coursetaught c on c.TutorID=s.TutorID';
    connection.query(sql,function(error,data,fields){
        for(let i=0; i<data.length; i++){
            if(data[i].TutorID==tid && (data[i].FreeSlots==slot1||data[i].FreeSlots==slot2) && data[i].CourseTaught==coursename){
                flag=1;
            }
        }
        if(flag==0){
            connection.query("INSERT INTO tutor(TutorName) VALUES(?)",[tutorname],function(error,results,fields){});
            connection.query("INSERT INTO coursetaught(TutorID, CourseTaught) VALUES(?, ?)",[tid,coursename],function(error,results,fields){});
            connection.query("INSERT INTO slots(TutorID, FreeSlot) VALUES(?, ?)",[tid, slot1],function(error,results,fields){});
            // if(slot2.length<0){
            //     connection.query("INSERT INTO slots(TutorID, FreeSlot) VALUES(?, ?)",[tid, slot2],function(error,results,fields){});
            // }
        }
    })
    res.redirect('tuition');
    


});
router.get('/aboutus', function(req, res){
    res.render('aboutus');
});
router.post("/uploadres", (req, res) => {
    var courseID;
         if (!req.files) {
             res.send("No file upload")
    	     } else {
                   var topic = req.body.resName
    	           var file = req.files.image // here 'image' in Home.ejs form input name
                   var course = req.body.course
                   
                console.log(course);
            
    	             //for image upload
    	     if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif") {
    	             var imageName = file.name
    	             console.log(imageName)
    	             var uuidname = uuid.v1(); // this is used for unique file name
                 var imgsrc = 'http://127.0.0.1:3000/images/' + uuidname + file.name
               
                     connection.query("SELECT CourseID from course where CourseName= ?",[course], function(error, result) {
                        if (error) throw error;
                        courseID=result[0].CourseID;
                        connection.query("INSERT INTO Resource(ResName,Resource,CourseID) VALUES(?,?,?)", [topic, imgsrc, courseID], (err, results) => {
                           if (err) throw err
                           file.mv('public/images/' + uuidname + file.name)
                           //res.send("Data successfully saved")
                           res.redirect('/resources');
                       })
                        
                    }); 
    	         }
    	         // for any file like pdf,docs etc. upload
    	         else {
    	             var fileName = file.name;
                 console.log(fileName);
    	             var uuidname = uuid.v1(); // this is used for unique file name
    	             var filesrc = 'http://127.0.0.1:3000/docs/' + uuidname + file.name

                     connection.query("SELECT CourseID from course where CourseName= ?",[course], function(error, result) {
                        if (error) throw error;
                        courseID=result[0].CourseID;
                        connection.query( "INSERT INTO Resource(ResName,Resource,CourseID) VALUES(?,?,?)", [topic, filesrc, courseID], (err, results) => {
                            if (err) throw err
                            file.mv('public/docs/' + uuidname + file.name)
                            //res.send("Data successfully saved")
                            res.redirect('/resources');
                        });
                        
                    }); 


    	         }
       }
});
router.get('/addques', function(req, res){
    connection.query("SELECT * FROM query", function (error, results, fields) {
        if (results.length > 0) {
                req.session.QueryText=results;
                res.render('addques', { ques: req.session.QueryText});
            }
    })
    // connection.query("SELECT * FROM reply", function(err, data, fields){
    //     if (data.length > 0) {
    //         req.session.QueryReply=data;
    //         res.render('addques', { rep: req.session.QueryReply});
    //        // res.end();  
    //     }
    // })       
        //res.render('addques', { ques: req.session.QueryText, rep: req.session.QueryReply});   
});
router.post('/addques',function(req, res){
    console.log('hell');
    var querytext=req.body.querytext;
    
    console.log(querytext);
    if (querytext) {
		connection.query("INSERT INTO query(QuestionerID, QueryText) VALUES(?, ?)",[req.session.loginID, querytext],function(error,results,fields){
            if (error) throw error;
        });
        res.redirect('/addques');
	} 
    else {
        //alert('Please enter a question!');////ye alert ques enter karne pe bhi araha hai idk why
        res.redirect('/addques');
	//	res.send('Please enter a question!');
		//res.end();
	}
    
    if(replytext){
        connection.query("INSERT INTO reply(ReplierID, QueryReply, QueryID) VALUES(?, ?, 3)",[req.session.loginID,replytext],function(error){
            if (error) throw error;
        });
        res.redirect('/addques');
    }

  //  res.send(true);
});
// router.post('/ans',function(req,res){
//     var replytext=req.body.replytext;
//     if(replytext){
//         connection.query("INSERT INTO reply(ReplierID, QueryReply, QueryID) VALUES(?, ?, 3)",[req.session.loginID,replytext],function(error){
//             if (error) throw error;
//         });
//         res.redirect('/addques');
//     }
// })

module.exports = router;