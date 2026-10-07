const router = require('express').Router();
const {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');

router.get('/', getSubjects);
router.post('/', createSubject);
router.put('/:id', updateSubject);
router.put('/:id/attendance', updateSubject);
router.delete('/:id', deleteSubject);

module.exports = router;
