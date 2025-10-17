const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


const isValid = (user)=>{ //returns boolean
    let filtered_users = users.filter((user)=> user.username === user);
    if(filtered_users){
        return true;
    }
    return false;
}

const authenticatedUser = (username,password)=>{
    let filtered_users = users.filter((user)=> (user.username===username)&&(user.password===password));
    return filtered_users.length > 0;
}

// Session middleware for authenticated routes
regd_users.use(session({
  secret: "fingerprint_customer",
  resave: false,
  saveUninitialized: true
}));

regd_users.post("/login", (req,res) => {
    let user = req.body.username;
    let pass = req.body.password;
    
    if(authenticatedUser(user,pass)){
        let accessToken = jwt.sign({
            data: user
        },'access',{expiresIn:60*60})
        
        req.session.authorization = {
            accessToken, user
        }
        return res.json({message:"User logged in successfully", token: accessToken})
    } else {
        return res.status(403).json({message:"Invalid credentials"})
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let user = req.session.authorization.user;
  let ISBN = req.params.isbn;
  let review = req.query.review;
  
  if (!books[ISBN].reviews) {
    books[ISBN].reviews = {};
  }
  
  books[ISBN].reviews[user] = review;
  return res.json({message:"Review added successfully"})
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  let user = req.session.authorization.user;
  let isbn = req.params.isbn;

  if (books[isbn].reviews && books[isbn].reviews[user]) {
    delete books[isbn].reviews[user];
    return res.json({message: "Review deleted successfully"});
  } else {
    return res.status(404).json({message: "Review not found"});
  }
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;