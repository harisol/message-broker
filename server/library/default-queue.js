const taskQueue = require('./taskQueue');

const defaultQueues = [
    {id: 0, name: 'send email'},
    {id: 1, name: 'send notif'},
];

const createDefaultQueue = () => {
    defaultQueues.forEach(q => {
        qManager.push({ 
            id: q.id,
            name: q.name,
            consumers: [],
            taskQueue: taskQueue()
        });
    });
}

module.exports = {
    defaultQueues,
    createDefaultQueue
};
