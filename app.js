const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

// Create MySQL connection
const connection = mysql.createConnection({
host: 'mysql-epiconline.alwaysdata.net',
port:'',
user: '371146',
password: '90232770',
database: 'epiconline_epiconline'
});

connection.connect((err) => {
if (err) {
console.error('Error connecting to MySQL:', err);
return;
}
console.log('Connected to MySQL database');
});

//Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'public/images'); 
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname)
    }
});
const upload = multer({storage: storage});

// Set up view engine
app.set('view engine', 'ejs');

// enable static files
app.use(express.static('public'));

//enable form processing
app.use(express.urlencoded({
    extended: false
}))

app.get('/',(req,res) => {
    const sql = 'SELECT * FROM products';
    connection.query(sql, (error, results)=> {
        if (error){
            console.error('Database query error;', error.message);
            return res.status(500).send('Error Retrieving products');
        }
    res.render('home', {products: results});
    })
})

app.get('/product/:id',(req,res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM products WHERE productId = ?';
    //Fetch data from mysql based on the student id
    connection.query(sql, [productId], (error, results)=> {
        if (error){
            console.error('Database query error;', error.message);
            return res.status(500).send('Error Retrieving product by ID');
        }
        // Check if any student with the given Id was found
        if (results.length > 0){
            res.render('product', {product: results[0]});
        } else{
            res.status(404).send('Product not found');
        }
       
    })
})

//read search
app.get('/search', function(req, res) {
    res.render('search');
});

//search by category
app.get('/byCategory', function(req, res) {
    const category = req.query.category;
    const sql = 'SELECT * FROM products WHERE category = ?';
    connection.query(sql, [category], (error, results)=> {
        if (error){
            console.error('Database query error;', error.message);
            return res.status(500).send('Error Retrieving product by ID');
        }
        if (results.length > 0){
            res.render('home', {products: results});
        } else{
            res.status(404).send('Product not found');
        }
    })
});     

//read contact
app.get('/contact',(req,res) => {
    const sql = 'SELECT * FROM contacts';
    connection.query(sql, (error, results)=> {
        if (error){
            console.error('Database query error;', error.message);
            return res.status(500).send('Error Retrieving conatct');
        }
    res.render('contact', {contacts: results});
    })
})

//contact id
app.get('/contact/:id',(req,res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM contacts WHERE contactId = ?';
    //Fetch data from mysql based on the student id
    connection.query(sql, [contactId], (error, results)=> {
        if (error){
            console.error('Database query error;', error.message);
            return res.status(500).send('Error Retrieving conatct');
        }
        // Check if any student with the given Id was found
        if (results.length > 0){
            res.render('contact', {contact: results[0]});
        } else{
            res.status(404).send('Contact not found');
        }
       
    })
})

//Get con-info
app.get('/con-info', (req,res) =>{
    res.render('con-info');
});

//Get sucess-con
app.get('/suc-con', (req,res) =>{
    res.render('suc-con');
});

 
//Get add to cart
app.get('/addtocart/:id',(req,res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM products WHERE productId =?';
    connection.query(sql, [productId],(error, results)=> {
        if (error){
            console.error('Database query error;', error.message);
            return res.status(500).send('Error Retrieving product');
        }
        if (results.length > 0) {
            res.render('addtocart', { product: results[0] });
        } else {
            res.status(404).send('Product not found');
        }
    });
});

//Get cart
app.get('/cart',(req,res) => {
    const sql = 'SELECT * FROM cart';
    connection.query(sql, (error, results)=> {
        if (error){
            console.error('Database query error;', error.message);
            return res.status(500).send('Error Retrieving product');
        }

    //calcuate the total price
    let totalPrice = results.reduce((total, item) => total + (item.price * item.quantity), 0);
    res.render('cart', { cart: results, totalPrice: totalPrice });
    
    })
})

