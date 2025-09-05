export interface Product {
  id: number;
  slug: string;
  name: string;
  image: Image;
  category: string;
  new: boolean;
  price: number;
  description: string;
  features: string;
  includes: Include[];
  gallery: Gallery;
  others: Other[];
}

interface Other {
  slug: string;
  name: string;
  image: Image;
}

interface Gallery {
  first: Image;
  second: Image;
  third: Image;
}

interface Include {
  quantity: number;
  item: string;
}

interface Image {
  mobile: string;
  tablet: string;
  desktop: string;
}
