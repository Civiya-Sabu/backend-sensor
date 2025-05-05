const User = require('../models/User');
const { validationResult } = require('express-validator');
const sendEmail = require('../middlewares/sendEmail');
//const crypto = require('crypto');
const otpStore = {};

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, otp } = req.body;

    try {
        // Check if OTP matches
        const savedOtp = otpStore[email];
        if (!savedOtp || savedOtp.otp != otp || savedOtp.expiresAt < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ name, email, password });
        await user.save();

        delete otpStore[email]; // Clear OTP after successful registration

        const token = user.getSignedJwtToken();

        res.status(201).json({ success: true, token });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};


exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ msg: 'Email is required' });
    }

    try {
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
        otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // Save OTP with expiry

        // Send the OTP via email
        await sendEmail({
            email,
            subject: 'Your OTP Code',
            message: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
        });

        res.status(200).json({ msg: 'OTP sent successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ msg: 'Invalid credentials' });
      }
  
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ msg: 'Invalid credentials' });
      }
  
      const token = user.getSignedJwtToken();
  
      // Send back token + user info
      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server error' });
    }
  };
  

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.logout = (req, res) => {
    // On client side, the token should be deleted (from localStorage, cookies, etc.)
    return res.status(200).json({
        success: true,
        message: 'Logout successful'
    });
};

