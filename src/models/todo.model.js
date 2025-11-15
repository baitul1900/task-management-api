// models/todo.model.js
import mongoose, { Schema } from "mongoose";
import softDeletePlugin from "../plugins/softDelete.js";

const todoSchema = new Schema(
    {
        // Basic fields
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxLength: 200
        },
        
        description: {
            type: String,
            trim: true,
            maxLength: 1000,
            default: null
        },
        
        dueDate: {
            type: Date,
            default: null
        },
        
        completed: {
            type: Boolean,
            default: false
        },
        
        completedAt: {
            type: Date,
            default: null
        },
        
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },
        
        // Who owns this todo
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        }
    },
    {
        timestamps: true, // Adds createdAt and updatedAt automatically
        versionKey: false
    }
);

// Apply soft delete plugin (gives us deletedAt, deletedBy, deleteReason)
todoSchema.plugin(softDeletePlugin, { userModel: 'User' });


todoSchema.pre("save", function(next) {
    if (this.isModified("completed")) {
        this.completedAt = this.completed ? new Date() : null;
    } else {
        this.completedAt = null;
    }
    next();
});

// methods here
todoSchema.methods.toggleComplete  = function() {
    this.completed = !this.completed;
    return this.save();
};

todoSchema.methods.isOverdue = function() {
     if (!this.dueDate || this.completed) return false;
    return new Date() > this.dueDate;
}


// static methods here
/**
 * Get all overdue todos for a user
 * Usage: await Todo.findOverdue(userId)
 */
todoSchema.statics.findOverdue = function (userId) {
    return this.find({
        owner: userId,
        completed: false,
        dueDate: { $lt: new Date() } // Due date is in the past
    }).sort({ dueDate: 1 }); // Oldest first
};

/**
 * Get upcoming todos (due in next N days)
 * Usage: await Todo.findUpcoming(userId, 7)
 */
todoSchema.statics.findUpcoming = function (userId, days = 7) {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);
    
    return this.find({
        owner: userId,
        completed: false,
        dueDate: { $gte: now, $lte: future }
    }).sort({ dueDate: 1 });
};

/**
 * Get simple stats for a user
 * Usage: await Todo.getUserStats(userId)
 */
todoSchema.statics.getUserStats = async function (userId) {
    const total = await this.countDocuments({ owner: userId });
    const completed = await this.countDocuments({ owner: userId, completed: true });
    const pending = total - completed;
    
    return { total, completed, pending };
};


// Speed up common queries
todoSchema.index({ owner: 1, completed: 1 }); // Filter by user and status
todoSchema.index({ owner: 1, dueDate: 1 });   // Sort by due date


// Export model
export const Todo = mongoose.model("Todo", todoSchema);