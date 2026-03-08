import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PoliticianIdRedirect({ params }: PageProps) {
  const { id } = await params;
  redirect(`/dashboard/politicians/${id}`);
}
