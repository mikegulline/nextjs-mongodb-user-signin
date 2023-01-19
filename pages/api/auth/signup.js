import nc from 'next-connect';
import db from '../../../utils/db';
import User from '../../../models/User';
import bcrypt from 'bcrypt';
import { validateEmail } from '../../../utils/validation';
import { createActivationToken } from '../../../utils/tokens';
import { sendEmail } from '../../../utils/sendEmail';
import { activateEmailTemplate } from '../../../emails/activateEmailTemplate';

const handler = nc();

handler.post(async (req, res) => {
  try {
    await db.connectDB();
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email.' });
    }

    if (password < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters long.' });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: `The email ${email} has already been registered.`,
      });
    }

    const encryptedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({ name, email, password: encryptedPassword });
    const addedUser = await newUser.save();

    const activation_token = createActivationToken({
      id: addedUser._id.toString(),
    });

    const url = `${process.env.BASE_URL}auth/activate/${activation_token}`;

    sendEmail(email, url, 'Activate your account.', activateEmailTemplate);

    await db.disconnectDB();

    return res.json({
      message: 'Register success! Please activate your email to start.',
      _id: addedUser._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default handler;
