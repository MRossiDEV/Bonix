import PromoForm from "../PromoForm";

export default async function MerchantPromoCreatePage({
  params,
}: Readonly<{ params: Promise<{ merchantId: string }> }>) {
  const { merchantId } = await params;

  return <PromoForm merchantId={merchantId} mode="create" />;
}
