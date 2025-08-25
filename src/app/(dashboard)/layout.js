"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "antd";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import useAuthStore from "../../store/authStore";

const { Content } = Layout;

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push("/login");
  //   }
  // }, [isAuthenticated, router]);

  // if (!isAuthenticated || !user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  //     </div>
  //   );
  // }

  return (
    <Layout className="min-h-screen flex">
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout>
        <Header collapsed={collapsed} onCollapse={setCollapsed} />
        <Content className="p-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
}
