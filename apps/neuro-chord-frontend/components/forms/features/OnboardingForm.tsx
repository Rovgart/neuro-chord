// 'use client';
// useCompleteProfileMutation;

// import { OnboardingData, onboardingSchema } from '@/schemas/onboarding';
// import { useCompleteProfileMutation } from '@/services/api';

// useCompleteProfileMutation;

// import {
//   Button,
//   Card,
//   CardHeader,
//   FieldError,
//   Input,
//   Label,
//   ListBox,
//   Select,
//   Tabs,
//   TextArea,
//   TextField,
// } from '@heroui/react';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { BookOpen, GraduationCap } from 'lucide-react';
// import { Controller, useForm } from 'react-hook-form';

// function OnboardingForm() {
//   // const [completeOnboarding] = useCompleteOnboardingMutation();

//   const {
//     register,
//     handleSubmit,
//     control,
//     // watch,
//     formState: { errors },
//   } = useForm<OnboardingData>({
//     resolver: zodResolver(onboardingSchema),
//     defaultValues: {
//       role: 'STUDENT',
//     },
//   });

//   // const selectedRole = watch('role');

//   // const onSubmit = async (data: OnboardingData) => {
//   //   await completeOnboarding(data).unwrap();
//   // };

//   return (
//     <div className="flex justify-center items-center min-h-[80vh] p-4">
//       <Card className="w-full max-w-xl shadow-2xl bg-background/60 backdrop-blur-md border-none">
//         <CardHeader className="flex flex-col gap-1 items-center pb-4">
//           <h1 className="text-2xl font-bold tracking-tight">Witaj w Neuro Chord</h1>
//           <p className="text-default-500 text-sm">Skonfiguruj swój profil dostępowy</p>
//         </CardHeader>

//         <Card.Content className="py-4">
//           <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
//             <div className="flex flex-col gap-3">
//               <Label> Choose your path</Label>
//               <Controller
//                 control={control}
//                 name="role"
//                 render={({ field }) => (
//                   <Tabs className="w-full" selectedKey={field.value} onSelectionChange={(key) => field.onChange(key)}>
//                     <Tabs.ListContainer className="bg-default-100 p-1 rounded-xl">
//                       <Tabs.List aria-label="Wybór roli użytkownika" className="gap-2">
//                         <Tabs.Tab id="STUDENT" className="flex-1 py-3 h-auto data-[selected=true]:text-secondary">
//                           <div className="flex flex-col items-center gap-1">
//                             <BookOpen size={20} />
//                             <span className="text-xs font-semibold">Uczeń</span>
//                           </div>
//                           <Tabs.Indicator className="bg-secondary shadow-[0_0_15px_rgba(147,51,234,0.5)]" />
//                         </Tabs.Tab>

//                         <Tabs.Tab id="TEACHER" className="flex-1 py-3 h-auto data-[selected=true]:text-primary">
//                           <div className="flex flex-col items-center gap-1">
//                             <GraduationCap size={20} />
//                             <span className="text-xs font-semibold">Nauczyciel</span>
//                           </div>
//                           <Tabs.Indicator className="bg-primary shadow-[0_0_15px_rgba(0,111,238,0.5)]" />
//                         </Tabs.Tab>
//                       </Tabs.List>
//                     </Tabs.ListContainer>
//                     Panele pełnią tu rolę kontenerów dla pól dynamicznych
//                     <Tabs.Panel id="STUDENT" className="pt-6 animate-in fade-in slide-in-from-right-4">
//                       <Label>Education level</Label>
//                       {/* <Select.Trigger>
//                         <Select.Value />
//                         <Select.Indicator />
//                       </Select.Trigger> */}
//                       <ListBox>
//                         <ListBox.Item id={'high-school'} textValue="high-school">
//                           High school
//                         </ListBox.Item>
//                         <ListBox.Item id={'college'} textValue="college">
//                           College
//                         </ListBox.Item>
//                         <ListBox.Item id={'self-taught'} textValue="self-taught">
//                           Self-taught
//                         </ListBox.Item>
//                       </ListBox>
//                     </Tabs.Panel>
//                     <Tabs.Panel id="TEACHER" className="pt-6 animate-in fade-in slide-in-from-left-4">
//                       <TextField className="flex flex-col gap-4">
//                         <Label>Insitution Name</Label>
//                         <Input
//                           {...register('institutionName')}
//                           variant="primary"
//                           isInvalid={(!!errors as any).institutionName}
//                         />
//                         <FieldError>{errors?.specialization?.message}</FieldError>
//                         <TextField>
//                           <Label>Specialization</Label>
//                           <Input {...register('specialization')} variant="primary" />
//                         </TextField>
//                       </TextField>
//                     </Tabs.Panel>
//                   </Tabs>
//                 )}
//               />
//             </div>
//             <div className="flex flex-col gap-4 border-t border-default-100 pt-6">
//               <Label>How do you know about us ?</Label>
//               <Select
//                 variant="primary"
//                 {...register('referral')}
//                 isInvalid={!!errors.referral}
//                 errorMessage={errors.referral?.message as string}
//               >
//                 <ListBox>
//                   <ListBox.Item id={'university'}>
//                     University
//                     <ListBox.ItemIndicator />
//                   </ListBox.Item>
//                   <ListBox.Item id={'linked-in'}>
//                     Linked In
//                     <ListBox.ItemIndicator />
//                   </ListBox.Item>
//                   <ListBox.Item id={'friend'}>
//                     Friend
//                     <ListBox.ItemIndicator />
//                   </ListBox.Item>
//                   <ListBox.Item id={'other'}>
//                     Other
//                     <ListBox.ItemIndicator />
//                   </ListBox.Item>
//                 </ListBox>
//                 {/* <SelectItem key="linkedin">LinkedIn</SelectItem>
//                 <SelectItem key="university">Uczelnia</SelectItem>
//                 <SelectItem key="friend">Polecenie</SelectItem>
//                 <SelectItem key="other">Inne</SelectItem> */}
//               </Select>

//               <TextArea
//                 {...register('bio')}
//                 variant="primary"
//                 // isInvalid={!!errors.bio}
//                 // errorMessage={errors.bio?.message as string}
//               />
//             </div>

//             <Button type="submit" size="lg" className="font-bold mt-2 shadow-lg">
//               GO TO DASHBOARD
//             </Button>
//           </form>
//         </Card.Content>
//       </Card>
//     </div>
//   );
// }

// export default OnboardingForm;
