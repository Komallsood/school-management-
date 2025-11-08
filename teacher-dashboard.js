// Check authentication
const currentUser = checkAuth();
if (!currentUser) {
    // Redirect handled in checkAuth
} else {
    document.getElementById('teacherName').textContent = `Welcome, ${currentUser.name}`;
}

// Navigation functionality
document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.onclick !== logout) {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons and sections
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked button and corresponding section
            this.classList.add('active');
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    }
});

// Helper functions
function getCourses() {
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    return courses.filter(c => c.teacherId === currentUser.id);
}

function getAllCourses() {
    return JSON.parse(localStorage.getItem('courses') || '[]');
}

function getStudents() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter(u => u.userType === 'student');
}

function getMarks() {
    return JSON.parse(localStorage.getItem('marks') || '[]');
}

function getAttendance() {
    return JSON.parse(localStorage.getItem('attendance') || '[]');
}

function getContent() {
    return JSON.parse(localStorage.getItem('content') || '[]');
}

function getQueries() {
    return JSON.parse(localStorage.getItem('queries') || '[]');
}

// Courses Section
const courseForm = document.getElementById('courseForm');
const coursesTableBody = document.getElementById('coursesTableBody');

function loadCourses() {
    const courses = getCourses();
    coursesTableBody.innerHTML = '';
    
    if (courses.length === 0) {
        coursesTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #666;">No courses added yet.</td></tr>';
        return;
    }
    
    courses.forEach(course => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course.code}</td>
            <td>${course.name}</td>
            <td>${course.description || '-'}</td>
            <td>
                <button class="btn btn-danger" onclick="deleteCourse('${course.id}')" style="padding: 5px 10px; font-size: 12px;">Delete</button>
            </td>
        `;
        coursesTableBody.appendChild(row);
    });
    
    // Update course dropdowns in other sections
    updateCourseDropdowns();
}

function updateCourseDropdowns() {
    const courses = getCourses();
    const dropdowns = ['marksCourse', 'progressCourse', 'contentCourse', 'attendanceCourse'];
    
    dropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        const currentValue = dropdown.value;
        dropdown.innerHTML = dropdownId === 'progressCourse' ? '<option value="">All Courses</option>' : '<option value="">Select Course...</option>';
        
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = `${course.code} - ${course.name}`;
            dropdown.appendChild(option);
        });
        
        if (currentValue) {
            dropdown.value = currentValue;
        }
    });
}

courseForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('courseName').value.trim();
    const code = document.getElementById('courseCode').value.trim();
    const description = document.getElementById('courseDescription').value.trim();
    const messageDiv = document.getElementById('courseMessage');
    
    if (!name || !code) {
        messageDiv.textContent = 'Please fill in course name and code.';
        messageDiv.className = 'error-message';
        return;
    }
    
    const courses = getAllCourses();
    const existingCourse = courses.find(c => c.code === code);
    
    if (existingCourse) {
        messageDiv.textContent = 'Course code already exists.';
        messageDiv.className = 'error-message';
        return;
    }
    
    const newCourse = {
        id: Date.now().toString(),
        name: name,
        code: code,
        description: description,
        teacherId: currentUser.id,
        createdAt: new Date().toISOString()
    };
    
    courses.push(newCourse);
    localStorage.setItem('courses', JSON.stringify(courses));
    
    messageDiv.textContent = 'Course added successfully!';
    messageDiv.className = 'success-message';
    
    courseForm.reset();
    loadCourses();
    
    setTimeout(() => {
        messageDiv.textContent = '';
    }, 3000);
});

function deleteCourse(courseId) {
    if (confirm('Are you sure you want to delete this course?')) {
        const courses = getAllCourses();
        const filtered = courses.filter(c => c.id !== courseId);
        localStorage.setItem('courses', JSON.stringify(filtered));
        loadCourses();
    }
}

// Marks Section
const marksForm = document.getElementById('marksForm');
const marksTableBody = document.getElementById('marksTableBody');

function loadStudentsDropdown() {
    const students = getStudents();
    const dropdown = document.getElementById('marksStudent');
    const currentValue = dropdown.value;
    dropdown.innerHTML = '<option value="">Select Student...</option>';
    
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.studentId || student.email})`;
        dropdown.appendChild(option);
    });
    
    if (currentValue) {
        dropdown.value = currentValue;
    }
}