//posting data to database
app.post('/cart', upload.single('image'), (req, res) => {
    const { name, quantity, price } = req.body;
    let image = req.body.image
    if (req.file){
        image = req.file.filename
    }
    const sql = 'INSERT INTO cart (name, quantity, price, image) VALUES (?, ?, ?, ?)';
    connection.query(sql, [name, quantity, price, image], (error, results) => {
        if (error) {
            console.log('Error adding product:', error);
            res.status(500).send('Error adding product');
        } else {
            console.log('New product added:', results);
            res.redirect('/cart');
        }
    });
});

//Display cart details
app.get('/cart/:id',(req,res) => {
    const cartId = req.params.id;
    const sql = 'SELECT * FROM cart WHERE cartId = ?';
    connection.query(sql, [cartId], (error, results)=> {
        if (error){
            console.error('Database query error;', error.message);
            return res.status(500).send('Error Retrieving product by ID');
        }
        if (results.length > 0){
            res.render('cart', {cart: results[0]});
        } 
    })
})

//check items
app.get('/check',(req,res) => {
    const sql = 'SELECT * FROM cart';
    connection.query(sql, (error, results)=> {
        if (error){
            console.error('Database query error;', error.message);
            return res.status(500).send('Error Retrieving product');
        }

    //calcuate the total price
    let totalPrice = results.reduce((total, item) => total + (item.price * item.quantity), 0);
    let totalQuantity = results.reduce((total, item) => total + item.quantity, 0);

    res.render('check', { cart: results, totalPrice: totalPrice, totalQuantity: totalQuantity });
    
    })
})

//Display cart details
app.get('/check/:id',(req,res) => {
    const cartId = req.params.id;
    const sql = 'SELECT * FROM cart WHERE cartId = ?';
    connection.query(sql, [cartId], (error, results)=> {
        if (error){
            console.error('Database query error;', error.message);
            return res.status(500).send('Error Retrieving product by ID');
        }
        if (results.length > 0){
            res.render('check', {cart: results[0]});
        } 
    })
})

//Get Login page
app.get('/login', (req,res) =>{
    res.render('login');
});

//Get create page
app.get('/create', (req,res) =>{
    res.render('create');
});

//post new account
app.post('/createAccount', (req, res) => {
    const { username, num, address, email, password } = req.body;
    const sql = 'INSERT INTO user (username, num, address, email, password) VALUES (?, ?, ?, ?, ?)';
   
    connection.query(sql, [username, num, address, email, password], (error, results) => {
        if (error) {
            console.log('Error creating account:', error);
            res.status(500).send('Error creating account');
        } else {
            console.log('New account created:', results);
            res.redirect('/');
        }
    });
});

//Get view review page
app.get('/productReviews',(req,res) => {
    const sql = 'SELECT * FROM review';
    connection.query(sql, (error, results)=> {
        if (error){
            console.error('Database query error;', error.message);
            return res.status(500).send('Error Retrieving product');
        }
    res.render('productReviews', {review: results});
    })
})

//Add new product
app.get('/addnewproduct', (req,res) =>{
    res.render('addnewproduct');
});

app.post('/product', upload.single('image'), (req, res) => {
    const { name, quantity, price, description, category, sold} = req.body;
    let image;
    if (req.file){
        image = req.file.filename;
    } else{
        image = null;
    }
    const sql = 'INSERT INTO products (productName, quantity, price, image, description, category, sold) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(sql, [name, quantity, price, image, description, category, sold], (error, results) => {
        if (error) {
            console.log('Error adding product:', error);
            res.status(500).send('Error adding product');
        } else {
            console.log('New product added:', results);
            res.redirect('/');
        }
    });
});

//Edit product at cart
//Display current data in form
app.get('/editcart/:id', (req,res) => {
    const cartId = req.params.id;
    const sql = 'SELECT * From cart WHERE cartId = ?';
    connection.query(sql, [cartId], (error,results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retraving product by ID');
        }
        if (results.length > 0) {
            res.render('editcart', {cart: results[0]});
        } else {
            res.status(404).send('Product not found');
        }
    });
});

