
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/student/Home';
import CoursesList from './pages/student/CoursesList';
import CourseDetails from './pages/student/CourseDetails';
import MyEnrollments from './pages/student/MyEnrollments';
import Player from './pages/student/Player';
import Loading from './pages/student/Loading';

import Educator from './pages/educator/Educator';
import AddCourse from './pages/educator/AddCourse';
import MyCourses from './pages/educator/MyCourses';
import StudentEnrolled from './pages/educator/StudentEnrolled';
import Dashboard from './pages/educator/Dashboard';
import EditCourse from './pages/educator/EditCourse';

import Register from './pages/auth/Register';
import Login from './pages/auth/Login';

import Navbar from './components/student/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';

const App = () => {
  return (
    <div className="text-default min-h-screen">
      <Navbar />

      <Routes>
        {/* Student pages */}
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<CoursesList />} />
        <Route path="/course-list" element={<CoursesList />} />
        <Route path="/course-list/:input" element={<CoursesList />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/my-enrollments" element={<MyEnrollments />} />
        <Route path="/player/:courseId" element={<Player />} />
        <Route path="/loading/:path" element={<Loading />} />

        {/* Authentication pages */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected educator pages */}
        <Route element={<ProtectedRoute allowedRoles={['educator']} />}>
          <Route path="/educator" element={<Educator />}>
            <Route index element={<Dashboard />} />
            <Route path="add-course" element={<AddCourse />} />
            <Route path="my-courses" element={<MyCourses />} />
            <Route path="student-enrolled" element={<StudentEnrolled />} />
            <Route path="edit-course/:id" element={<EditCourse />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default App;