function loadMarks() {
    const marks = getMarks();
    const courses = getAllCourses();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const teacherMarks = marks.filter(m => {
        const course = courses.find(c => c.id === m.courseId);
        return course && course.teacherId === currentUser.id;
    });
    
    marksTableBody.innerHTML = '';
    
    if (teacherMarks.length === 0) {
        marksTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">No marks added yet.</td></tr>';
        return;
    }
    
    teacherMarks.forEach(mark => {
        const course = courses.find(c => c.id === mark.courseId);
        const student = users.find(u => u.id === mark.studentId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student ? student.name : 'Unknown'}</td>
            <td>${course ? course.name : 'Unknown'}</td>
            <td>${mark.type}</td>
            <td>${mark.score}/100</td>
            <td>${new Date(mark.date).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-danger" onclick="deleteMark('${mark.id}')" style="padding: 5px 10px; font-size: 12px;">Delete</button>
            </td>
        `;
        marksTableBody.appendChild(row);
    });
}

marksForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const courseId = document.getElementById('marksCourse').value;
    const studentId = document.getElementById('marksStudent').value;
    const type = document.getElementById('marksType').value;
    const score = parseFloat(document.getElementById('marksScore').value);
    const messageDiv = document.getElementById('marksMessage');
    
    if (!courseId || !studentId || !type || isNaN(score)) {
        messageDiv.textContent = 'Please fill in all fields.';
        messageDiv.className = 'error-message';
        return;
    }
    
    const marks = getMarks();
    const newMark = {
        id: Date.now().toString(),
        courseId: courseId,
        studentId: studentId,
        type: type,
        score: score,
        date: new Date().toISOString()
    };
    
    marks.push(newMark);
    localStorage.setItem('marks', JSON.stringify(marks));
    
    messageDiv.textContent = 'Marks added successfully!';
    messageDiv.className = 'success-message';
    
    marksForm.reset();
    loadMarks();
    
    setTimeout(() => {
        messageDiv.textContent = '';
    }, 3000);
});

function deleteMark(markId) {
    if (confirm('Are you sure you want to delete this mark?')) {
        const marks = getMarks();
        const filtered = marks.filter(m => m.id !== markId);
        localStorage.setItem('marks', JSON.stringify(filtered));
        loadMarks();
    }
}

// Progress Reports Section
const progressTableBody = document.getElementById('progressTableBody');
const progressCourse = document.getElementById('progressCourse');
const progressStudent = document.getElementById('progressStudent');

function loadProgressReports() {
    const marks = getMarks();
    const courses = getAllCourses();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const students = users.filter(u => u.userType === 'student');
    
    // Filter by course and student if selected
    const courseFilter = progressCourse.value;
    const studentFilter = progressStudent.value;
    
    // Get teacher's courses
    const teacherCourses = courses.filter(c => c.teacherId === currentUser.id);
    
    // Calculate progress for each student-course combination
    const progressData = [];
    
    students.forEach(student => {
        if (studentFilter && student.id !== studentFilter) return;
        
        teacherCourses.forEach(course => {
            if (courseFilter && course.id !== courseFilter) return;
            
            const studentMarks = marks.filter(m => 
                m.studentId === student.id && m.courseId === course.id
            );
            
            if (studentMarks.length > 0) {
                const totalScore = studentMarks.reduce((sum, m) => sum + m.score, 0);
                const averageScore = (totalScore / studentMarks.length).toFixed(2);
                
                progressData.push({
                    student: student,
                    course: course,
                    averageScore: parseFloat(averageScore),
                    totalAssessments: studentMarks.length
                });
            }
        });
    });
    
    progressTableBody.innerHTML = '';
    
    if (progressData.length === 0) {
        progressTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666;">No progress data available.</td></tr>';
        return;
    }
    
    progressData.forEach(data => {
        const row = document.createElement('tr');
        const progressPercent = data.averageScore;
        
        row.innerHTML = `
            <td>${data.student.name}</td>
            <td>${data.course.name}</td>
            <td>${data.averageScore}%</td>
            <td>${data.totalAssessments}</td>
            <td>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progressPercent}%">${progressPercent}%</div>
                </div>
            </td>
        `;
        progressTableBody.appendChild(row);
    });
}

function loadProgressStudentsDropdown() {
    const students = getStudents();
    const dropdown = document.getElementById('progressStudent');
    const currentValue = dropdown.value;
    dropdown.innerHTML = '<option value="">All Students</option>';
    
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.studentId || student.email})`;
        dropdown.appendChild(option);
    });
    
    if (currentValue) {
        dropdown.value = currentValue;
    }
}

progressCourse.addEventListener('change', loadProgressReports);
progressStudent.addEventListener('change', loadProgressReports);

