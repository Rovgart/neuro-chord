'use client';

import { useCompleteOnboardingMutation } from '@/services/api';
import { setCredentials } from '@/store/slices/authSlice';
import { Button, FieldError, Form, Input, Label, TextArea, TextField } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { OnboardingDto, type OnboardingDtoType, UserRole } from '../types';

function OnboardingForm() {
  const [completeOnboarding, { isLoading }] = useCompleteOnboardingMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<OnboardingDtoType>({
    resolver: zodResolver(OnboardingDto),
    defaultValues: {
      role: UserRole.Student,
      displayName: '',
      username: '',
      description: '',
      imgUrl: '',
      specialization: '',
    },
  });

  const selectedRole = useWatch({ control, name: 'role' });
  const { onBlur: onBlurDisplayName, ...restDisplayName } = register('displayName');
  const { onBlur: onBlurUsername, ...restUsername } = register('username');
  const { onBlur: onBlurDescription, ...restDescription } = register('description');
  const { onBlur: onBlurSpecialization, ...restSpecialization } = register('specialization');

  const onSubmit = async (data: OnboardingDtoType) => {
    const result = await completeOnboarding(data).unwrap();
    console.log(result);

    if (result) {
      dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }));
      router.refresh();
      router.push('/dashboard');
      return;
    }
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--input-border-focus)';
    e.currentTarget.style.boxShadow = 'var(--input-shadow-focus)';
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    color: 'var(--input-text)',
    borderRadius: 'var(--input-radius)',
    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen p-4"
      style={{ background: 'var(--color-bg)', fontFamily: 'var(--font-sans)' }}
    >
      <div
        className="w-full max-w-xl"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--card-radius)',
          boxShadow: 'var(--card-shadow)',
          padding: 'var(--card-padding)',
        }}
      >
        {/* ── HEADER ───────────────────────────────────── */}
        <div className="flex flex-col items-center gap-1 mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Welcome to <span style={{ color: 'var(--color-primary)' }}>Neuro Chord</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Set up your profile to get started.
          </p>
        </div>

        <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* ── ROLE SELECTOR ─────────────────────────── */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              I am a…
            </span>

            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <div
                  className="grid grid-cols-2 gap-2 p-1 rounded-xl"
                  style={{ background: 'var(--color-surface-elevated)' }}
                >
                  {/* Student tab */}
                  <button
                    type="button"
                    onClick={() => field.onChange(UserRole.Student)}
                    className="flex flex-col items-center gap-1.5 py-3 px-4 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: field.value === UserRole.Student ? 'var(--card-bg)' : 'transparent',
                      color: field.value === UserRole.Student ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      boxShadow: field.value === UserRole.Student ? 'var(--shadow-sm)' : 'none',
                      border:
                        field.value === UserRole.Student ? '1px solid var(--color-border)' : '1px solid transparent',
                    }}
                  >
                    <BookOpen size={18} />
                    <span>Student</span>
                  </button>

                  {/* Teacher tab */}
                  <button
                    type="button"
                    onClick={() => field.onChange(UserRole.Teacher)}
                    className="flex flex-col items-center gap-1.5 py-3 px-4 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: field.value === UserRole.Teacher ? 'var(--card-bg)' : 'transparent',
                      color: field.value === UserRole.Teacher ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      boxShadow: field.value === UserRole.Teacher ? 'var(--shadow-sm)' : 'none',
                      border:
                        field.value === UserRole.Teacher ? '1px solid var(--color-border)' : '1px solid transparent',
                    }}
                  >
                    <GraduationCap size={18} />
                    <span>Teacher</span>
                  </button>
                </div>
              )}
            />

            {errors.role && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-danger)' }}>
                {errors.role.message}
              </p>
            )}
          </div>

          {/* ── DISPLAY NAME ──────────────────────────── */}
          <TextField isInvalid={!!errors.displayName} className="flex flex-col gap-1">
            <Label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Display Name <span style={{ color: 'var(--color-danger)' }}>*</span>
            </Label>
            <Input
              placeholder="e.g. Alex Morgan"
              className="h-10 text-sm"
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={onBlurDisplayName}
              {...restDisplayName}
            />
            {errors.displayName && (
              <FieldError className="text-xs" style={{ color: 'var(--color-danger)' }}>
                {errors.displayName.message}
              </FieldError>
            )}
          </TextField>

          {/* ── USERNAME ──────────────────────────────── */}
          <TextField isInvalid={!!errors.username} className="flex flex-col gap-1">
            <Label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Username
            </Label>
            <Input
              placeholder="e.g. alex.morgan_42"
              className="h-10 text-sm"
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={onBlurUsername}
              {...restUsername}
            />
            {errors.username && (
              <FieldError className="text-xs" style={{ color: 'var(--color-danger)' }}>
                {errors.username.message}
              </FieldError>
            )}
          </TextField>

          {/* ── SPECIALIZATION (Teacher only) ─────────── */}
          {selectedRole === UserRole.Teacher && (
            <TextField isInvalid={!!errors.specialization} className="flex flex-col gap-1">
              <Label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                Specialization
                <span className="ml-1 font-normal" style={{ color: 'var(--color-text-placeholder)' }}>
                  (optional)
                </span>
              </Label>
              <Input
                placeholder="e.g. Music Theory, Neuroscience"
                className="h-10 text-sm"
                style={inputStyle}
                onFocus={focusStyle}
                onBlur={onBlurSpecialization}
                {...restSpecialization}
              />
              {errors.specialization && (
                <FieldError className="text-xs" style={{ color: 'var(--color-danger)' }}>
                  {errors.specialization.message}
                </FieldError>
              )}
            </TextField>
          )}

          {/* ── DESCRIPTION ───────────────────────────── */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Bio <span style={{ color: 'var(--color-danger)' }}>*</span>
            </Label>
            <TextArea
              placeholder={
                selectedRole === UserRole.Teacher
                  ? 'Tell students about your background and teaching style…'
                  : 'Tell teachers a bit about yourself and what you want to learn…'
              }
              rows={4}
              className="text-sm resize-none"
              style={{
                ...inputStyle,
                padding: '10px 12px',
              }}
              onFocus={focusStyle}
              onBlur={onBlurDescription}
              {...restDescription}
            />
            {errors.description && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-danger)' }}>
                {errors.description.message}
              </p>
            )}
          </div>

          {/* ── DIVIDER ───────────────────────────────── */}
          <div className="h-px w-full" style={{ background: 'var(--color-border-subtle)' }} />

          {/* ── SUBMIT ────────────────────────────────── */}
          <Button
            type="submit"
            isPending={isLoading}
            isDisabled={isLoading}
            className="w-full h-11 text-sm font-semibold tracking-wide transition-colors"
            style={{
              background: 'var(--button-bg)',
              color: 'var(--button-text)',
              borderRadius: 'var(--button-radius)',
              boxShadow: 'var(--button-shadow)',
            }}
          >
            Go to Dashboard
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default OnboardingForm;
