'use client';
import { type RegisterSchema, registerSchema } from '@/schemas/auth';
import { useLazyCheckEmailQuery, useRegisterMutation } from '@/services/api';
import { Button, FieldError, Form, Input, Label, TextField, toast } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export default function RegisterForm() {
  const [trigger, { data, isFetching, isLoading: isCheckingLoading }] = useLazyCheckEmailQuery();
  const [signUp, { isLoading }] = useRegisterMutation();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: RegisterSchema) => {
    try {
      await signUp(data).unwrap();
      toast.success('Successfully registered');
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err?.data?.message;

      if (Array.isArray(errorMessage)) {
        toast.danger(errorMessage[0]);
      } else if (typeof errorMessage === 'string') {
        toast.danger(errorMessage);
      } else {
        toast.danger('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md gap-6 p-8 rounded-2xl border border-divider bg-content1 shadow-2xl shadow-primary/5">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">
          Neuro <span className="text-primary">Chord</span>
        </h2>
        <p className="text-sm text-foreground/60">Podłącz interfejs i rozpocznij sesję analityczną.</p>
      </div>

      <Form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <TextField isInvalid={!!errors.email} className="w-full " name="email" type="email">
          <Label>Email</Label>
          <Input
            placeholder="Enter your email"
            {...register('email')}
            onBlur={async (e) => {
              const email = e.target.value;

              try {
                if (email) {
                  const result = await trigger(email).unwrap();
                  if (!result.isAvailable) {
                    setError('email', { type: 'manual', message: 'This email is already in use' });
                  } else {
                    clearErrors('email');
                  }
                }
              } catch (error) {
                setError('email', { type: 'manual', message: 'Bad request' });
                throw new Error('Failed to authorize', error?.message);
              }
            }}
          />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </TextField>
        <TextField isInvalid={!!errors.password} className="w-full " name="password" type="email">
          <Label>Password</Label>
          <Input placeholder="Password" type="password" {...register('password')} />

          <FieldError>{errors.password?.message}</FieldError>
        </TextField>
        <TextField isInvalid={!!errors.confirmPassword} className="w-full " name="confirm-password" type="email">
          <Label>Confirm password</Label>
          <Input type="password" placeholder="Confirm your password" {...register('confirmPassword')} />
          {errors.confirmPassword && <FieldError>{errors.confirmPassword.message}</FieldError>}
        </TextField>
        <Button
          className="w-full font-bold text-sm h-12 shadow-lg shadow-primary/20"
          type="submit"
          variant="primary"
          isPending={isLoading}
          isDisabled={isLoading || isCheckingLoading}
        >
          {isLoading ? 'Creating an account...' : isCheckingLoading ? 'Checking email availability...' : 'SIGN UP'}
        </Button>

        <div className="flex items-center gap-4 my-2">
          <div className="h-px flex-1 bg-divider"></div>
          <span className="text-[10px] uppercase tracking-widest text-foreground/30">AI Neural Link</span>
          <div className="h-px flex-1 bg-divider"></div>
        </div>

        <Button
          className="w-full font-semibold border-secondary/30 text-secondary hover:bg-secondary/10"
          variant="ghost"
          type="button"
          onPress={() => router.push('/sign-in')}
        >
          Mam już konto
        </Button>
      </Form>
    </div>
  );
}
