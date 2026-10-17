
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../../utils/courseStorage';

const StudentEnrolled = () => {
  const [courses] = useState(() => getCourses());
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');

  // Demo enrollment records for the UI.
  // Replace these with real enrollment records when the backend is added.
  const students = useMemo(() => {
    const demoStudents = [
      {
        id: 1,
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        courseTitle: 'Complete React Mastery',
        status: 'Active',
        joined: '2026-09-15',
      },
      {
        id: 2,
        name: 'Priya Verma',
        email: 'priya@example.com',
        courseTitle: 'UI/UX Design Fundamentals',
        status: 'Active',
        joined: '2026-09-18',
      },
      {
        id: 3,
        name: 'Rahul Gupta',
        email: 'rahul@example.com',
        courseTitle: 'Complete React Mastery',
        status: 'Completed',
        joined: '2026-08-22',
      },
      {
        id: 4,
        name: 'Ananya Singh',
        email: 'ananya@example.com',
        courseTitle: 'Python for Beginners',
        status: 'Active',
        joined: '2026-10-02',
      },
      {
        id: 5,
        name: 'Ishaan Patel',
        email: 'ishaan@example.com',
        courseTitle: 'UI/UX Design Fundamentals',
        status: 'Active',
        joined: '2026-10-05',
      },
    ];

    return demoStudents.map((student) => {
      const matchingCourse = courses.find(
        (course) => course.title === student.courseTitle
      );

      return {
        ...student,
        courseTitle: matchingCourse
          ? matchingCourse.title
          : student.courseTitle,
      };
    });
  }, [courses]);

  const filteredStudents = students.filter((student) => {
    const searchText = String(search ?? '').toLowerCase();

    const matchesSearch =
      student.name.toLowerCase().includes(searchText) ||
      student.email.toLowerCase().includes(searchText) ||
      student.courseTitle.toLowerCase().includes(searchText);

    const matchesCourse =
      courseFilter === 'All' || student.courseTitle === courseFilter;

    return matchesSearch && matchesCourse;
  });

  const activeCount = students.filter(
    (student) => student.status === 'Active'
  ).length;

  const completedCount = students.filter(
    (student) => student.status === 'Completed'
  ).length;

  const stats = [
    { title: 'Total Enrollments', value: students.length, icon: '👨‍🎓' },
    { title: 'Active Students', value: activeCount, icon: '📘' },
    { title: 'Completed Courses', value: completedCount, icon: '🏆' },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Students Enrolled
          </h1>
          <p className="mt-2 text-gray-500">
            View and search student enrollment records.
          </p>
        </div>

        <Link
          to="/educator/my-courses"
          className="rounded-lg border border-gray-300 px-5 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
        >
          View My Courses
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <h2 className="mt-3 text-3xl font-bold text-gray-900">
                  {stat.value}
                </h2>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Enrollment Records
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Search students by name, email, or course.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-violet-500 md:flex-1"
          />

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-violet-500"
          >
            <option value="All">All Courses</option>
            {[...new Set(students.map((student) => student.courseTitle))].map(
              (title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              )
            )}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-gray-200 text-sm text-gray-500">
                <th className="px-4 py-4 font-medium">Student</th>
                <th className="px-4 py-4 font-medium">Course</th>
                <th className="px-4 py-4 font-medium">Enrollment Date</th>
                <th className="px-4 py-4 font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-800">
                        {student.name}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {student.email}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-gray-700">
                      {student.courseTitle}
                    </td>

                    <td className="px-4 py-4 text-gray-600">
                      {new Date(`${student.joined}T00:00:00`).toLocaleDateString(
                        'en-IN',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          student.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-12 text-center text-gray-500"
                  >
                    No students match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Showing {filteredStudents.length} of {students.length} enrollment
          records
        </p>
      </div>
    </div>
  );
};

export default StudentEnrolled;