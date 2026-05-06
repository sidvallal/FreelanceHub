// Express routes for submitting and managing project proposals
const express = require('express');
const Proposal = require('../models/Proposal');
const Project = require('../models/Project');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/proposals
// @desc    Submit a proposal (freelancer only)
router.post('/', protect, requireRole('freelancer'), async (req, res) => {
    try {
        const { project, coverLetter, bidAmount } = req.body;

        // Check if project exists and is open
        const projectDoc = await Project.findById(project);
        if (!projectDoc) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (projectDoc.status !== 'Open') {
            return res.status(400).json({ message: 'Project is not accepting proposals' });
        }

        // Check for duplicate proposal
        const existingProposal = await Proposal.findOne({
            project,
            freelancer: req.user._id
        });
        if (existingProposal) {
            return res.status(400).json({ message: 'You have already submitted a proposal for this project' });
        }

        const proposal = await Proposal.create({
            project,
            freelancer: req.user._id,
            coverLetter,
            bidAmount
        });

        const populated = await proposal.populate('freelancer', 'name email skills bio experience');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/proposals/project/:projectId
// @desc    Get all proposals for a project
router.get('/project/:projectId', protect, async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view proposals for this project' });
        }

        const proposals = await Proposal.find({ project: req.params.projectId })
            .populate('freelancer', 'name email skills bio experience')
            .sort({ createdAt: -1 });

        res.json(proposals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/proposals/my
// @desc    Get freelancer's own proposals
router.get('/my', protect, requireRole('freelancer'), async (req, res) => {
    try {
        const proposals = await Proposal.find({ freelancer: req.user._id })
            .populate({
                path: 'project',
                populate: { path: 'client', select: 'name email' }
            })
            .sort({ createdAt: -1 });

        res.json(proposals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/proposals/:id/accept
// @desc    Accept a proposal (client only)
router.put('/:id/accept', protect, requireRole('client'), async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id).populate('project');

        if (!proposal) {
            return res.status(404).json({ message: 'Proposal not found' });
        }

        // Verify ownership
        if (proposal.project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Accept this proposal
        proposal.status = 'accepted';
        await proposal.save();

        // Update project: assign freelancer and change status
        const project = await Project.findById(proposal.project._id);
        project.assignedFreelancer = proposal.freelancer;
        project.status = 'Assigned';
        await project.save();

        // Reject all other proposals for this project
        await Proposal.updateMany(
            { project: proposal.project._id, _id: { $ne: proposal._id } },
            { status: 'rejected' }
        );

        const populatedProposal = await Proposal.findById(req.params.id)
            .populate('freelancer', 'name email skills')
            .populate('project');

        res.json(populatedProposal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/proposals/:id/reject
// @desc    Reject a proposal (client only)
router.put('/:id/reject', protect, requireRole('client'), async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id).populate('project');

        if (!proposal) {
            return res.status(404).json({ message: 'Proposal not found' });
        }

        if (proposal.project.client.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        proposal.status = 'rejected';
        await proposal.save();

        res.json(proposal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
