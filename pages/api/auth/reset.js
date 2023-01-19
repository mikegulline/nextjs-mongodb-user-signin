import nc from 'next-connect';
import User from '../../../models/User';
import db from '../../../utils/db';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

const handler = nc();

handler.put(async (req, res) => {
  const { password, id } = req.body;
  db.connectDB();

  const updateUser = await User.findById(ObjectId(id));

  if (!updateUser) {
    return res.status(400).json({ message: 'No user found.' });
  }

  const encryptedPassword = await bcrypt.hash(password, 12);

  await updateUser.updateOne({
    password: encryptedPassword,
  });

  db.disconnectDB();
  return res
    .status(200)
    .json({
      message: 'Password updated successfuly.',
      email: updateUser.email,
    });
});

export default handler;
