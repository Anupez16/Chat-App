import express from 'express';
import {
  createGroup,
  joinGroup,
  getUserGroups,
  getGroupMessages
} from "../controllers/groupController.js";

const router = express.Router();

router.post('/create', createGroup);
router.post('/join', joinGroup);
router.get('/user/:userId', getUserGroups);
router.get('/:groupId/messages', getGroupMessages);

export default router;
