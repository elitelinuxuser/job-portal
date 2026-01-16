import { redirect } from "next/navigation";

export default async function CompanyJobRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/jobs/${id}`);
}
