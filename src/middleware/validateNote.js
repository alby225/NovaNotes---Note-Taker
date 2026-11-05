// Request payload validator for creating / updating notes
const validateNote = (req, res, next) => {
  const { title, content, category, priority } = req.body;

  // For POST requests, title and content are mandatory
  if (req.method === 'POST') {
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Title is required and must not be empty.',
      });
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Content is required and must not be empty.',
      });
    }
  }

  // Validate title length if provided
  if (title && title.trim().length > 150) {
    return res.status(400).json({
      success: false,
      error: 'Title cannot exceed 150 characters.',
    });
  }

  // Validate category if provided
  const validCategories = ['Work', 'Personal', 'Ideas', 'Tasks', 'Study', 'General'];
  if (category && !validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      error: `Invalid category. Allowed values: ${validCategories.join(', ')}`,
    });
  }

  // Validate priority if provided
  const validPriorities = ['Low', 'Medium', 'High'];
  if (priority && !validPriorities.includes(priority)) {
    return res.status(400).json({
      success: false,
      error: `Invalid priority. Allowed values: ${validPriorities.join(', ')}`,
    });
  }

  next();
};

module.exports = validateNote;
