import { redirect } from "next/navigation";

export default async function Home() {
  // Simple redirect - middleware already verified auth
  redirect('/dashboard');
}
