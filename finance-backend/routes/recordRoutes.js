const express = require('express');
const { getAll, getOne, create, update, remove, exportCSV } = require('../controllers/recordController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/export', authorize('analyst', 'admin'), exportCSV);
router.get('/', authorize('viewer', 'analyst', 'admin'), getAll);
router.get('/:id', authorize('viewer', 'analyst', 'admin'), getOne);
router.post('/', authorize('admin'), create);
router.put('/:id', authorize('admin'), update);
router.delete('/:id', authorize('admin'), remove);

module.exports = router;
