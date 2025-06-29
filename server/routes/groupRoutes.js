import express from 'express';
import { createGroup, joinGroup } from '../contollers/groupController.js';

const router = express.Router();
router.post('/create', createGroup);
router.post('/join', joinGroup);

export default router;
