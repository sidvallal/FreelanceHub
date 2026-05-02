const express = require('express');
const Project = require('../models/Project');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { skills, status, search } = req.query;
        let query = {};

        if (status) query.status = status;
        if (skills) query.skills = { $in: skills.split(',') };
        if (search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.$or = [
                { title: { $regex: escapedSearch, $options: 'i' } },
                { description: { $regex: escapedSearch, $options: 'i' } }
            ];
        }

        const projects = await Project.find(query)
            .populate('client', 'name email')
            .populate('assignedFreelancer', 'name email')
            .sort({ createdAt: -1 });

        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/projects/:id
// @desc    Get single project
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('client', 'name email phone')
            .populate('assignedFreelancer', 'name email phone skills bio');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/projects
// @desc    Create a project (client only)
router.post('/', protect, requireRole('client'), async (req, res) => {
    try {
        const { title, description, budget, deadline, skills } = req.body;

        const project = await Project.create({
            title,
            description,
            budget,
            deadline,
            skills,
            client: req.user._id
        });

        const populated = await project.populate('client', 'name email');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/projects/:id
// @desc    Update a project (owner only)
router.put('/:id', protect, requireRole('client'), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this project' });
        }

        const { title, description, budget, deadline, skills } = req.body;
        if (title) project.title = title;
        if (description) project.description = description;
        if (budget) project.budget = budget;
        if (deadline) project.deadline = deadline;
        if (skills) project.skills = skills;

        const updated = await project.save();
        await updated.populate('client', 'name email');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project (owner only)
router.delete('/:id', protect, requireRole('client'), async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this project' });
        }

        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/projects/:id/status
// @desc    Update project status (lifecycle management)
router.put('/:id/status', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const isClient = project.client.toString() === req.user._id.toString();
        const isFreelancer = project.assignedFreelancer && 
            project.assignedFreelancer.toString() === req.user._id.toString();

        if (!isClient && !isFreelancer) {
            return res.status(403).json({ message: 'Not authorized to update this project status' });
        }

        const { status } = req.body;
        const validTransitions = {
            'Open': ['Assigned'],
            'Assigned': ['In Progress'],
            'In Progress': ['Completed'],
            'Completed': []
        };

        if (!validTransitions[project.status].includes(status)) {
            return res.status(400).json({
                message: `Cannot transition from '${project.status}' to '${status}'`
            });
        }

        project.status = status;
        const updated = await project.save();
        await updated.populate('client', 'name email');
        await updated.populate('assignedFreelancer', 'name email');

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
