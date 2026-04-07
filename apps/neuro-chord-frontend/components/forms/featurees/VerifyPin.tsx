'use client';
import type { VerifyPinSchema } from '@/schemas/auth';
import { verifyPinSchema } from '@/schemas/auth';
import { useVerifyPinMutation } from '@/services/api';
import { protectEmail } from '@/utils';
import { Button, Form, InputOTP, Label, toast } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
// 1. Schemat Walidacji

export function VerifyPinForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [verifyPin, { isLoading, isError, isSuccess }] = useVerifyPinMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyPinSchema>({
    resolver: zodResolver(verifyPinSchema),
    defaultValues: { pin: '' },
  });
  const router = useRouter();
  const onVerify = async (data: VerifyPinSchema) => {
    console.log('Submitting PIN:', data.pin);
    try {
      const verifiedPin = await verifyPin({ email, pin: data.pin });
      if (verifiedPin) {
        router.push('reset');
        toast.success('Pin successfully verified');
      }
    } catch (error) {
      toast.danger('Failed to verify pin');
      console.error('Failed to verify pin', error);
      throw error;
    }
  };
  const protectedEmail = protectEmail(email);

  return (
    <div className="flex w-full max-w-[320px] flex-col gap-6 p-8 rounded-2xl border border-divider bg-content1 shadow-2xl">
      <div className="flex flex-col gap-1">
        <Label className="text-xl font-bold">Verify account</Label>
        <p className="text-sm text-foreground/60">
          We&apos;ve sent a code to <span className="text-foreground font-medium">{protectedEmail}</span>
        </p>
      </div>

      <Form onSubmit={handleSubmit(onVerify)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 items-center">
          <Controller
            name="pin"
            control={control}
            render={({ field }) => (
              <InputOTP maxLength={6} value={field.value} onChange={field.onChange} isDisabled={isLoading}>
                <InputOTP.Group>
                  <InputOTP.Slot index={0} />
                  <InputOTP.Slot index={1} />
                  <InputOTP.Slot index={2} />
                </InputOTP.Group>
                <InputOTP.Separator />
                <InputOTP.Group>
                  <InputOTP.Slot index={3} />
                  <InputOTP.Slot index={4} />
                  <InputOTP.Slot index={5} />
                </InputOTP.Group>
              </InputOTP>
            )}
          />
          {errors.pin && <p className="text-tiny text-danger">{errors.pin.message}</p>}
        </div>

        <Button type="submit" className="w-full font-bold h-12" isDisabled={isLoading}>
          {({ isPending }) => (isPending ? 'VERIFYING...' : 'VERIFY CODE')}
        </Button>
      </Form>

      <div className="flex items-center justify-center gap-1 pt-2">
        <p className="text-sm text-foreground/60">Didn&apos;t receive a code?</p>
        <Link className="text-sm text-primary underline font-medium" href="#">
          Resend
        </Link>
      </div>
    </div>
  );
}
