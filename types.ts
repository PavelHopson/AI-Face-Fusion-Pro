
export interface ImageFile {
  data: string; // base64 encoded string
  mimeType: string;
  width: number;
  height: number;
}

export type Language = 'en' | 'ru';

export type AssetType = 'face' | 'clothing' | 'shoes' | 'accessories' | 'hairstyle' | 'style';

export type AssetMap = Partial<Record<AssetType, ImageFile>>;
