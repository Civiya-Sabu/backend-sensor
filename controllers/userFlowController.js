const UserFlow = require('../models/userFlowModel');

// Create or update user flow
exports.saveUserFlow = async (req, res) => {
  const { userId, username, nodes, edges } = req.body;

  try {
    const existingFlow = await UserFlow.findOne({ userId });

    if (existingFlow) {
      existingFlow.username = username;
      existingFlow.nodes = nodes;
      existingFlow.edges = edges;
      await existingFlow.save();
      return res.status(200).json({ message: 'Flow updated successfully' });
    }

    const newFlow = new UserFlow({ userId, username, nodes, edges });
    await newFlow.save();
    res.status(201).json({ message: 'Flow saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user flow
exports.deleteUserFlow = async (req, res) => {
  const { userId } = req.params;

  try {
    const deleted = await UserFlow.findOneAndDelete({ userId });
    if (!deleted) {
      return res.status(404).json({ message: 'Flow not found' });
    }
    res.status(200).json({ message: 'Flow deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user flow by userId
exports.getUserFlow = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const userFlow = await UserFlow.findOne({ userId });
  
      if (!userFlow) {
        return res.status(404).json({ message: 'Flow not found' });
      }
  
      res.status(200).json({ flow: userFlow.flow });
    } catch (error) {
      console.error('Error fetching user flow:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };