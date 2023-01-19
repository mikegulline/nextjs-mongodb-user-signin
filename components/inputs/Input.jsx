import { ErrorMessage, useField } from 'formik';

export default function Input({ icon, ...props }) {
  const [field, meta] = useField(props);
  return (
    <div>
      <input {...field} {...props} />
      {meta.touched && meta.error ? <ErrorMessage name={field.name} /> : ''}
    </div>
  );
}
