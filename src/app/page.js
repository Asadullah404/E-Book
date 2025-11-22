"use client";

import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MainLayout from '@/components/Layout/MainLayout';
import MouseShadow from '@/components/MouseShadow';
import LeftPanel from '@/components/Panels/LeftPanel';
import CenterPanel from '@/components/Panels/CenterPanel';
import RightPanel from '@/components/Panels/RightPanel';
import AddContentModal from '@/components/Modals/AddContentModal';
import useStore from '@/store/useStore';

export default function Home() {
  const { theme } = useStore();

  // Handle Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col">
      <MouseShadow color={theme === 'dark' ? "100, 200, 255" : "10, 100, 200"} intensity={0.5} lag={0.1} />
      <Navbar />
      <MainLayout
        leftContent={<LeftPanel />}
        rightContent={<RightPanel />}
      >
        <CenterPanel />
      </MainLayout>
      <AddContentModal />
    </div>
  );
}
