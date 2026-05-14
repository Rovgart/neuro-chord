import { z } from 'zod';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/mp4',
];

export const materialSchema = z.discriminatedUnion('type', [
  // Wariant: File
  z.object({
    type: z.literal('File'),
    topic: z.string().min(3, 'Topic must have at least 3 characters').max(100),
    file: z
      .custom<File>((val) => val instanceof File, 'You have to choose a file')
      .refine((file) => file.size <= MAX_FILE_SIZE, 'Maximum file size is 50MB')
      .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), 'Supported formats: PDF, DOCX, MP4'),
    isPublic: z.boolean().default(true),
    folderId: z.string().uuid('Invalid folder format').optional().nullable(),
  }),

  // Wariant: Link
  z.object({
    type: z.literal('Link'),
    topic: z.string().min(3, 'Topic must have at least 3 characters').max(100),
    url: z.string().url('Enter a valid URL (e.g., https://...)'),
    isPublic: z.boolean().default(true),
    folderId: z.string().uuid('Invalid folder format').optional().nullable(),
  }),
]);

export type MaterialFormData = z.infer<typeof materialSchema>;
