'use client';

import { type LoginSchema, loginSchema } from '@/schemas/auth';
import { useLoginMutation } from '@/services/api';
import { setCredentials } from '@/store/slices/authSlice';
import { Button, FieldError, Form, Input, Label, TextField, toast } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

export default function LoginForm() {
  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchema) => {
    const payload = await login(data).unwrap();
    dispatch(
      setCredentials({
        user: payload.user,
        accessToken: payload.accessToken,
      }),
    );
    if (payload) {
      toast.success('Successfully registered');
    }
  };

  return (
    <div
      className="flex flex-col w-full max-w-md gap-8 p-8 rounded-2xl font-sans"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight leading-tight" style={{ color: 'var(--color-text)' }}>
          Neuro <span style={{ color: 'var(--color-primary)' }}>Chord</span>
        </h2>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          Log in to your account to access materials and sessions.
        </p>
      </div>

      {/* ── FORM ───────────────────────────────────────── */}
      <Form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        {/* EMAIL */}
        <TextField isInvalid={!!errors.email} className="w-full flex flex-col">
          <Label className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Email
          </Label>

          <Input
            placeholder="email@example.com"
            className="h-11 text-sm rounded-[var(--input-radius)] transition-[border-color,box-shadow]"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--input-text)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--input-border-focus)';
              e.currentTarget.style.boxShadow = 'var(--input-shadow-focus)';
            }}
            {...register('email')}
          />

          {errors.email && (
            <FieldError className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>
              {errors.email.message}
            </FieldError>
          )}
        </TextField>

        {/* PASSWORD */}
        <TextField isInvalid={!!errors.password} className="w-full flex flex-col">
          <Label className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Hasło
          </Label>

          <Input
            placeholder="••••••••"
            type="password"
            className="h-11 text-sm rounded-[var(--input-radius)] transition-[border-color,box-shadow]"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--input-text)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--input-border-focus)';
              e.currentTarget.style.boxShadow = 'var(--input-shadow-focus)';
            }}
            {...register('password')}
          />

          {errors.password?.message && (
            <FieldError className="text-xs mt-1" style={{ color: 'var(--color-danger)' }}>
              {errors.password.message}
            </FieldError>
          )}
        </TextField>

        <div className="flex justify-end -mt-2">
          <button
            type="button"
            onClick={() => router.push('forgot-password')}
            className="text-xs font-medium transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          isPending={isLoading}
          isDisabled={isLoading}
          className="w-full h-11 mt-2 text-sm font-semibold tracking-wide transition-colors"
          style={{
            background: 'var(--button-bg)',
            color: 'var(--button-text)',
            borderRadius: 'var(--button-radius)',
            boxShadow: 'var(--button-shadow)',
          }}
        >
          Sign In
        </Button>

        <div className="flex items-center gap-4 my-1">
          <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
          <span className="text-[11px] tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
            OR
          </span>
          <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
        </div>
        <Button
          variant="ghost"
          type="button"
          onPress={() => router.push('/sign-up')}
          className="w-full h-11 text-sm font-medium transition-colors"
          style={{
            background: 'var(--button-ghost-bg)',
            color: 'var(--button-ghost-text)',
            border: '1px solid var(--button-ghost-border)',
            borderRadius: 'var(--button-radius)',
          }}
        >
          Create an account
        </Button>
      </Form>
    </div>
  );
}
