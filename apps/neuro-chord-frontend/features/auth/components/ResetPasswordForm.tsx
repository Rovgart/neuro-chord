'use client';
import { type ResetPasswordSchema, resetPasswordSchema } from '@/schemas/auth';
import { useResetPasswordMutation } from '@/services/api';
import { Button, FieldError, Form, Input, Label, TextField, toast } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

function ResetPasswordForm() {
  const [resetPassword, { isLoading, isSuccess }] = useResetPasswordMutation();
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmNewPassword: '' },
  });

  const handleReset = async (data: ResetPasswordSchema) => {
    await resetPassword({ pass: data.newPassword }).unwrap();
    toast.success('Hasło zostało pomyślnie zmienione.');
    router.push('/sign-in');
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col w-full max-w-md gap-6 p-8 rounded-2xl border border-success-soft bg-success/5 shadow-2xl text-center">
        <CheckCircle2 className="mx-auto text-success" size={48} />
        <h2 className="text-2xl font-bold text-success">Hasło zmienione!</h2>
        <p className="text-sm text-foreground/60">Twoje nowe hasło zostało zapisane w systemie Neuro Chord.</p>
        <Button onPress={() => router.push('/login')}>POWRÓT DO LOGOWANIA</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-md gap-6 p-8 rounded-2xl border border-divider bg-content1 shadow-2xl shadow-primary/5">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">
          Zresetuj <span className="text-primary">hasło</span>
        </h2>
        <p className="text-sm text-foreground/60">Wprowadź nowe poświadczenia dla swojego interfejsu.</p>
      </div>

      <Form className="flex flex-col gap-4" onSubmit={handleSubmit(handleReset)}>
        <TextField isInvalid={!!errors.newPassword} className="w-full" name="newPassword">
          <Label className="flex items-center gap-2">
            <Lock size={14} /> Nowe hasło
          </Label>
          <Input placeholder="Minimum 8 znaków" type="password" {...register('newPassword')} />
          {errors.newPassword && <FieldError>{errors.newPassword.message}</FieldError>}
        </TextField>

        <TextField isInvalid={!!errors.confirmNewPassword} className="w-full" name="confirmNewPassword">
          <Label className="flex items-center gap-2">
            <Lock size={14} /> Potwierdź hasło
          </Label>
          <Input placeholder="Powtórz nowe hasło" type="password" {...register('confirmNewPassword')} />
          {errors.confirmNewPassword && <FieldError>{errors.confirmNewPassword.message}</FieldError>}
        </TextField>

        <Button
          className="w-full font-bold text-sm h-12 shadow-lg shadow-primary/20 mt-2"
          type="submit"
          isPending={isLoading}
          isDisabled={isLoading}
        >
          {isLoading ? 'AKTUALIZACJA...' : 'ZMIEŃ HASŁO'}
        </Button>
      </Form>
    </div>
  );
}

export default ResetPasswordForm;
