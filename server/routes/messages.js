const express = require('express');
const Message = require('../models/Message');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/messages/:projectId
// @desc    Get chat history for a project
router.get('/:projectId', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Only allow client or assigned freelancer to view messages
        const isClient = project.client.toString() === req.user._id.toString();
        const isFreelancer = project.assignedFreelancer &&
            project.assignedFreelancer.toString() === req.user._id.toString();

        if (!isClient && !isFreelancer) {
            return res.status(403).json({ message: 'Not authorized to view these messages' });
        }

        const messages = await Message.find({ project: req.params.projectId })
            .populate('sender', 'name email role')
            .populate('receiver', 'name email role')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/messages
// @desc    Send a message
router.post('/', protect, async (req, res) => {
    try {
        const { project: projectId, receiver, content } = req.body;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const isClient = project.client.toString() === req.user._id.toString();
        const isFreelancer = project.assignedFreelancer &&
            project.assignedFreelancer.toString() === req.user._id.toString();

        if (!isClient && !isFreelancer) {
            return res.status(403).json({ message: 'Not authorized to send messages in this project' });
        }

        // Chat only enabled for assigned projects
        if (project.status === 'Open') {
            return res.status(400).json({ message: 'Chat is not enabled for this project yet' });
        }

        const message = await Message.create({
            project: projectId,
            sender: req.user._id,
            receiver,
            content
        });

        const populated = await message
            .populate('sender', 'name email role');
        await populated.populate('receiver', 'name email role');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/messages/conversations/list
// @desc    Get all project conversations for the current user
router.get('/conversations/list', protect, async (req, res) => {
    try {
        // Find projects where user is either client or assigned freelancer
        const projects = await Project.find({
            $or: [
                { client: req.user._id },
                { assignedFreelancer: req.user._id }
            ],
            status: { $in: ['Assigned', 'In Progress', 'Completed'] }
        })
            .populate('client', 'name email')
            .populate('assignedFreelancer', 'name email')
            .sort({ updatedAt: -1 });

        // Get last message for each project
        const conversations = await Promise.all(
            projects.map(async (project) => {
                const lastMessage = await Message.findOne({ project: project._id })
                    .sort({ createdAt: -1 })
                    .populate('sender', 'name');

                return {
                    project: {
                        _id: project._id,
                        title: project.title,
                        status: project.status
                    },
                    otherUser: req.user._id.toString() === project.client._id.toString()
                        ? project.assignedFreelancer
                        : project.client,
                    lastMessage: lastMessage ? {
                        content: lastMessage.content,
                        sender: lastMessage.sender.name,
                        timestamp: lastMessage.createdAt
                    } : null
                };
            })
        );

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
