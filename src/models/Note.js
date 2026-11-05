const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ['Work', 'Personal', 'Ideas', 'Tasks', 'Study', 'General'],
        message: '{VALUE} is not a valid category',
      },
      default: 'General',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'Medium',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) => {
        if (!tags) return [];
        if (Array.isArray(tags)) {
          return tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
        }
        if (typeof tags === 'string') {
          return tags
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean);
        }
        return [];
      },
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    color: {
      type: String,
      default: '#4f46e5',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound text search index for fast title & content search
NoteSchema.index({ title: 'text', content: 'text' });

// Compound query index for sorting pinned notes first, then latest
NoteSchema.index({ isPinned: -1, updatedAt: -1 });

module.exports = mongoose.model('Note', NoteSchema);
