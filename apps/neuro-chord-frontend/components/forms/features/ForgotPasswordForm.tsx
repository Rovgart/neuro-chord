'use client';
import { type ForgotPasswordSchema, forgotPasswordSchema } from '@/schemas/auth';
import { useInitRecoverAccountMutation } from '@/services/api';
import { Alert, Button, FieldError, Form, Input, Spinner, TextField } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

function ForgotPasswordForm() {
  const [initRecoverAccountMutate, { isLoading, isError, isSuccess }] = useInitRecoverAccountMutation();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const handleRecoverPass = async (data: ForgotPasswordSchema) => {
    const initRecovery = await initRecoverAccountMutate(data).unwrap();
    if (initRecovery) {
      router.push(`forgot-password/verify?email=${encodeURIComponent(data.email)}`);
    }
  };
  if (isSuccess) {
    return (
      <div className="flex flex-col w-full max-w-sm gap-6 p-8 rounded-2xl border border-success/20 bg-success/5 shadow-2xl animate-appearance-in">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-bold text-success">Check your inbox!</h2>
          <p className="text-sm text-foreground/70">
            If an account exists for that email, you will receive a password recovery link shortly.
          </p>
        </div>
        <Button variant="primary" className="w-full font-bold">
          BACK TO LOGIN
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-sm gap-6 p-8 rounded-2xl border border-divider bg-content1 shadow-2xl shadow-primary/5">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">
          <p className="text-primary">Recover password</p>
        </h2>
        <p className="text-sm text-foreground/60">We'll send you a link on your e-mail</p>
      </div>

      <Form onSubmit={handleSubmit(handleRecoverPass)} className="flex flex-col gap-4">
        {isError && <Alert color="danger" title="Error" />}

        <TextField isInvalid={!!errors.email} className="w-full">
          <Input placeholder="Enter your e-mail" type="email" {...register('email')} />
          <FieldError>{errors?.email?.message}</FieldError>
        </TextField>

        <Button
          className="w-full font-bold text-sm h-12 shadow-lg shadow-primary/20"
          type="submit"
          isPending={isLoading}
          isDisabled={isLoading}
        >
          {({ isPending }) => (
            <>
              {isPending ? <Spinner color="current" size="sm" /> : ''}
              {isLoading ? 'SENDING...' : 'SEND LINK'}
            </>
          )}
        </Button>
        <Link href={'/sign-in'}>
          <Button variant="danger" className="w-full font-medium">
            CANCEL AND GO BACK
          </Button>
        </Link>
      </Form>
    </div>
  );
}

export default ForgotPasswordForm;
