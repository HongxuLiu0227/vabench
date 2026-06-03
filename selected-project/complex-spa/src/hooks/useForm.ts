import { useState, ChangeEvent } from 'react';

type FormValues = {
  [key: string]: any;
};

type FormErrors = {
  [key: string]: string;
};

type FormTouched = {
  [key: string]: boolean;
};

type UseFormProps = {
  initialValues: FormValues;
  validate?: (values: FormValues) => FormErrors;
  onSubmit: (values: FormValues) => void;
};

export const useForm = ({ initialValues, validate, onSubmit }: UseFormProps) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (validate) {
      setErrors(validate(values));
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });

    if (validate) {
      setErrors(validate(values));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    setErrors,
    setTouched,
  };
};