// Content Section
const contentForm = document.getElementById('contentForm');
const contentTableBody = document.getElementById('contentTableBody');
const contentFile = document.getElementById('contentFile');
const fileName = document.getElementById('fileName');

contentFile.addEventListener('change', function() {
    if (this.files.length > 0) {
        fileName.textContent = `Selected: ${this.files[0].name}`;
    } else {
        fileName.textContent = '';
    }
});

function loadContent() {
    const content = getContent();
    const courses = getAllCourses();
    const teacherContent = content.filter(c => {
        const course = courses.find(co => co.id === c.courseId);
        return course && course.teacherId === currentUser.id;
    });
    
    contentTableBody.innerHTML = '';
    
    if (teacherContent.length === 0) {
        contentTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">No content uploaded yet.</td></tr>';
        return;
    }
    
    teacherContent.forEach(item => {
        const course = courses.find(c => c.id === item.courseId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course ? course.name : 'Unknown'}</td>
            <td>${item.title}</td>
            <td>${item.description || '-'}</td>
            <td>${item.fileName || 'N/A'}</td>
            <td>${new Date(item.date).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-danger" onclick="deleteContent('${item.id}')" style="padding: 5px 10px; font-size: 12px;">Delete</button>
            </td>
        `;
        contentTableBody.appendChild(row);
    });
}

contentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const courseId = document.getElementById('contentCourse').value;
    const title = document.getElementById('contentTitle').value.trim();
    const description = document.getElementById('contentDescription').value.trim();
    const file = contentFile.files[0];
    const messageDiv = document.getElementById('contentMessage');
    
    if (!courseId || !title) {
        messageDiv.textContent = 'Please fill in course and title.';
        messageDiv.className = 'error-message';
        return;
    }
    
    const content = getContent();
    const newContent = {
        id: Date.now().toString(),
        courseId: courseId,
        title: title,
        description: description,
        fileName: file ? file.name : null,
        fileData: file ? 'file_uploaded' : null, // In real app, would store actual file
        date: new Date().toISOString()
    };
    
    content.push(newContent);
    localStorage.setItem('content', JSON.stringify(content));
    
    messageDiv.textContent = 'Content uploaded successfully!';
    messageDiv.className = 'success-message';
    
    contentForm.reset();
    fileName.textContent = '';
    loadContent();
    
    setTimeout(() => {
        messageDiv.textContent = '';
    }, 3000);
});

function deleteContent(contentId) {
    if (confirm('Are you sure you want to delete this content?')) {
        const content = getContent();
        const filtered = content.filter(c => c.id !== contentId);
        localStorage.setItem('content', JSON.stringify(filtered));
        loadContent();
    }
}

// Attendance Section
const attendanceForm = document.getElementById('attendanceForm');
const attendanceTableBody = document.getElementById('attendanceTableBody');
const studentsCheckboxList = document.getElementById('studentsCheckboxList');
const attendanceCourse = document.getElementById('attendanceCourse');

attendanceCourse.addEventListener('change', function() {
    const courseId = this.value;
    studentsCheckboxList.innerHTML = '';
    
    if (!courseId) {
        studentsCheckboxList.innerHTML = '<p style="color: #666;">Select a course first</p>';
        return;
    }
    
    const students = getStudents();
    
    if (students.length === 0) {
        studentsCheckboxList.innerHTML = '<p style="color: #666;">No students registered yet.</p>';
        return;
    }
    
    students.forEach(student => {
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.marginBottom = '10px';
        label.style.cursor = 'pointer';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = student.id;
        checkbox.name = 'attendanceStudent';
        checkbox.style.marginRight = '10px';
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(`${student.name} (${student.studentId || student.email})`));
        studentsCheckboxList.appendChild(label);
    });
});

function loadAttendance() {
    const attendance = getAttendance();
    const courses = getAllCourses();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const teacherAttendance = attendance.filter(a => {
        const course = courses.find(c => c.id === a.courseId);
        return course && course.teacherId === currentUser.id;
    });
    
    attendanceTableBody.innerHTML = '';
    
    if (teacherAttendance.length === 0) {
        attendanceTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666;">No attendance records yet.</td></tr>';
        return;
    }
    
    teacherAttendance.forEach(record => {
        const course = courses.find(c => c.id === record.courseId);
        const student = users.find(u => u.id === record.studentId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(record.date).toLocaleDateString()}</td>
            <td>${course ? course.name : 'Unknown'}</td>
            <td>${student ? student.name : 'Unknown'}</td>
            <td><span style="color: ${record.status === 'present' ? '#28a745' : '#dc3545'}; font-weight: 600;">${record.status.toUpperCase()}</span></td>
            <td>
                <button class="btn btn-danger" onclick="deleteAttendance('${record.id}')" style="padding: 5px 10px; font-size: 12px;">Delete</button>
            </td>
        `;
        attendanceTableBody.appendChild(row);
    });
}

attendanceForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const courseId = document.getElementById('attendanceCourse').value;
    const date = document.getElementById('attendanceDate').value;
    const checkedStudents = document.querySelectorAll('input[name="attendanceStudent"]:checked');
    const messageDiv = document.getElementById('attendanceMessage');
    
    if (!courseId || !date || checkedStudents.length === 0) {
        messageDiv.textContent = 'Please select course, date, and at least one student.';
        messageDiv.className = 'error-message';
        return;
    }
    
    const attendance = getAttendance();
    const students = getStudents();
    
    // Get all students for this course
    const allStudents = students;
    
    // Mark checked students as present, others as absent
    allStudents.forEach(student => {
        const isPresent = Array.from(checkedStudents).some(cb => cb.value === student.id);
        
        const newRecord = {
            id: `${Date.now()}-${student.id}`,
            courseId: courseId,
            studentId: student.id,
            date: date,
            status: isPresent ? 'present' : 'absent'
        };
        
        attendance.push(newRecord);
    });
    
    localStorage.setItem('attendance', JSON.stringify(attendance));
    
    messageDiv.textContent = 'Attendance saved successfully!';
    messageDiv.className = 'success-message';
    
    attendanceForm.reset();
    studentsCheckboxList.innerHTML = '<p style="color: #666;">Select a course first</p>';
    loadAttendance();
    
    setTimeout(() => {
        messageDiv.textContent = '';
    }, 3000);
});

