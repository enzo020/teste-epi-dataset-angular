/** Caixa delimitadora no formato COCO: [x, y, largura, altura], em pixels. */
export type BoundingBox = [x: number, y: number, width: number, height: number];

export interface CocoInfo {
  description: string;
}

export interface CocoImage {
  id: number;
  file_name: string;
  width: number;
  height: number;
}

export interface CocoAnnotation {
  id: number;
  image_id: number;
  category_id: number;
  bbox: BoundingBox;
  area: number;
  iscrowd: number;
}

export interface CocoCategory {
  id: number;
  name: string;
}

export interface CocoDataset {
  info?: CocoInfo;
  images: CocoImage[];
  annotations: CocoAnnotation[];
  categories: CocoCategory[];
}
