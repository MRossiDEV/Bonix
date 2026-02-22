import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { NewMerchantAccountForm } from "./NewMerchantAccountForm";

export default async function NewMerchantAccountPage({
  params,
}: Readonly<{ params: Promise<{ merchantId: string }> }>) {
  const { merchantId: userId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.id !== userId) {
    redirect(`/merchant/${user.id}/list`);
  }

  return <NewMerchantAccountForm userId={user.id} />;
}