//posting data to database
app.post('/editcart/:id', upload.single('image'), (req,res) =>{
    const cartId = req.params.id;
    const{ name, quantity, price} = req.body;
    let image = req.body.image;
    if (req.file) {
        image = req.file.filename;
    }
    const sql = 'UPDATE cart SET name =?, quantity =?, price =?, image =? WHERE cartId = ? ';
    //Inserct the new product into the database
    connection.query(sql, [name, quantity, price, image, cartId], (error, results) =>{
        if (error){
            console.error("Error updating product:", error);
            res.status(500).send('Error updating product');
        } else{
            res.redirect('/cart');
        }
    });
});

//Delect product at cart
app.get('/delectProduct/:id', (req,res) => {
    const cartId = req.params.id;
    const sql = 'DELETE FROM cart WHERE cartId = ?';
    connection.query(sql, [cartId], (error,results) =>{
        if (error){
            console.error('Error delecting product:', error);
            res.status(500).send('Error delecting product');
        } else{
            res.redirect('/cart');
        }
    });
});

//Delect product at home page for seller
app.get('/delect/:id', (req,res) => {
    const productId = req.params.id;
    const sql = 'DELETE FROM products WHERE productId = ?';
    connection.query(sql, [productId], (error,results) =>{
        if (error){
            console.error('Error delecting product:', error);
            res.status(500).send('Error delecting product');
        } else{
            res.redirect('/');
        }
    });
});

//Edit product at home page
//Display current data in form
app.get('/editProduct/:id', (req,res) => {
    const productId = req.params.id;
    const sql = 'SELECT * From products WHERE productId = ?';
    connection.query(sql, [productId], (error,results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retraving product by ID');
        }
        if (results.length > 0) {
            res.render('editProduct', {product: results[0]});
        } else {
            res.status(404).send('Product not found');
        }
    });
});

//posting data to database
app.post('/editProduct/:id', upload.single('image'), (req,res) =>{
    const productId = req.params.id;
    const{ name, quantity, price, category, description, sold} = req.body;
    let image = req.body.image;
    if (req.file) {
        image = req.file.filename;
    }
    const sql = 'UPDATE products SET productName =?, quantity =?, price =?, category =?, description =?, sold=?, image =? WHERE productId = ? ';
    //Inserct the new product into the database
    connection.query(sql, [name, quantity, price, category, description, sold, image, productId], (error, results) =>{
        if (error){
            console.error("Error updating product:", error);
            res.status(500).send('Error updating product');
        } else{
            res.redirect('/');
        }
    });
});

//Get make review page
app.get('/review', (req,res) =>{
    res.render('review');
});

//Post review
app.post('/reviews', (req, res) => {
    const { orderId, productName, rate, review } = req.body;
    const sql = 'INSERT INTO review (orderId, productName, rate, reviews) VALUES (?, ?, ?, ?)';
   
    connection.query(sql, [orderId, productName, rate, review], (error, results) => {
        if (error) {
            console.log('Error making review:', error);
            res.status(500).send('Error making review');
        } else {
            console.log('Review Has Been Made', results);
            res.redirect('/productReviews');
        }
    });
});

//read search reviews
app.get('/search_Reviews', function(req, res) {
    res.render('searchreviews');
});

//search Reviews
app.get('/searchReviews', function(req, res) {
    const productName = req.query.searchReviews;
    const sql = 'SELECT * FROM review WHERE productName = ?';
    connection.query(sql, [productName], (error, results)=> {
        if (error){
            console.error('Database query error;', error.message);
            return res.status(500).send('Error Retrieving reviews');
        }
        if (results.length > 0){
            res.render('productReviews', {review: results});
        } else{
            res.status(404).send('Review not found');
        }
    })
});

//Delete reviews
app.get('/delectrev/:id', (req,res) => {
    const reviewId = req.params.id;
    const sql = 'DELETE FROM review WHERE reviewId = ?';
    connection.query(sql, [reviewId], (error,results) =>{
        if (error){
            console.error('Error delecting reviews:', error);
            res.status(500).send('Error delecting reviews');
        } else{
            res.redirect('/productReviews');
        }
    });
});

//get payment 
app.get('/payment', function(req, res) {
    res.render('payment');
});

app.get('/pay', function(req, res) {
    res.render('pay');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));