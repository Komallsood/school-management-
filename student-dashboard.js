// Check authentication
const currentUser = checkAuth();
if (!currentUser) {
    // Redirect handled in checkAuth
} else {
    document.getElementById('studentName').textContent = `Welcome, ${currentUser.name}`;
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
function getAllCourses() {
    return JSON.parse(localStorage.getItem('courses') || '[]');
}

function getStudentCourses() {
    const courses = getAllCourses();
    // In a real system, students would be enrolled in courses
    // For now, we'll show all courses
    return courses;
}

function getMarks() {
    const marks = JSON.parse(localStorage.getItem('marks') || '[]');
    return marks.filter(m => m.studentId === currentUser.id);
}

function getAttendance() {
    const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
    return attendance.filter(a => a.studentId === currentUser.id);
}

function getContent() {
    return JSON.parse(localStorage.getItem('content') || '[]');
}

function getQueries() {
    return JSON.parse(localStorage.getItem('queries') || '[]');
}

function getStudentQueries() {
    const queries = getQueries();
    return queries.filter(q => q.studentId === currentUser.id);
}

// Update course dropdowns
function updateCourseDropdowns() {
    const courses = getStudentCourses();
    const dropdowns = ['marksFilterCourse', 'attendanceFilterCourse', 'contentFilterCourse', 'queryCourse'];
    
    dropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        const currentValue = dropdown.value;
        dropdown.innerHTML = dropdownId === 'queryCourse' ? '<option value="">Select Course...</option>' : '<option value="">All Courses</option>';
        
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

// Overview Section
function loadOverview() {
    const courses = getStudentCourses();
    const marks = getMarks();
    const attendance = getAttendance();
    const queries = getStudentQueries();
    
    // Update stats
    document.getElementById('totalCourses').textContent = courses.length;
    
    if (marks.length > 0) {
        const totalScore = marks.reduce((sum, m) => sum + m.score, 0);
        const average = (totalScore / marks.length).toFixed(1);
        document.getElementById('averageMarks').textContent = `${average}%`;
    } else {
        document.getElementById('averageMarks').textContent = '0%';
    }
    
    if (attendance.length > 0) {
        const presentCount = attendance.filter(a => a.status === 'present').length;
        const attendancePercent = ((presentCount / attendance.length) * 100).toFixed(1);
        document.getElementById('attendancePercent').textContent = `${attendancePercent}%`;
    } else {
        document.getElementById('attendancePercent').textContent = '0%';
    }
    
    const pendingQueries = queries.filter(q => !q.answer).length;
    document.getElementById('pendingQueries').textContent = pendingQueries;
    
    // Load recent marks
    const recentMarks = marks.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    const recentMarksTableBody = document.getElementById('recentMarksTableBody');
    const coursesData = getAllCourses();
    
    recentMarksTableBody.innerHTML = '';
    
    if (recentMarks.length === 0) {
        recentMarksTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #666;">No marks available yet.</td></tr>';
        return;
    }
    
    recentMarks.forEach(mark => {
        const course = coursesData.find(c => c.id === mark.courseId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course ? course.name : 'Unknown'}</td>
            <td>${mark.type}</td>
            <td>${mark.score}/100</td>
            <td>${new Date(mark.date).toLocaleDateString()}</td>
        `;
        recentMarksTableBody.appendChild(row);
    });
}

// Marks Section
const marksFilterCourse = document.getElementById('marksFilterCourse');
const marksTableBody = document.getElementById('marksTableBody');

function getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
}

function loadMarks() {
    const marks = getMarks();
    const courses = getAllCourses();
    const courseFilter = marksFilterCourse.value;
    
    let filteredMarks = marks;
    if (courseFilter) {
        filteredMarks = marks.filter(m => m.courseId === courseFilter);
    }
    
    marksTableBody.innerHTML = '';
    
    if (filteredMarks.length === 0) {
        marksTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666;">No marks available yet.</td></tr>';
        return;
    }
    
    // Sort by date (newest first)
    filteredMarks.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    filteredMarks.forEach(mark => {
        const course = courses.find(c => c.id === mark.courseId);
        const grade = getGrade(mark.score);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course ? course.name : 'Unknown'}</td>
            <td>${mark.type}</td>
            <td>${mark.score}/100</td>
            <td><strong>${grade}</strong></td>
            <td>${new Date(mark.date).toLocaleDateString()}</td>
        `;
        marksTableBody.appendChild(row);
    });
}

marksFilterCourse.addEventListener('change', loadMarks);

// Progress Section
const progressTableBody = document.getElementById('progressTableBody');

function loadProgress() {
    const marks = getMarks();
    const courses = getAllCourses();
    const studentCourses = getStudentCourses();
    
    // Calculate progress for each course
    const progressData = [];
    
    studentCourses.forEach(course => {
        const courseMarks = marks.filter(m => m.courseId === course.id);
        
        if (courseMarks.length > 0) {
            const totalScore = courseMarks.reduce((sum, m) => sum + m.score, 0);
            const averageScore = (totalScore / courseMarks.length).toFixed(2);
            
            progressData.push({
                course: course,
                averageScore: parseFloat(averageScore),
                totalAssessments: courseMarks.length
            });
        }
    });
    
    progressTableBody.innerHTML = '';
    
    if (progressData.length === 0) {
        progressTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #666;">No progress data available yet.</td></tr>';
        return;
    }
    
    progressData.forEach(data => {
        const row = document.createElement('tr');
        const progressPercent = data.averageScore;
        
        row.innerHTML = `
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

// Attendance Section
const attendanceFilterCourse = document.getElementById('attendanceFilterCourse');
const attendanceTableBody = document.getElementById('attendanceTableBody');
const attendanceSummary = document.getElementById('attendanceSummary');

function loadAttendance() {
    const attendance = getAttendance();
    const courses = getAllCourses();
    const courseFilter = attendanceFilterCourse.value;
    
    let filteredAttendance = attendance;
    if (courseFilter) {
        filteredAttendance = attendance.filter(a => a.courseId === courseFilter);
    }
    
    attendanceTableBody.innerHTML = '';
    
    if (filteredAttendance.length === 0) {
        attendanceTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #666;">No attendance records yet.</td></tr>';
        loadAttendanceSummary();
        return;
    }
    
    // Sort by date (newest first)
    filteredAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    filteredAttendance.forEach(record => {
        const course = courses.find(c => c.id === record.courseId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(record.date).toLocaleDateString()}</td>
            <td>${course ? course.name : 'Unknown'}</td>
            <td><span style="color: ${record.status === 'present' ? '#28a745' : '#dc3545'}; font-weight: 600;">${record.status.toUpperCase()}</span></td>
        `;
        attendanceTableBody.appendChild(row);
    });
    
    loadAttendanceSummary();
}

function loadAttendanceSummary() {
    const attendance = getAttendance();
    const courses = getAllCourses();
    const studentCourses = getStudentCourses();
    
    attendanceSummary.innerHTML = '';
    
    if (attendance.length === 0) {
        attendanceSummary.innerHTML = '<p style="color: #666;">No attendance data available.</p>';
        return;
    }
    
    studentCourses.forEach(course => {
        const courseAttendance = attendance.filter(a => a.courseId === course.id);
        
        if (courseAttendance.length > 0) {
            const presentCount = courseAttendance.filter(a => a.status === 'present').length;
            const attendancePercent = ((presentCount / courseAttendance.length) * 100).toFixed(1);
            
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${course.name}</h3>
                <p><strong>Present:</strong> ${presentCount} / ${courseAttendance.length}</p>
                <p><strong>Attendance Rate:</strong> ${attendancePercent}%</p>
                <div class="progress-bar-container" style="margin-top: 10px;">
                    <div class="progress-bar" style="width: ${attendancePercent}%">${attendancePercent}%</div>
                </div>
            `;
            attendanceSummary.appendChild(card);
        }
    });
    
    if (attendanceSummary.innerHTML === '') {
        attendanceSummary.innerHTML = '<p style="color: #666;">No attendance data available.</p>';
    }
}

attendanceFilterCourse.addEventListener('change', loadAttendance);

// Content Section
const contentFilterCourse = document.getElementById('contentFilterCourse');
const contentCards = document.getElementById('contentCards');

function loadContent() {
    const content = getContent();
    const courses = getAllCourses();
    const courseFilter = contentFilterCourse.value;
    
    let filteredContent = content;
    if (courseFilter) {
        filteredContent = content.filter(c => c.courseId === courseFilter);
    }
    
    contentCards.innerHTML = '';
    
    if (filteredContent.length === 0) {
        contentCards.innerHTML = '<p style="color: #666; grid-column: 1 / -1;">No content available yet.</p>';
        return;
    }
    
    // Sort by date (newest first)
    filteredContent.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    filteredContent.forEach(item => {
        const course = courses.find(c => c.id === item.courseId);
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${item.title}</h3>
            <p><strong>Course:</strong> ${course ? course.name : 'Unknown'}</p>
            <p>${item.description || 'No description'}</p>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">
                ${item.fileName ? `File: ${item.fileName}` : 'No file attached'} | 
                ${new Date(item.date).toLocaleDateString()}
            </p>
        `;
        contentCards.appendChild(card);
    });
}

contentFilterCourse.addEventListener('change', loadContent);

// Queries Section
const queryForm = document.getElementById('queryForm');
const myQueriesList = document.getElementById('myQueriesList');

function loadMyQueries() {
    const queries = getStudentQueries();
    const courses = getAllCourses();
    
    myQueriesList.innerHTML = '';
    
    if (queries.length === 0) {
        myQueriesList.innerHTML = '<p style="color: #666;">You haven\'t submitted any queries yet.</p>';
        return;
    }
    
    // Sort by date (newest first)
    queries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    queries.forEach(query => {
        const course = courses.find(c => c.id === query.courseId);
        
        const queryDiv = document.createElement('div');
        queryDiv.className = 'query-item';
        
        queryDiv.innerHTML = `
            <h4>${query.subject}</h4>
            <div class="query-meta">
                Course: ${course ? course.name : 'Unknown'} | 
                Date: ${new Date(query.date).toLocaleDateString()} |
                Status: ${query.answer ? '<span style="color: #28a745;">Answered</span>' : '<span style="color: #ffc107;">Pending</span>'}
            </div>
            <p><strong>Your Query:</strong> ${query.message}</p>
            ${query.answer ? `
                <div class="query-answer">
                    <h5>Teacher's Answer:</h5>
                    <p>${query.answer}</p>
                    <p style="font-size: 12px; color: #999; margin-top: 5px;">
                        Answered on: ${new Date(query.answeredDate).toLocaleDateString()}
                    </p>
                </div>
            ` : '<p style="color: #999; font-style: italic;">Waiting for teacher\'s response...</p>'}
        `;
        
        myQueriesList.appendChild(queryDiv);
    });
}

queryForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const courseId = document.getElementById('queryCourse').value;
    const subject = document.getElementById('querySubject').value.trim();
    const message = document.getElementById('queryMessage').value.trim();
    const messageDiv = document.getElementById('queryStatusMessage');
    
    if (!courseId || !subject || !message) {
        messageDiv.textContent = 'Please fill in all fields.';
        messageDiv.className = 'error-message';
        return;
    }
    
    const queries = getQueries();
    const newQuery = {
        id: Date.now().toString(),
        studentId: currentUser.id,
        courseId: courseId,
        subject: subject,
        message: message,
        date: new Date().toISOString(),
        answer: null,
        answeredDate: null
    };
    
    queries.push(newQuery);
    localStorage.setItem('queries', JSON.stringify(queries));
    
    messageDiv.textContent = 'Query submitted successfully!';
    messageDiv.className = 'success-message';
    
    queryForm.reset();
    loadMyQueries();
    loadOverview(); // Update pending queries count
    
    setTimeout(() => {
        messageDiv.textContent = '';
    }, 3000);
});

// Initialize on page load
updateCourseDropdowns();
loadOverview();
loadMarks();
loadProgress();
loadAttendance();
loadContent();
loadMyQueries();

