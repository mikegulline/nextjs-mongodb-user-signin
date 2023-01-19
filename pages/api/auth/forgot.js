import nc from 'next-connect';
import db from '../../../utils/db';
import User from '../../../models/User';
import { validateEmail } from '../../../utils/validation';
import { createResetToken } from '../../../utils/tokens';
import { resetEmailTemplate } from '../../../emails/resetEmailTemplate';
import { sendEmail } from '../../../utils/sendEmail';

const handler = nc();

handler.post(async (req, res) => {
  try {
    await db.connectDB();
    const { email } = req.body;
    console.log(email);
    if (!email) {
      return res
        .status(400)
        .json({ message: 'Please enter your email address.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: `The email ${email} does not exist.`,
      });
    }

    const reset_token = createResetToken({
      id: user._id.toString(),
    });

    const url = `${process.env.BASE_URL}auth/reset/${reset_token}`;

    sendEmail(email, url, 'Reset your password.', resetEmailTemplate);

    await db.disconnectDB();

    return res.json({
      message:
        'Password reset started! Please check your email for instruction.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default handler;
