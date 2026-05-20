import { useState, useCallback } from 'react';

/**
 * useForm — reusable form state management hook.
 *
 * Reduces form boilerplate from ~40 lines to ~15 lines per form.
 *
 * Usage:
 *   const { values, errors, handleChange, handleSubmit, setFieldValue, reset } = useForm({
 *     initialValues: { name: '', email: '' },
 *     validate: (values) => {
 *       const errors = {};
 *       if (!values.name) errors.name = 'Name is required';
 *       if (!values.email) errors.email = 'Email is required';
 *       return errors;
 *     },
 *     onSubmit: async (values) => {
 *       await api.post('/students', values);
 *     },
 *   });
 */
export default function useForm({ initialValues = {}, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Generic change handler — works with input/select/textarea
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setValues((prev) => ({ ...prev, [name]: fieldValue }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setSubmitError(null);

    // Clear field error on change
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  // Set a single field programmatically
  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  // Set multiple fields at once
  const setMultipleValues = useCallback((newValues) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Blur handler — marks field as touched for "show error on blur" pattern
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Run validation on blur if validate fn exists
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors[name]) {
        setErrors((prev) => ({ ...prev, [name]: validationErrors[name] }));
      }
    }
  }, [validate, values]);

  // Submit handler
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();

    // Run full validation
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {});
        setTouched(allTouched);
        return;
      }
    }

    setErrors({});
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await onSubmit(values);
      setSubmitSuccess(true);
    } catch (err) {
      const message = err?.message || 'An error occurred. Please try again.';
      setSubmitError(message);

      // If backend returns field-level errors, apply them
      if (err?.errors && typeof err.errors === 'object') {
        setErrors(err.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  // Reset form to initial state
  const reset = useCallback((newInitial) => {
    setValues(newInitial || initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setSubmitError(null);
    setSubmitSuccess(false);
  }, [initialValues]);

  // Helper: get field error only if touched
  const getFieldError = useCallback((name) => {
    return touched[name] ? errors[name] : undefined;
  }, [errors, touched]);

  // Helper: check if form is valid (no errors)
  const isValid = Object.keys(errors).length === 0;

  // Helper: check if form is dirty (values differ from initial)
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    submitSuccess,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setMultipleValues,
    getFieldError,
    reset,
    setErrors,
    setSubmitError,
  };
}
