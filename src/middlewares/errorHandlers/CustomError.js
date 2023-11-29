class MyCustomError extends Error {
    constructor(errorCode, message) {
        super(message);
        this.name = 'MyCustomError';
        this.errorCode = errorCode;
    }
}

module.exports = {
    MyCustomError,
};
