// worker.js 
const amqp = require('amqplib/callback_api');
const mongoose = require('mongoose');
const jimp = require("jimp");
const uploadPath = './uploads/'

const Image = require('./models/image');

const status = {
    WORKING: 'working',
    COMPLETED: 'completed',
    ERROR: 'error'
}

mongoose.connect(
    'mongodb://'+ process.env.MONGO_USER + ':'+process.env.MONGO_PW +'@mongoserver:27017/imagestate',
    {
        useNewUrlParser:true
    }
)

const createThumbnail = (fileName) => 
{
    return new Promise((resolve,reject) => {
        const newFileName = 'resized_'+fileName;
        jimp.read(uploadPath + fileName)
        .then(function (lenna) {
            lenna.scaleToFit(100, 100)            // resize
                    .write(uploadPath + newFileName); // save
            resolve(newFileName);
            
        }).catch(function (err) {
            console.error(err);
        });
    })
}

// connect to rabbitmq
amqp.connect('amqp://guest:guest@rabbitmq-server:5672', (err, conn) => {
    conn.createChannel((err, ch) => {
        // name of queue
        const q = 'task_queue';

        ch.assertQueue(q, {durable: true});
        ch.prefetch(1);
        
        console.log(` [*] Waiting for message in ${q}. To exit press CTRL+C`);

        // receive message
        ch.consume(q, msg => {
            const id = msg.content.toString()

            Image.findById(id)
            .select('filename originalImage states thumbnailFileName')
            .exec()
            .then(doc => {
                if(doc){
                    console.log(doc);
                    createThumbnail(doc.filename)
                    .then(name =>{
                        console.log('newfileName'+name);
                        Image.updateOne({_id:id},{ $set:{thumbnailFileName: name.toString(),states: status.COMPLETED}})
                        .exec()
                    })
                }else{
                    console.error(doc);
                }
            })
            .catch(err =>{
                console.error(err);
            });
            console.log(` [x] Received ${msg.content.toString()}`);
            setTimeout(() => {
                console.log(' [x] Done');
                // notify rabbitmq that job is done
                ch.ack(msg);
            });
        }, { noAck: false });
    });
});

