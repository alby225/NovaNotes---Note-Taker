const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
  getStats,
} = require('../controllers/noteController');
const validateNote = require('../middleware/validateNote');

// Analytics route (placed before /:id to avoid ID conflict)
router.get('/stats/overview', getStats);

// Main CRUD routes
router
  .route('/')
  .get(getNotes)
  .post(validateNote, createNote);

router
  .route('/:id')
  .get(getNoteById)
  .put(validateNote, updateNote)
  .delete(deleteNote);

// Additional high-utility action
router.patch('/:id/pin', togglePin);

module.exports = router;
