import type { GetServerSideProps } from "next";

const AdminLoginPage = () => null;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
};

export default AdminLoginPage;
