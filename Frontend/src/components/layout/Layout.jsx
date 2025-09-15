import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import NavandSidebar from './NavandSidebar';
import { DrawerHeader } from './DashboardFrame';

function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className='flex'>
      <NavandSidebar open={open} setOpen={setOpen} />

      <div
        className='p-4 pt-0'
        style={{
          // height: '100vh',
          flexGrow: 1,
        }}
      >
        <DrawerHeader />
        <Outlet context={[open, setOpen]} />
      </div>
    </div>
  );
}

export default Layout;
