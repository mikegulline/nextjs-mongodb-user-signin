import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Input from '../../components/inputs/Input';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmail(value);
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      const { data } = await axios.post('/api/auth/forgot', {
        email,
      });
      setSuccess(data.message);
      setLoading(false);
    } catch (error) {
      setError(error.response.data.message);
      setLoading(false);
    }
  };

  const emailValidation = Yup.object({
    email: Yup.string()
      .required('Email address is required.')
      .email('Please enter a valid email.'),
  });

  return (
    <div>
      {loading && <div>Loading…</div>}
      <h1>Forgot Password?</h1>
      <Formik
        enableReinitialize
        initialValues={{ email }}
        validationSchema={emailValidation}
        onSubmit={() => handleSubmit()}
      >
        {(form) => (
          <Form>
            <Input
              type='text'
              name='email'
              icon='email'
              placeholder='Email Address'
              onChange={handleChange}
              value={email}
            />
            <button type='submit'>Reset Password</button>
          </Form>
        )}
      </Formik>
      {success && <div>{success}</div>}
      {error && <div>{error}</div>}
    </div>
  );
}
