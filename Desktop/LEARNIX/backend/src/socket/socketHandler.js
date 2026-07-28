const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Message, Conversation } = require('../models/Message');
const Notification = require('../models/Notification');

const onlineUsers = new Map(); // userId -> socketId

const socketHandler = (io) => {
    // Auth middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('token=')[1];
            if (!token) return next(new Error('Authentication required'));
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('name avatar role');
            if (!user) return next(new Error('User not found'));
            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();
        onlineUsers.set(userId, socket.id);
        console.log(`🔌 User connected: ${socket.user.name} (${socket.id})`);

        // Notify others of online status
        socket.broadcast.emit('user:online', { userId, name: socket.user.name });

        // Join personal room
        socket.join(`user:${userId}`);

        // Join conversation
        socket.on('conversation:join', async ({ conversationId }) => {
            socket.join(`conversation:${conversationId}`);
        });

        // Send message
        socket.on('message:send', async ({ conversationId, content, type = 'text' }) => {
            try {
                // Verify participant
                const conversation = await Conversation.findById(conversationId);
                if (!conversation || !conversation.participants.includes(socket.user._id)) return;

                const message = await Message.create({
                    conversation: conversationId,
                    sender: socket.user._id,
                    content,
                    type,
                });

                await Conversation.findByIdAndUpdate(conversationId, {
                    lastMessage: message._id,
                    lastMessageAt: new Date(),
                });

                await message.populate('sender', 'name avatar');

                // Emit to room
                io.to(`conversation:${conversationId}`).emit('message:received', message);

                // Notify offline participants
                conversation.participants.forEach(async (participantId) => {
                    const pid = participantId.toString();
                    if (pid !== userId && !onlineUsers.has(pid)) {
                        await Notification.create({
                            recipient: participantId,
                            sender: socket.user._id,
                            type: 'new_message',
                            title: `New message from ${socket.user.name}`,
                            message: content.substring(0, 100),
                            link: `/messages/${conversationId}`,
                        });
                    }
                });
            } catch (err) {
                socket.emit('error', { message: err.message });
            }
        });

        // Typing indicators
        socket.on('typing:start', ({ conversationId }) => {
            socket.to(`conversation:${conversationId}`).emit('typing:started', {
                userId,
                name: socket.user.name,
                conversationId,
            });
        });

        socket.on('typing:stop', ({ conversationId }) => {
            socket.to(`conversation:${conversationId}`).emit('typing:stopped', { userId, conversationId });
        });

        // Mark messages as read
        socket.on('message:read', async ({ conversationId }) => {
            try {
                await Message.updateMany(
                    { conversation: conversationId, sender: { $ne: socket.user._id }, isRead: false },
                    { isRead: true, readAt: new Date(), $addToSet: { readBy: socket.user._id } }
                );
                socket.to(`conversation:${conversationId}`).emit('message:read_ack', { conversationId, readBy: userId });
            } catch (err) {
                console.error(err);
            }
        });

        // Disconnect
        socket.on('disconnect', () => {
            onlineUsers.delete(userId);
            socket.broadcast.emit('user:offline', { userId });
            console.log(`🔌 User disconnected: ${socket.user.name}`);
        });
    });

    return { onlineUsers };
};

module.exports = socketHandler;
