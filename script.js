//your JS code here. If required.
class MyPromise {
    constructor(executor) {
        this.state = 'pending'; // Initial state
        this.value = null; // Value starts as null
        this.handlers = []; // Handlers for then and catch
        
        const resolve = (value) => {
            if (this.state !== 'pending') return; // Ensure state is only set once
            this.state = 'fulfilled';
            this.value = value;
            this.processHandlers();
        };
        
        const reject = (reason) => {
            if (this.state !== 'pending') return; // Ensure state is only set once
            this.state = 'rejected';
            this.value = reason;
            this.processHandlers();
        };
        
        try {
            executor(resolve, reject);
        } catch (err) {
            reject(err); // If there's an error, reject the promise
        }
    }

    // Process all handlers
    processHandlers() {
        if (this.state === 'pending') return;
        
        this.handlers.forEach(handler => {
            if (this.state === 'fulfilled') {
                if (handler.onFulfilled) {
                    try {
                        handler.resolve(handler.onFulfilled(this.value));
                    } catch (err) {
                        handler.reject(err);
                    }
                } else {
                    handler.resolve(this.value);
                }
            } else if (this.state === 'rejected') {
                if (handler.onRejected) {
                    try {
                        handler.resolve(handler.onRejected(this.value));
                    } catch (err) {
                        handler.reject(err);
                    }
                } else {
                    handler.reject(this.value);
                }
            }
        });
        this.handlers = []; // Clear handlers after processing
    }

    // Then method
    then(onFulfilled, onRejected) {
        return new MyPromise((resolve, reject) => {
            this.handlers.push({
                onFulfilled,
                onRejected,
                resolve,
                reject
            });
            this.processHandlers(); // Process in case promise is already resolved/rejected
        });
    }

    // Catch method
    catch(onRejected) {
        return this.then(null, onRejected);
    }
}

// Sample Usage #1
const promise1 = new MyPromise((res, rej) => {
    res(10);
});

promise1.then(val => {
    console.log(val); // 10
    return val + 10;
}).then(val => {
    console.log(val); // 20
    throw val + 10;
}).then(val => {
    console.log(val);
}, val => {
    console.log('error:', val); // error: 30
    return val + 20;
}).then(val => {
    console.log(val); // 50
    throw val + 10;
}).catch(val => {
    console.log('error:', val); // error: 60
    return val + 10;
}).then(val => {
    console.log(val); // 70
});

console.log('end'); // 'end' is logged first, before the promise chain resolves

// Sample Usage #2
const promise2 = new MyPromise((res, rej) => {
    res(10);
});

promise2.then(val => {
    console.log(val + 10); // 20
    return val + 10;
});

promise2.then(val => {
    console.log(val + 5); // 15
    return val + 5;
});

console.log('end'); // 'end' is logged first, before the promise chain resolves
