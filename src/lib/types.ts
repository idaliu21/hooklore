export interface PatternImage {
  filename: string;
  type: "product_photo" | "crochet_diagram" | "text_diagram" | "symbol_diagram" | "other" | "unclassified";
  thumb: string;
  medium: string;
  full: string;
}

export interface PatternTranslation {
  englishText: string;
  chineseText: string;
  notes: string;
}

export interface Pattern {
  id: number;
  slug: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  createdAt: string;
  productPhotos: PatternImage[];
  diagrams: PatternImage[];
  allImages: PatternImage[];
  patterns: PatternTranslation[];
}

export interface TagInfo {
  slug: string;
  label: string;
  count: number;
}
