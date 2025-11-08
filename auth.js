// Initialize localStorage data structure if not exists
function initializeStorage() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('courses')) {
        localStorage.setItem('courses', JSON.stringify([]));
    }
    if (!localStorage.getItem('marks')) {
        localStorage.setItem('marks', JSON.stringify([]));
    }
    if (!localStorage.getItem('attendance')) {
        localStorage.setItem('attendance', JSON.stringify([]));
    }
    if (!localStorage.getItem('content')) {
        localStorage.setItem('content', JSON.stringify([]));
    }
    if (!localStorage.getItem('queries')) {
        localStorage.setItem('queries', JSON.stringify([]));
    }
}

// Initialize on page load
initializeStorage();

// Register functionality
if (document.getElementById('registerForm')) {
    const registerForm = document.getElementById('registerForm');
    const registerUserType = document.getElementById('registerUserType');
    const studentIdGroup = document.getElementById('studentIdGroup');

    // Show/hide student ID field based on user type
    registerUserType.addEventListener('change', function() {
        if (this.value === 'student') {
            studentIdGroup.style.display = 'block';
            document.getElementById('studentId').required = true;
        } else {
            studentIdGroup.style.display = 'none';
            document.getElementById('studentId').required = false;
        }
    });

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const userType = document.getElementById('registerUserType').value;
        const studentId = document.getElementById('studentId').value.trim();

        const errorDiv = document.getElementById('registerError');
        errorDiv.textContent = '';

        // Validation
        if (!name || !email || !password || !userType) {
            errorDiv.textContent = 'Please fill in all required fields.';
            return;
        }

        if (userType === 'student' && !studentId) {
            errorDiv.textContent = 'Student ID is required for students.';
            return;
        }

        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('users'));
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            errorDiv.textContent = 'Email already registered. Please login instead.';
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: password, // In production, hash this password
            userType: userType,
            studentId: userType === 'student' ? studentId : null,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Success message
        errorDiv.textContent = '';
        errorDiv.className = 'success-message';
        errorDiv.textContent = 'Registration successful! Redirecting to login...';

        // Redirect to login after 1.5 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
}

// Login functionality
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const userType = document.getElementById('userType').value;

        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = '';

        // Validation
        if (!email || !password || !userType) {
            errorDiv.textContent = 'Please fill in all fields.';
            return;
        }

        // Check user credentials
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.email === email && u.userType === userType);

        if (!user) {
            errorDiv.textContent = 'User not found. Please check your email and user type.';
            return;
        }

        if (user.password !== password) {
            errorDiv.textContent = 'Incorrect password.';
            return;
        }

        // Store current user session
        const currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            studentId: user.studentId
        };
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Redirect based on user type
        if (userType === 'teacher') {
            window.location.href = 'teacher-dashboard.html';
        } else {
            window.location.href = 'student-dashboard.html';
        }
    });
}

// Check if user is logged in (for dashboard pages)
function checkAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
        return null;
    }
    return JSON.parse(currentUser);
}

// Logout functionality
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

