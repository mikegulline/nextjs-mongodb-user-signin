import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import Input from '../../../components/inputs/Input';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

const defaultValues = {
  password: '',
  confirm_password: '',
};

export default function ResetPassword({ token, id }) {
  const [user, setUser] = useState(defaultValues);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const { password, confirm_password } = user;
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put('/api/auth/reset', {
        token,
        id,
        password,
      });
      setTimeout(async () => {
        let options = {
          redirect: false,
          email: data.email,
          password,
        };
        const res = await signIn('credentials', options);
        router.push('/');
      }, 2000);
      setUser(defaultValues);
      setSuccess(data.message);

      setLoading(false);
    } catch (error) {
      setError(error.response.data.message);
      setLoading(false);
    }
  };

  const resetSchema = Yup.object({
    password: Yup.string()
      .required('Please enter a strong password')
      .min(8, 'Password must be at least 8 characters.')
      .max(36, 'Password can not be more than 36 characters.')
      .matches(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
        'Password must contain at least 8 characters, one uppercase, one number and one special case character.'
      ),
    confirm_password: Yup.string()
      .required('Please enter a strong password')
      .oneOf([Yup.ref('password')], 'Passwords do not match.'),
  });
  return (
    <div>
      {loading && <div>Loading…</div>}
      <h1>Reset Password</h1>
      <Formik
        enableReinitialize
        validationSchema={resetSchema}
        initialValues={{
          password,
          confirm_password,
        }}
        onSubmit={() => handleSubmit()}
      >
        {(form) => (
          <Form>
            <Input
              type='password'
              name='password'
              value={password}
              onChange={(e) => handleChange(e)}
              placeholder='New password'
            />
            <Input
              type='password'
              name='confirm_password'
              value={confirm_password}
              onChange={(e) => handleChange(e)}
              placeholder='Confirm password'
            />
            <button type='submit'>Reset Password</button>
          </Form>
        )}
      </Formik>
      {error && <div>{error}</div>}
      {success && <div>{success}</div>}
    </div>
  );
}

export async function getServerSideProps(context) {
  const { query, req } = context;
  const session = await getSession({ req });
  if (session) {
    return {
      redirect: {
        destination: '/',
      },
    };
  }
  const { token } = query;
  const { id } = jwt.verify(token, process.env.RESET_TOKEN_SECRET);

  return {
    props: {
      token,
      id,
    },
  };
}
