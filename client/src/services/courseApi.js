
const API_URL = 'http://localhost:5000/api/courses';

// Fetch published courses from MongoDB
export async function fetchPublishedCourses() {
  const response = await fetch(API_URL);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to load courses.');
  }

  return result.courses;
}

// Fetch one course by its MongoDB ID
export async function fetchCourseById(courseId) {
  const response = await fetch(
    `${API_URL}/${encodeURIComponent(courseId)}`
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to load course.');
  }

  return result.course;
}

// Fetch courses created by the logged-in educator
export async function fetchMyCourses() {
  const token = localStorage.getItem('nexora_token');

  if (!token) {
    throw new Error('Please log in to continue.');
  }

  const response = await fetch(`${API_URL}/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to load your courses.');
  }

  return result.courses;
}

// Create a course as the logged-in educator
export async function createCourse(courseData) {
  const token = localStorage.getItem('nexora_token');

  if (!token) {
    throw new Error('Please log in to continue.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(courseData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to create course.');
  }

  return result.course;
}

// Update an existing course
export async function updateCourse(courseId, courseData) {
  const token = localStorage.getItem('nexora_token');

  if (!token) {
    throw new Error('Please log in to continue.');
  }

  const response = await fetch(
    `${API_URL}/${encodeURIComponent(courseId)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(courseData),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to update course.');
  }

  return result.course;
}

// Delete a course
export async function deleteCourse(courseId) {
  const token = localStorage.getItem('nexora_token');

  if (!token) {
    throw new Error('Please log in to continue.');
  }

  const response = await fetch(
    `${API_URL}/${encodeURIComponent(courseId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete course.');
  }

  return result;
}
// Enroll the logged-in student in a course
export async function enrollInCourse(courseId) {
  const token = localStorage.getItem('nexora_token');

  if (!token) {
    throw new Error('Please log in before enrolling.');
  }

  const response = await fetch(
    `http://localhost:5000/api/enrollments/${encodeURIComponent(courseId)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Enrollment failed.');
  }

  return result;
}
