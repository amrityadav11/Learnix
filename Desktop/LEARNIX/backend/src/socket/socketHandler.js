// Socket.io event handlers
module.exports = (io) => {
    console.log('[Socket.io] Initializing WebSocket handlers');

    io.on('connection', (socket) => {
        console.log(`[Socket] User connected: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${socket.id}`);
        });

        socket.on('error', (error) => {
            console.error(`[Socket] Error:`, error);
        });
    });
};
