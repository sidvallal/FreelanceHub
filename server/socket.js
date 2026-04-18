const Message = require('./models/Message');

const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join a project chat room
        socket.on('joinProject', (projectId) => {
            socket.join(projectId);
            console.log(`Socket ${socket.id} joined project room: ${projectId}`);
        });

        // Leave a project chat room
        socket.on('leaveProject', (projectId) => {
            socket.leave(projectId);
            console.log(`Socket ${socket.id} left project room: ${projectId}`);
        });

        // Handle sending messages
        socket.on('sendMessage', async (data) => {
            try {
                const { projectId, senderId, receiverId, content } = data;

                // Save message to database
                const message = await Message.create({
                    project: projectId,
                    sender: senderId,
                    receiver: receiverId,
                    content
                });

                const populated = await message
                    .populate('sender', 'name email role');
                await populated.populate('receiver', 'name email role');

                // Emit to everyone in the project room
                io.to(projectId).emit('receiveMessage', populated);
            } catch (error) {
                console.error('Socket message error:', error);
                socket.emit('messageError', { message: 'Failed to send message' });
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};

module.exports = setupSocket;
