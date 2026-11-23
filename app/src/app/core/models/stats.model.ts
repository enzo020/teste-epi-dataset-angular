export interface CategoryStat {
  id: number;
  name: string;
  color: string;
  count: number;
}

export interface DatasetStats {
  totalImages: number;
  totalAnnotations: number;
  averagePerImage: number;
  byCategory: CategoryStat[];
}
