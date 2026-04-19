import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/admin-dashboard",
      permanent: true,
    },
  };
};

const LegacyAdminRedirect = () => null;

export default LegacyAdminRedirect;
