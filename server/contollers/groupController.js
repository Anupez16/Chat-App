import Group from "../models/Groups.js";

export const createGroup = async (req, res) => {
  const { name, userId } = req.body;
  try {
    const group = await Group.create({ name, members: [userId] });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const joinGroup = async (req, res) => {
  const { groupId, userId } = req.body;
  try {
    const group = await Group.findById(groupId);
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }
    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
