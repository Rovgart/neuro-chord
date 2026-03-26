'use client';
import { Button, FieldError, Form, Input, Label, TextField, toast } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { type ForgotPasswordSchema, forgotPasswordSchema } from '@/schemas/auth';
import { useForgotPasswordMutation } from '@/services/api';

type Props = {};

function ForgotPasswordForm({}: Props) {
  const [forgotPasswordMutate, { data, isLoading, isError, isSuccess }] = useForgotPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({ resolver: zodResolver(forgotPasswordSchema) });
  const handleRecoverPass = async (data: ForgotPasswordSchema) => {
    console.log(data);
  };

  return (
    <div className="flex flex-col w-full max-w-sm gap-6 p-8 rounded-2xl border border-divider bg-content1 shadow-2xl shadow-primary/5">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">
          <p className="text-primary">Recover your password</p>
        </h2>
        <p className="text-sm text-foreground/60">We'll send you a link on your e-mail</p>
      </div>
      <Form onSubmit={handleSubmit(handleRecoverPass)}>
        <TextField isInvalid={!!errors.email} className="w-full max-w-md  " name="confirm-password" type="email">
          <Label>Enter email</Label>
          <Input type="email" placeholder="Enter e-mail" {...register('email')} />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </TextField>
        <Button className="w-full font-bold text-sm h-12 shadow-lg shadow-primary/20" type="submit">
          SEND
        </Button>
      </Form>
    </div>
  );
}

export default ForgotPasswordForm;
