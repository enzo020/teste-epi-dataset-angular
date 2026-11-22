import { CocoImage } from './coco.models';

/** Imagem do dataset já combinada com o que a galeria precisa exibir. */
export interface GalleryItem {
  image: CocoImage;
  url: string;
  annotationCount: number;
}