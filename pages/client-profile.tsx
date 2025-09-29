import dynamic from "next/dynamic";

const ProfileEditor = dynamic(() => import("@/components/ProfileEditor"), { ssr: false });

export default function ClientProfilePage() {
  return <ProfileEditor userType="clients" />;
}
