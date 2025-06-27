const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const app = express();
const Router = require('./Router/routes')
const cookieParser = require('cookie-parser');
const rateLimitMiddleware = require('./Middleware/rateLimitMiddleware');
const appRoute = require('./App-Backend/Routes/appRoute');
const seedLevels = require('./SeedScript/seedLevels');


dotenv.config();

// Middleware

app.use(express.json());  
app.use(cookieParser());

// app.use(cors({
//     origin: ['http://localhost:5173', 'http://localhost:8081'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true,
//   }));


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));


// app.use(rateLimitMiddleware);

app.use('/', Router);
app.use('/app', appRoute);

connectDB();

// connectDB().then(() => {
//   seedLevels(); 
// });

const PORT = process.env.PORT || 6000;

// app.listen(PORT, ()=>{
//     console.log(`Server is Running on Port ${PORT}`)
// })



app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is Running on Port ${PORT}`)
});

