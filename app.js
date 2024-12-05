const express = require('express');
const path = require('path');
const app = express();
const todoRoutes = require('./routes/tododb.js');
require('dotenv').config();
const port = process.env.PORT;
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const { isAuthenticated } = require('./middlewares/middleware.js');
const expressLayout = require('express-ejs-layouts')
app.use(expressLayout);
const db = require('./database/db.js')

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use('/todos', todoRoutes);

app.use(express.urlencoded({ extended: true }));

// Konfigurasi express-session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set ke true jika menggunakan HTTPS
}));

app.use('/',authRoutes);
app.set('view engine', 'ejs');


app.get('/', isAuthenticated,(req, res) => {
    res.render('index',{
        layout: 'layouts/main-layout'
    });
});

app.get('/contact',isAuthenticated, (req, res) => {
    res.render('contact',{
        layout: 'layouts/main-layout'
    });
});

app.get('/todo-view', isAuthenticated,(req, res) => {
    db.query('SELECT * FROM todos', (err, todos) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.render('todo', {
            layout: 'layouts/main-layout',
            todos: todos
        });
    });
});

app.use((req, res) => {
    res.status(404).send('404 - Page Not Found');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});