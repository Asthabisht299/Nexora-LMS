const STORAGE_KEY = 'nexora_lms_courses'

const demoCourses = [
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design Fundamentals',
    category: 'Design',
    description: 'Learn the fundamentals of user interface and user experience design.',
    price: 1499,
    thumbnail: '',
    level: 'Beginner',
    students: 124,
    lessons: ['Introduction to UI/UX', 'Design Principles'],
    status: 'Published',
  },
  {
    id: 'react-mastery',
    title: 'Complete React Mastery',
    category: 'Development',
    description: 'Build modern web applications using React.',
    price: 1999,
    thumbnail: '',
    level: 'Intermediate',
    students: 256,
    lessons: ['React Basics', 'Components and Props'],
    status: 'Published',
  },
  {
    id: 'data-storytelling',
    title: 'Data Storytelling with Python',
    category: 'Data Science',
    description: 'Learn to communicate insights using data.',
    price: 1799,
    thumbnail: '',
    level: 'Beginner',
    students: 0,
    lessons: ['Introduction to Data', 'Data Visualization'],
    status: 'Draft',
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing Essentials',
    category: 'Marketing',
    description: 'Explore the essentials of digital marketing.',
    price: 999,
    thumbnail: '',
    level: 'Beginner',
    students: 89,
    lessons: ['Marketing Fundamentals', 'Social Media Marketing'],
    status: 'Published',
  },
]

export const getCourses = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored !== null) {
      return JSON.parse(stored)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoCourses))
    return demoCourses
  } catch (error) {
    console.error('Unable to load courses:', error)
    return demoCourses
  }
}

export const saveCourses = (courses) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses))
    return true
  } catch (error) {
    console.error('Unable to save courses:', error)
    return false
  }
}

export const addCourse = (course) => {
  const courses = getCourses()

  const newCourse = {
    ...course,
    id: `course-${Date.now()}`,
    students: 0,
    status: course.status || 'Draft',
  }

  const saved = saveCourses([...courses, newCourse])

  return saved ? newCourse : null
}