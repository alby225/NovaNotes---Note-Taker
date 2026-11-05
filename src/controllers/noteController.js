const Note = require('../models/Note');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all notes with filtering, search, sorting & pagination
// @route   GET /api/notes
// @access  Public
exports.getNotes = asyncHandler(async (req, res) => {
  const { search, category, priority, isPinned, tag, sortBy, page = 1, limit = 50 } = req.query;

  // Build query filter
  const filter = {};

  // Search in title, content, or tags
  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { title: searchRegex },
      { content: searchRegex },
      { tags: searchRegex },
    ];
  }

  // Filter by category
  if (category && category !== 'All') {
    filter.category = category;
  }

  // Filter by priority
  if (priority && priority !== 'All') {
    filter.priority = priority;
  }

  // Filter by pinned status
  if (isPinned !== undefined && isPinned !== 'all') {
    filter.isPinned = isPinned === 'true';
  }

  // Filter by specific tag
  if (tag) {
    filter.tags = tag.toLowerCase().trim();
  }

  // Determine sort order
  let sortOption = { isPinned: -1, updatedAt: -1 };
  if (sortBy === 'newest') sortOption = { createdAt: -1 };
  else if (sortBy === 'oldest') sortOption = { createdAt: 1 };
  else if (sortBy === 'title_asc') sortOption = { title: 1 };
  else if (sortBy === 'title_desc') sortOption = { title: -1 };
  else if (sortBy === 'updated') sortOption = { updatedAt: -1 };

  // Pagination calculation
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const totalNotes = await Note.countDocuments(filter);
  const notes = await Note.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    count: notes.length,
    pagination: {
      total: totalNotes,
      page: pageNum,
      pages: Math.ceil(totalNotes / limitNum) || 1,
      limit: limitNum,
      hasNext: pageNum * limitNum < totalNotes,
      hasPrev: pageNum > 1,
    },
    data: notes,
  });
});

// @desc    Get single note by ID
// @route   GET /api/notes/:id
// @access  Public
exports.getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return res.status(404).json({
      success: false,
      error: `Note with id ${req.params.id} not found`,
    });
  }

  res.status(200).json({
    success: true,
    data: note,
  });
});

// @desc    Create a new note
// @route   POST /api/notes
// @access  Public
exports.createNote = asyncHandler(async (req, res) => {
  const { title, content, category, priority, tags, isPinned, color } = req.body;

  const note = await Note.create({
    title,
    content,
    category: category || 'General',
    priority: priority || 'Medium',
    tags: tags || [],
    isPinned: Boolean(isPinned),
    color: color || '#4f46e5',
  });

  res.status(201).json({
    success: true,
    message: 'Note created successfully',
    data: note,
  });
});

// @desc    Update an existing note
// @route   PUT /api/notes/:id
// @access  Public
exports.updateNote = asyncHandler(async (req, res) => {
  let note = await Note.findById(req.params.id);

  if (!note) {
    return res.status(404).json({
      success: false,
      error: `Note with id ${req.params.id} not found`,
    });
  }

  const { title, content, category, priority, tags, isPinned, color } = req.body;

  const updateFields = {};
  if (title !== undefined) updateFields.title = title;
  if (content !== undefined) updateFields.content = content;
  if (category !== undefined) updateFields.category = category;
  if (priority !== undefined) updateFields.priority = priority;
  if (tags !== undefined) updateFields.tags = tags;
  if (isPinned !== undefined) updateFields.isPinned = Boolean(isPinned);
  if (color !== undefined) updateFields.color = color;

  note = await Note.findByIdAndUpdate(req.params.id, updateFields, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Note updated successfully',
    data: note,
  });
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Public
exports.deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return res.status(404).json({
      success: false,
      error: `Note with id ${req.params.id} not found`,
    });
  }

  await note.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Note deleted successfully',
    data: { id: req.params.id },
  });
});

// @desc    Toggle note pinned status
// @route   PATCH /api/notes/:id/pin
// @access  Public
exports.togglePin = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return res.status(404).json({
      success: false,
      error: `Note with id ${req.params.id} not found`,
    });
  }

  note.isPinned = !note.isPinned;
  await note.save();

  res.status(200).json({
    success: true,
    message: `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`,
    data: note,
  });
});

// @desc    Get dashboard metrics & summary statistics
// @route   GET /api/notes/stats/overview
// @access  Public
exports.getStats = asyncHandler(async (req, res) => {
  const totalNotes = await Note.countDocuments();
  const pinnedNotes = await Note.countDocuments({ isPinned: true });

  // Group by category
  const categoryStats = await Note.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Group by priority
  const priorityStats = await Note.aggregate([
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalNotes,
      pinnedNotes,
      categories: categoryStats.map((c) => ({ category: c._id, count: c.count })),
      priorities: priorityStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
    },
  });
});
