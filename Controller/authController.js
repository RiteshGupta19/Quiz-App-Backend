const User = require('../Model/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { signUpValidation, signInValidation } = require('../validator/authValidation');


const signUp = async (req, res) => {
  try {
    const { error, value } = signUpValidation.validate(req.body, { abortEarly: false });

    if (error) {
      const validationErrors = error.details.map((err) => err.message);
      return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }

    const { name, email, password, repass } = value;

    if (password !== repass) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};


const signIn = async (req, res) => {
  try {
    // console.log('🔐 Login attempt started');
    // console.log('📥 Request body:', req.body);

    // 1. Validate input
    const { error, value } = signInValidation.validate(req.body, { abortEarly: false });
    if (error) {
      const validationErrors = error.details.map((err) => err.message);
      // console.log('❌ Validation failed:', validationErrors);
      return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
    }

    const { email, password } = value;
    // console.log('✅ Validation passed:', value);

    // 2. Find user
    const user = await User.findOne({ email }).select('name email password isVerified isFirstLogin');
    if (!user) {
      // console.log('❌ User not found with email:', email);
      return res.status(404).json({ message: 'Email not found' });
    }
    // console.log('👤 User found:', user.email);

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password.toString(), user.password);
    if (!isMatch) {
      // console.log('❌ Password mismatch for user:', user.email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // console.log('🔐 Password matched');

    // 4. Check email verification (commented)
    // if (!user.isVerified) {
    //   console.log('⚠️ Email not verified:', user.email);
    //   await emailSending({ email, emailType: 'VERIFY', NewuserId: user._id });
    //   return res.status(403).json({
    //     status: 'NotVerified',
    //     title: 'Email verification required',
    //     message: `We've sent a verification email to ${email}. Please verify your email to continue.`,
    //   });
    // }

    // 5. Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
    // console.log('🔑 Tokens generated' , refreshToken);

    // 6. Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    // console.log('🍪 Refresh token set in cookie');

    // 7. First login check
    const isFirstLogin = user.isFirstLogin;
    if (isFirstLogin) {
      user.isFirstLogin = false;
      await user.save();
      // console.log('🆕 First login marked as complete');
    }

    // 8. Response
    // console.log('✅ Login successful for user:', user.email);
    return res.status(200).json({
      message: 'Login successful',
      accessToken,
      isFirstTime: isFirstLogin,
      user: {
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error('❗ Admin login error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};






const refreshAccessToken = (req, res) => {
  const token = req.cookies.refreshToken; 

  if (!token) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    console.error('Refresh token error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};



const getUserData = async (req, res) => {
  try {
    // console.log('object.');
    const userId = req.user.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const userData = await User.findOne({ _id: userId });

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(userData);
  } catch (err) {
    console.error('Failed to fetch user data:', err);
    return res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};


module.exports = {
  signUp,
  signIn,
  refreshAccessToken,
  getUserData
};
