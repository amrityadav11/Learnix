// Socket.io event handlers
module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`[Socket] User connected: ${socket.id}`);

        // Notify all clients about new connection
        io.emit('userConnected', {
            userId: socket.id,
            timestamp: new Date(),
        });

        // Handle custom events
        socket.on('userStatus', (data) => {
            console.log(`[Socket] User status:`, data);
            io.emit('statusUpdate', data);
        });

        // Handle notifications
        socket.on('notification', (data) => {
            console.log(`[Socket] Notification:`, data);
            io.emit('newNotification', data);
        });

        // Handle chat messages
        socket.on('message', (data) => {
            console.log(`[Socket] Message:`, data);
            io.emit('messageReceived', data);
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${socket.id}`);
            io.emit('userDisconnected', {
                userId: socket.id,
                timestamp: new Date(),
            });
        });

        // Error handling
        socket.on('error', (error) => {
            console.error(`[Socket] Error:`, error);
        });
    });
};
