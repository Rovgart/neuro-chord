export type MaterialType = 'File' | 'Video' | 'Link' | 'Quiz' | 'Image';

export interface MaterialDto {
  id: string;
  topic: string;
  url: string;
  type: MaterialType;
  ownerId: string;
  isPublic: boolean;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface CreateMaterialDto {
  topic: string;
  type: MaterialType;
  url?: string;
  file?: File;
  isPublic: boolean;
  folderId?: string;
}
export type MaterialsListResponse = MaterialDto[];
