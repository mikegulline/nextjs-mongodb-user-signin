import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import Input from '../components/inputs/Input';
import Link from 'next/link';
import {
  getCsrfToken,
  getProviders,
  getSession,
  signIn,
} from 'next-auth/react';
import axios from 'axios';
import { useRouter } from 'next/router';

const initialValues = {
  login_email: '',
  login_password: '',
  name: '',
  email: '',
  password: '',
  confirm_password: '',
  success: '',
  error: '',
  login_error: '',
};

export default function SignIn({ providers, csrfToken, callbackUrl }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(initialValues);
  const {
    login_email,
    login_password,
    name,
    email,
    password,
    confirm_password,
    success,
    error,
    login_error,
  } = user;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const loginValidation = Yup.object({
    login_email: Yup.string()
      .required('Email address is required.')
      .email('Please enter a valid email.'),
    login_password: Yup.string().required('Please enter a strong password'),
  });
  const signUpValidation = Yup.object({
    name: Yup.string()
      .matches(/^[aA-zZ]+$/, 'Numbers and special characters are not allowed.')
      .required('Please enter your name.')
      .min(3, 'Name must be between 3 and 16 characters.')
      .max(16, 'Name must be between 3 and 16 characters.'),
    email: Yup.string()
      .required('Email address is required.')
      .email('Please enter a valid email.'),
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

  const signUpHandler = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/auth/signup', {
        name,
        email,
        password,
      });
      setUser({ ...user, error: '', success: data.message });
      setLoading(false);
      setTimeout(async () => {
        let options = {
          redirect: false,
          email,
          password,
        };
        const res = await signIn('credentials', options);
        router.push(callbackUrl || '/');
      }, 2000);
    } catch (error) {
      setUser({ ...user, success: '', error: error.response.data.message });
      setLoading(false);
    }
  };

  const signInHandler = async () => {
    setLoading(true);
    let options = {
      redirect: false,
      email: login_email,
      password: login_password,
    };
    const res = await signIn('credentials', options);
    setUser({ ...user, success: '', error: '' });
    setLoading(false);
    if (res?.error) {
      setLoading(false);
      setUser({ ...user, login_error: res?.error });
    } else {
      return router.push(callbackUrl || '/');
    }
  };

  return (
    <>
      <div>
        <h1>Sign In</h1>
        <Formik
          enableReinitialize
          initialValues={{
            login_email,
            login_password,
          }}
          validationSchema={loginValidation}
          onSubmit={() => {
            signInHandler();
          }}
        >
          {(form) => (
            <Form method='post' action='/api/auth/signin/email'>
              <input type='hidden' name='csrfToken' defaultValue={csrfToken} />
              <Input
                type='text'
                name='login_email'
                icon='email'
                placeholder='Email Address'
                onChange={handleChange}
                value={login_email}
              />
              <Input
                type='password'
                name='login_password'
                icon='password'
                placeholder='Password'
                onChange={handleChange}
                value={login_password}
              />
              <p>
                <Link href='/auth/forgot'>Forgot password</Link>
              </p>
              <button type='submit'>Sign In</button>
            </Form>
          )}
        </Formik>
        {login_error && <div>{login_error}</div>}
        <br />
        <div>Or sign in with…</div>
        {providers.map(({ name, id }) => {
          if (name === 'Credentials') return;

          return (
            <span key={id}>
              <button onClick={() => signIn(id)}>{name}</button>{' '}
            </span>
          );
        })}
      </div>

      <br />
      <hr />
      <br />

      <div>
        {loading && <div>Loading…</div>}
        <h1>Sign Up</h1>
        <Formik
          enableReinitialize
          initialValues={{
            name,
            email,
            password,
            confirm_password,
          }}
          validationSchema={signUpValidation}
          onSubmit={() => {
            signUpHandler();
          }}
        >
          {(form) => (
            <Form>
              <Input
                type='text'
                name='name'
                icon='user'
                placeholder='Name'
                onChange={handleChange}
                value={name}
              />
              <Input
                type='text'
                name='email'
                icon='email'
                placeholder='Email Address'
                onChange={handleChange}
                value={email}
              />
              <Input
                type='password'
                name='password'
                icon='password'
                placeholder='Password'
                onChange={handleChange}
                value={password}
              />
              <Input
                type='password'
                name='confirm_password'
                icon='password'
                placeholder='Confirm Password'
                onChange={handleChange}
                value={confirm_password}
              />
              <button type='submit'>Sign Up</button>
            </Form>
          )}
        </Formik>
        {error && <div>{error}</div>}
        {success && <div>{success}</div>}
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { req, query } = context;
  const session = await getSession({ req });
  const { callbackUrl } = query;
  if (session && callbackUrl) {
    return {
      redirect: {
        destination: callbackUrl,
      },
    };
  }
  const csrfToken = await getCsrfToken(context);
  const providers = Object.values(await getProviders());

  return {
    props: { providers, csrfToken, callbackUrl: callbackUrl || '/' },
  };
}
