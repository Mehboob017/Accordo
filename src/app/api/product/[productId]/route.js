import { NextResponse } from 'next/server';
import product from '../product.json';

const getProducts = () => {
  if (Array.isArray(product?.data?.products)) return product.data.products;
  if (Array.isArray(product?.data?.product)) return product.data.product;
  if (Array.isArray(product?.data)) return product.data;
  return [];
};

const collectLookupKeys = (value) => {
  const key = String(value || '').trim();
  if (!key) return [];

  const keys = new Set([key]);
  const numeric = key.match(/(\d+)/)?.[1];

  if (numeric) {
    keys.add(numeric);
    keys.add(`prd-${numeric}`);
  }

  return [...keys];
};

export async function GET(_, { params }) {
  const { productId } = await Promise.resolve(params);
  const products = getProducts();
  const keys = collectLookupKeys(productId);

  const selectedProduct = products.find((item) => {
    const idKeys = [
      String(item?.uid ?? ''),
      String(item?.slug ?? ''),
      String(item?.referenceId ?? ''),
      String(item?.id ?? ''),
      String(item?.uid ?? '').match(/(\d+)/)?.[1] ?? '',
    ];

    return keys.some((lookupKey) => idKeys.includes(lookupKey));
  });

  if (!selectedProduct) {
    return NextResponse.json(
      {
        success: false,
        message: 'Product not found',
        data: null,
      },
      { status: 404 }
    );
  }

  const relatedProducts = products
    .filter(
      (item) =>
        item?.uid !== selectedProduct?.uid &&
        item?.categoryUid &&
        item.categoryUid === selectedProduct.categoryUid
    )
    .slice(0, 4);

  const crossSale = products
    .filter((item) => item?.uid !== selectedProduct?.uid)
    .slice(0, 8)
    .map((item, index) => ({
      uid: `cross-${selectedProduct.uid}-${index + 1}`,
      mainProductUid: selectedProduct.uid,
      crossLinkProductUid: item.uid,
      created_at: item.created_at ?? selectedProduct.created_at ?? null,
      updated_at: item.updated_at ?? selectedProduct.updated_at ?? null,
      crossLinkProduct: item,
    }));

  return NextResponse.json({
    success: true,
    message: 'Product fetched Successfully',
    data: {
      product: selectedProduct,
      relatedProducts,
      crossSale,
    },
  });
}
