'use client';
import { type RegisterSchema, registerSchema } from '@/schemas/auth';
import { useLazyCheckEmailQuery, useRegisterMutation } from '@/services/api';
import { Button, FieldError, Form, Input, Label, TextField, toast } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Fingerprint, MailCheck } from 'lucide-react'; // Dodajemy ikonki dla UX
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export default function RegisterForm() {
  const [trigger, { isLoading: isCheckingLoading }] = useLazyCheckEmailQuery();
  const [signUp, { isLoading, isSuccess }] = useRegisterMutation();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const userEmail = watch('email');

  const onSubmit = async (data: RegisterSchema) => {
    const result = await signUp(data);
    if (result.data) {
      toast.success('Account created successfully');
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col w-full max-w-md gap-6 p-8 rounded-2xl border border-success-soft bg-content1 shadow-2xl animate-appearance-in">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 rounded-full bg-success/10 text-success">
            <MailCheck size={48} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Check your email!</h2>
          <p className="text-sm text-foreground/60">
            We have sent a verification link to your email <br />
            <span className="text-foreground font-semibold">{userEmail}</span>
          </p>
        </div>

        <div className="bg-default-100 p-4 rounded-xl text-xs text-foreground/50 italic">
          The link is valid for 24 hours. If you do not receive the email, please check your SPAM folder.
        </div>

        <Button className="w-full font-bold h-12" onPress={() => router.push('/sign-in')}>
          BACK TO LOGIN
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-md gap-6 p-8 rounded-2xl border border-divider bg-content1 shadow-2xl shadow-primary/5">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Fingerprint className="text-primary" size={32} />
          Neuro <span className="text-primary">Chord</span>
        </h2>
        <p className="text-sm text-foreground/60">Dołącz do sieci i rozpocznij analizę neuronową.</p>
      </div>

      <Form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <TextField isInvalid={!!errors.email} className="w-full" name="email">
          <Label>Email</Label>
          <Input
            placeholder="Enter your email"
            {...register('email')}
            onBlur={async (e) => {
              const email = e.target.value;
              if (email) {
                try {
                  const result = await trigger(email).unwrap();
                  if (!result.isAvailable) {
                    setError('email', { type: 'manual', message: 'This email is already in use' });
                  } else {
                    clearErrors('email');
                  }
                } catch {
                  setError('email', { type: 'manual', message: 'Unexpected error occurred' });
                }
              }
            }}
          />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </TextField>

        <TextField isInvalid={!!errors.password} className="w-full" name="password">
          <Label>Password</Label>
          <Input placeholder="Password" type="password" {...register('password')} />
          <FieldError>{errors.password?.message}</FieldError>
        </TextField>

        <TextField isInvalid={!!errors.confirmPassword} className="w-full" name="confirm-password">
          <Label>Confirm password</Label>
          <Input type="password" placeholder="Confirm your password" {...register('confirmPassword')} />
          {errors.confirmPassword && <FieldError>{errors.confirmPassword.message}</FieldError>}
        </TextField>

        <Button
          className="w-full font-bold text-sm h-12 shadow-lg shadow-primary/20"
          type="submit"
          isPending={isLoading}
          isDisabled={isLoading || isCheckingLoading}
        >
          {isLoading ? 'Creating account...' : isCheckingLoading ? 'Checking email...' : 'SIGN UP'}
        </Button>

        <Button
          className="w-full font-semibold border-secondary/30 text-secondary hover:bg-secondary/10"
          variant="ghost"
          type="button"
          onPress={() => router.push('/sign-in')}
        >
          Already have an account
        </Button>
      </Form>
    </div>
  );
}
