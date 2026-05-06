// Mongoose schema and model for projects
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Project description is required']
    },
    budget: {
        type: Number,
        required: [true, 'Budget is required']
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required'],
        validate: {
            validator: function (value) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return value > today;
            },
            message: 'Deadline cannot be in the past'
        }
    },
    skills: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['Open', 'Assigned', 'In Progress', 'Completed'],
        default: 'Open'
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedFreelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
