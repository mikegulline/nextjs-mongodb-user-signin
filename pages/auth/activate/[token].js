import { useState } from 'react';
import { useRouter } from 'next/router';
import { Formik, Form } from 'formik';
import Link from 'next/link';
import * as Yup from 'yup';
import jwt from 'jsonwebtoken';
import db from '../../../utils/db';
import User from '../../../models/User';
import { ObjectId } from 'mongodb';
import { signIn, getCsrfToken } from 'next-auth/react';
import Input from '../../../components/inputs/Input';

export default function Activate({ email, error, csrfToken }) {
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async () => {
    console.log('ekfhjdlsalk');
    let options = {
      redirect: false,
      email,
      password,
    };
    console.log(options);
    const res = await signIn('credentials', options);
    if (res?.error) {
      setFormError(res.error);
    } else {
      return router.push('/');
    }
  };

  const loginValidation = Yup.object({
    password: Yup.string()
      .required('Please enter a strong password')
      .min(8, 'Password must be at least 8 characters.')
      .max(36, 'Password can not be more than 36 characters.')
      .matches(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
        'Password must contain at least 8 characters, one uppercase, one number and one special case character.'
      ),
  });

  if (error) {
    return (
      <>
        <h1>email varification</h1>
        <div>{error}</div>
      </>
    );
  }
  return (
    <>
      <h1>email varification</h1>
      <div>
        <p>Your email has been verified!</p>
        <p>Enter your password to sign in…</p>
      </div>
      <Formik
        enableReinitialize
        initialValues={{
          email,
          password,
        }}
        validationSchema={loginValidation}
        onSubmit={() => {
          handleSubmit();
        }}
      >
        {(form) => (
          <Form method='post' action='/api/auth/signin/email'>
            <input type='hidden' name='csrfToken' defaultValue={csrfToken} />
            <input type='hidden' name='email' value={email} />
            <Input
              type='password'
              name='password'
              placeholder='Your password'
              onChange={(e) => handleChange(e)}
              value={password}
            />
            <p>
              <Link href='/auth/forgot'>Forgot password</Link>
            </p>
            {formError && <p>{formError}</p>}
            <button type='submit'>Sign In</button>
          </Form>
        )}
      </Formik>
    </>
  );
}

export async function getServerSideProps(context) {
  const { token } = context.query;
  const { id } = jwt.verify(token, process.env.ACTIVATION_TOKEN_SECRET);
  const csrfToken = await getCsrfToken(context);
  db.connectDB();

  const getUser = await User.findById(ObjectId(id));

  if (!getUser) {
    return {
      props: {
        email: '',
        error: 'Can not verify user.',
      },
    };
  }

  await getUser.updateOne({ emailVerified: true });

  db.disconnectDB();

  return {
    props: {
      email: getUser.email,
      error: '',
      csrfToken,
    },
  };
}
