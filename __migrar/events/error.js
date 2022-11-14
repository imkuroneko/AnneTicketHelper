module.exports = {
    name: 'error',
    async execute(error) {
        console.error('mainErrorTracker', error);
    }
}