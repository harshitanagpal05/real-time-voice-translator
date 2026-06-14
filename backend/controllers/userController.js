import User from '../models/User.js';

export async function getProfile(req, res) {
  try {
    return res.json({
      profile: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Failed to load profile' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, email } = req.body;
    const updates = {};

    if (name?.trim()) updates.name = name.trim();
    if (email?.trim()) {
      const normalized = email.toLowerCase().trim();
      const taken = await User.findOne({ email: normalized, _id: { $ne: req.user._id } });
      if (taken) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      updates.email = normalized;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    return res.json({
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}
