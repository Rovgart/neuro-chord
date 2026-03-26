'use client';
import { Button, FieldError, Form, Input, Label, TextField, toast } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { type LoginSchema, loginSchema } from '@/schemas/auth';
import { useLoginMutation } from '@/services/api';
import { selectCurrentUser, setCredentials } from '@/store/slices/authSlice';

export default function LoginForm() {
  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  useEffect(() => {
    console.log(currentUser);
    return () => {
      console.log('CLEANING', currentUser);
    };
  }, [currentUser]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });
  useEffect(() => {});
  const onSubmit = async (data: LoginSchema) => {
    try {
      const payload = await login(data).unwrap();
      dispatch(
        setCredentials({
          user: payload.user,
          accessToken: payload.accessToken,
        }),
      );
      toast.success('Successfully registered');
      //   router.push('/dashboard');
    } catch (err: any) {
      toast.danger(err.message);
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
          <Input placeholder="Enter your email" {...register('email')} />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </TextField>
        <TextField isInvalid={!!errors.password} className="w-full " name="password" type="email">
          <Label>Password</Label>
          <Input placeholder="Password" type="password" {...register('password')} />
          <FieldError>{errors.password && errors.password?.message}</FieldError>
        </TextField>

        <div className="flex justify-end">
          <button
            onClick={() => router.push('forgot-password')}
            type="button"
            className="text-xs text-secondary hover:text-secondary-400 transition-colors"
          >
            Zapomniałeś hasła?
          </button>
        </div>

        <Button
          className="w-full font-bold text-sm h-12 shadow-lg shadow-primary/20"
          type="submit"
          isPending={isLoading}
          isDisabled={isLoading}
        >
          ZALOGUJ SIĘ
        </Button>

        <div className="flex items-center gap-4 my-2">
          <div className="h-1px flex-1 bg-divider"></div>
          <span className="text-[10px] uppercase tracking-widest text-foreground/30">AI Neural Link</span>
          <div className="h-px flex-1 bg-divider"></div>
        </div>

        <Button
          className="w-full font-semibold border-secondary/30 text-secondary hover:bg-secondary/10"
          variant="ghost"
          type="button"
          onPress={() => router.push('/sign-up')}
        >
          Utwórz konto
        </Button>
      </Form>
    </div>
  );
}
