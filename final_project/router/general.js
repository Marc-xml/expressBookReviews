const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      message: "Both username and password are required" 
    });
  }
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(409).json({ 
      message: "Username already exists. Please choose a different username." 
    });
  }


  users.push({ username, password });
  return res.status(201).json({ 
    message: "User registered successfully" 
  });
});
// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const bookList = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(books);
      }, 100);
    });
    return res.status(200).json(bookList);
  } catch (error) {
    return res.status(500).json({message: "Error fetching books"});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject("Book not found");
      }
    }, 100);
  })
  .then(book => {
    return res.status(200).json(book);
  })
  .catch(error => {
    return res.status(404).json({message: error});
  });
});
  
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const matchingBooks = [];
      
      for (let isbn in books) {
        if (books[isbn].author.toLowerCase().includes(author)) {
          matchingBooks.push({
            isbn: isbn,
            ...books[isbn]
          });
        }
      }
      
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("No books found by this author");
      }
    }, 100);
  })
  .then(books => {
    return res.status(200).json({booksbyauthor: books});
  })
  .catch(error => {
    return res.status(404).json({message: error});
  });
});
// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  //Write your code here
  const titleName = req.params.title.toLowerCase();
  const matchingBooks = [];
  
  // Obtain all the keys for the 'books' object
  const isbns = Object.keys(books);
  
  // Iterate through the 'books' array & check the title matches
  for (let i = 0; i < isbns.length; i++) {
    const isbn = isbns[i];
    const book = books[isbn];
    
    if (book.title.toLowerCase().includes(titleName)) {
      matchingBooks.push({
        isbn: isbn,
        title: book.title,
        author: book.author,
        reviews: book.reviews
      });
    }
  }
  
  if (matchingBooks.length > 0) {
    return res.status(200).json( matchingBooks);
  } else {
    return res.status(404).json({message: "No books found with this title"});
  }
});
//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  
  // Check if book exists
  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }
  
  // Check if book has reviews
  if (book.reviews && Object.keys(book.reviews).length > 0) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(200).json({message: "No reviews available for this book"});
  }
});

module.exports.general = public_users;
