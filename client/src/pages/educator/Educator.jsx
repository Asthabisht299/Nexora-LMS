import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const Educator = () => {
  return (
    <div style={{ padding: '30px', minHeight: '70vh', background: '#f8fafc' }}>
      <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '20px' }}>
        Nexora LMS — Educator Panel
      </h1>

      <nav style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '30px' }}>
        <Link to="/educator" style={{ color: '#7c3aed' }}>Dashboard</Link>
        <Link to="/educator/add-course" style={{ color: '#7c3aed' }}>Add Course</Link>
        <Link to="/educator/my-courses" style={{ color: '#7c3aed' }}>My Courses</Link>
      </nav>

      <hr style={{ marginBottom: '25px' }} />

      <Outlet />
    </div>
  );
};

export default Educator;