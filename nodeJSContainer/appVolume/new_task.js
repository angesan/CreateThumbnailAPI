// send.js
const amqp = require('amqplib');


exports.postMessage = function(image_id){
    amqp.connect('amqp://guest:guest@rabbitmq-server:5672').then(conn => {
        return  conn.createChannel().then(ch => {
            // キューの名前
            const q = 'task_queue';
            const msg = image_id;
    
            // RabbitMQが落ちてもメッセージを喪失しないようにdurableとpresistentを指定
            ch.assertQueue(q, { durable: true });
            ch.sendToQueue(q,  Buffer.from(msg), { presistent: true });
    
            console.log(` [x] Sent "${msg}"`);
    
            // コネクション切断
            setTimeout(() => {
                conn.close();
            }, 500);
        });
    }).catch(console.warn);
}
