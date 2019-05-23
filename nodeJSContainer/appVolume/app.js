const express = require('express');
const app = express();
const winston = require('winston');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');



const imageRoutes = require('./api/routes/images');


mongoose.connect(
    'mongodb://'+ process.env.MONGO_USER + ':'+process.env.MONGO_PW +'@mongoserver:27017/imagestate',
    {
        useNewUrlParser:true
    }
)

const logger = winston.createLogger({
    transports: [
        new (winston.transports.File)({ filename: 'error.log' })
    ]
});

app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// For preventing cors errors.
app.use((req,res,next) => {
   res.header('Access-Control-Allow-Origin','*');
   res.header('Access-Control-Allow-Headers',
   'Origin, X-Requested-With, Content-Type,Accept,Authorization'
   );
   if(req.method === 'OPTIONS'){
       res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET');
       return res.status(200).json({});
   }
   next();
});

app.use('/image',imageRoutes);

app.use((req,res,next)=>{
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})
app.use((error,req,res,next) => {
    res.status(error.status || 500);
    res.json({
        error:{
            message:error.message
    }
    });
});

module.exports = app;