function deleteAttendance(attendanceId) {
    if (confirm('Are you sure you want to delete this attendance record?')) {
        const attendance = getAttendance();
        const filtered = attendance.filter(a => a.id !== attendanceId);
        localStorage.setItem('attendance', JSON.stringify(filtered));
        loadAttendance();
    }
}

// Queries Section
const queriesList = document.getElementById('queriesList');

function loadQueries() {
    const queries = getQueries();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const courses = getAllCourses();
    
    // Get queries for teacher's courses
    const teacherCourses = courses.filter(c => c.teacherId === currentUser.id);
    const teacherQueries = queries.filter(q => {
        const course = courses.find(c => c.id === q.courseId);
        return course && teacherCourses.some(tc => tc.id === course.id);
    });
    
    queriesList.innerHTML = '';
    
    if (teacherQueries.length === 0) {
        queriesList.innerHTML = '<p style="color: #666;">No queries from students yet.</p>';
        return;
    }
    
    teacherQueries.forEach(query => {
        const student = users.find(u => u.id === query.studentId);
        const course = courses.find(c => c.id === query.courseId);
        
        const queryDiv = document.createElement('div');
        queryDiv.className = 'query-item';
        
        queryDiv.innerHTML = `
            <h4>${query.subject}</h4>
            <div class="query-meta">
                From: ${student ? student.name : 'Unknown'} | 
                Course: ${course ? course.name : 'Unknown'} | 
                Date: ${new Date(query.date).toLocaleDateString()}
            </div>
            <p>${query.message}</p>
            ${query.answer ? `
                <div class="query-answer">
                    <h5>Your Answer:</h5>
                    <p>${query.answer}</p>
                </div>
            ` : `
                <div class="form-group" style="margin-top: 15px;">
                    <label for="answer-${query.id}">Your Answer:</label>
                    <textarea id="answer-${query.id}" rows="3" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;"></textarea>
                    <button class="btn btn-primary" onclick="answerQuery('${query.id}')" style="margin-top: 10px; padding: 8px 16px;">Submit Answer</button>
                </div>
            `}
        `;
        
        queriesList.appendChild(queryDiv);
    });
}

function answerQuery(queryId) {
    const answerText = document.getElementById(`answer-${queryId}`).value.trim();
    
    if (!answerText) {
        alert('Please enter an answer.');
        return;
    }
    
    const queries = getQueries();
    const query = queries.find(q => q.id === queryId);
    
    if (query) {
        query.answer = answerText;
        query.answeredDate = new Date().toISOString();
        localStorage.setItem('queries', JSON.stringify(queries));
        loadQueries();
    }
}

// Initialize on page load
loadCourses();
loadStudentsDropdown();
loadMarks();
loadProgressStudentsDropdown();
loadProgressReports();
loadContent();
loadAttendance();
loadQueries();

