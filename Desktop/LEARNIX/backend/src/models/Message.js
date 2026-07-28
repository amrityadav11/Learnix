const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        type: { type: String, enum: ['text', 'image', 'file', 'code'], default: 'text' },
        fileUrl: { type: String },
        isRead: { type: Boolean, default: false },
        readAt: { type: Date },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
    {
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
        lastMessageAt: { type: Date },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

conversationSchema.index({ participants: 1 });
messageSchema.index({ conversation: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { Message, Conversation };
