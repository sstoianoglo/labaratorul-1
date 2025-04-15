let loginCaptchaAnswer;
let registerCaptchaAnswer;
let isLoggedIn = false;
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    loadNavbar();
    loadMeniu();
    loadFooter();
    loadAuth();
});

function loadTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark', theme === 'dark');
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
}

function loadNavbar() {
    fetch('navbar/navbar.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('navbar').innerHTML = html;
        })
        .catch(error => console.error('Error loading navbar:', error));
}

function loadMeniu() {
    fetch('meniu/meniu.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('meniu').innerHTML = html;
        })
        .catch(error => console.error('Error loading meniu:', error));
}

function loadFooter() {
    fetch('footer/footer.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('footer').innerHTML = html;
        })
        .catch(error => console.error('Error loading footer:', error));
}

function initAuthForm() {
    generateLoginCaptcha();
    const passwordInput = document.getElementById('loginPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePasswordLength);
    }
}

function initRegisterForm() {
    generateRegisterCaptcha();
    const passwordInput = document.getElementById('regPassword');
    const confirmPasswordInput = document.getElementById('regConfirmPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePasswordLength);
    }
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }
}

function generateLoginCaptcha() {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    loginCaptchaAnswer = a + b;
    const captchaElement = document.getElementById('loginCaptchaQuestion');
    if (captchaElement) {
        captchaElement.textContent = `What is ${a} + ${b}?`;
    }
}

function generateRegisterCaptcha() {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    registerCaptchaAnswer = a + b;
    const captchaElement = document.getElementById('registerCaptchaQuestion');
    if (captchaElement) {
        captchaElement.textContent = `What is ${a} + ${b}?`;
    }
}

function loadHome() {
    document.getElementById('form-container').innerHTML = `
        <div class="welcome-message">
            <h2>Welcome to TravelCostMate</h2>
            <p>Please select an option to continue</p>
        </div>
    `;
    updateActiveButton(-1);
    showAuthSection();
}

function loadAuth() {
    fetch('auth/auth.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('form-container').innerHTML = html;
            updateActiveButton(0);
            showAuthSection();
            initAuthForm();
        })
        .catch(error => console.error('Error loading auth:', error));
}

function loadRegister() {
    fetch('register/register.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('form-container').innerHTML = html;
            updateActiveButton(1);
            showAuthSection();
            initRegisterForm();
        })
        .catch(error => console.error('Error loading register:', error));
}

function loadAbout() {
    fetch('about/about.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('form-container').innerHTML = html;
            updateActiveButton(2);
            showAuthSection();
        })
        .catch(error => {
            console.error('Error loading about page:', error);
            document.getElementById('form-container').innerHTML = `
                <div class="about-content">
                    <h1>About TravelCostMate</h1>
                    <p>We are a dedicated travel platform that helps you discover and plan your perfect journey.</p>
                </div>
            `;
            updateActiveButton(2);
            showAuthSection();
        });
}

function loadResetPassword() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('costSection').classList.add('hidden');
    document.getElementById('resetSection').classList.remove('hidden');
    document.getElementById('meniu').classList.add('hidden');
    document.getElementById('userAvatar').classList.add('hidden');
    updateActiveButton(-1);
}

function loadCostEstimator() {
    showCostSection();
}

function updateActiveButton(index) {
    const buttons = document.querySelectorAll('.button-box .toggle-btn');
    buttons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });
}

function showAuthSection() {
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('costSection').classList.add('hidden');
    document.getElementById('resetSection').classList.add('hidden');
    document.getElementById('meniu').classList.remove('hidden');
    document.getElementById('userAvatar').classList.add('hidden');
    updateNavLinks(false);
}

function showCostSection() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('costSection').classList.remove('hidden');
    document.getElementById('resetSection').classList.add('hidden');
    document.getElementById('meniu').classList.add('hidden');
    const avatarImg = document.getElementById('userAvatar');
    if (currentUser?.avatar && avatarImg) {
        avatarImg.src = currentUser.avatar;
        avatarImg.classList.remove('hidden');
    } else {
        avatarImg.classList.add('hidden');
    }
    updateNavLinks(true);
}

function updateNavLinks(loggedIn) {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        if (loggedIn) {
            navLinks.innerHTML = `
                <li><a href="#" onclick="loadCostEstimator()">Cost Estimator</a></li>
                <li><a href="#" onclick="logout()">Logout</a></li>
            `;
        } else {
            navLinks.innerHTML = `
                <li><a href="#" onclick="loadHome()">Home</a></li>
                <li><a href="#" onclick="loadAuth()">Login</a></li>
                <li><a href="#" onclick="loadRegister()">Register</a></li>
                <li><a href="#" onclick="loadAbout()">About</a></li>
            `;
        }
    }
}

function validateLoginForm(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    const captcha = parseInt(document.getElementById('loginCaptchaAnswer')?.value);

    if (!email || !password || isNaN(captcha)) {
        alert('Please fill in all fields!');
        return false;
    }

    if (password.length > 8) {
        alert('Password too long!');
        return false;
    }

    if (captcha !== loginCaptchaAnswer) {
        alert('Wrong CAPTCHA!');
        generateLoginCaptcha();
        document.getElementById('loginCaptchaAnswer').value = '';
        return false;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        alert('Invalid email or password!');
        return false;
    }

    alert(`Welcome back, ${user.firstName}! Login successful!`);
    isLoggedIn = true;
    currentUser = user;
    showCostSection();
    return true;
}

function validateRegisterForm(event) {
    event.preventDefault();
    const firstName = document.getElementById('regFirstName')?.value;
    const lastName = document.getElementById('regLastName')?.value;
    const phone = document.getElementById('regPhone')?.value;
    const email = document.getElementById('regEmail')?.value;
    const avatar = document.getElementById('regAvatar')?.value || '';
    const password = document.getElementById('regPassword')?.value;
    const confirmPassword = document.getElementById('regConfirmPassword')?.value;
    const captcha = parseInt(document.getElementById('registerCaptchaAnswer')?.value);

    if (!firstName || !lastName || !phone || !email || !password || !confirmPassword || isNaN(captcha)) {
        alert('Please fill in all required fields!');
        return false;
    }

    if (password.length > 8) {
        alert('Password too long!');
        return false;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return false;
    }

    if (captcha !== registerCaptchaAnswer) {
        alert('Wrong CAPTCHA!');
        generateRegisterCaptcha();
        document.getElementById('registerCaptchaAnswer').value = '';
        return false;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.email === email)) {
        alert('Email already registered!');
        return false;
    }

    const newUser = { firstName, lastName, phone, email, avatar, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registered successfully! Welcome to the cost estimator.');
    isLoggedIn = true;
    currentUser = newUser;
    showCostSection();
    return true;
}

function resetPassword(event) {
    event.preventDefault();
    const email = document.getElementById('resetEmail')?.value;
    const password = document.getElementById('resetPassword')?.value;
    const confirmPassword = document.getElementById('resetConfirmPassword')?.value;

    if (!email || !password || !confirmPassword) {
        alert('Please fill in all fields!');
        return false;
    }

    if (password.length > 8) {
        alert('Password too long!');
        return false;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return false;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
        alert('Email not found!');
        return false;
    }

    users[userIndex].password = password;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Password reset successful! Please log in.');
    loadAuth();
    return true;
}

function validatePasswordLength(e) {
    if (e.target.value.length > 8) {
        e.target.setCustomValidity('Password must be 8 characters or less');
    } else {
        e.target.setCustomValidity('');
    }
}

function validatePasswordMatch() {
    const password = document.getElementById('regPassword')?.value || document.getElementById('resetPassword')?.value;
    const confirm = document.getElementById('regConfirmPassword')?.value || document.getElementById('resetConfirmPassword')?.value;
    const confirmField = document.getElementById('regConfirmPassword') || document.getElementById('resetConfirmPassword');
    if (confirmField && password && confirm && password !== confirm) {
        confirmField.setCustomValidity('Passwords do not match');
    } else if (confirmField) {
        confirmField.setCustomValidity('');
    }
}

function calculateCost(event) {
    event.preventDefault();

    const destination = document.getElementById('destination').value;
    const duration = parseInt(document.getElementById('duration').value);
    const travelers = parseInt(document.getElementById('travelers').value);
    const accommodation = document.getElementById('accommodation').value;
    const activities = document.getElementById('activities').value;

    const flightCosts = {
        bali: 800,
        paris: 600,
        'new-york': 400,
        tokyo: 700
    };

    const accommodationCosts = {
        budget: 50,
        midrange: 100,
        luxury: 200
    };

    const activitiesCosts = {
        low: 20,
        medium: 50,
        high: 100
    };

    const flightTotal = flightCosts[destination] * travelers;
    const accommodationTotal = accommodationCosts[accommodation] * duration * travelers;
    const activitiesTotal = activitiesCosts[activities] * duration * travelers;
    const totalCost = flightTotal + accommodationTotal + activitiesTotal;

    document.getElementById('flightCost').textContent = `Flights: $${flightTotal.toFixed(2)}`;
    document.getElementById('accommodationCost').textContent = `Accommodation: $${accommodationTotal.toFixed(2)}`;
    document.getElementById('activitiesCost').textContent = `Activities: $${activitiesTotal.toFixed(2)}`;
    document.getElementById('totalCost').textContent = `Total Estimated Cost: $${totalCost.toFixed(2)}`;
    document.getElementById('costBreakdown').style.display = 'block';
    document.getElementById('travelSites').style.display = 'block';

    window.currentEstimate = {
        destination,
        duration,
        travelers,
        accommodation,
        activities,
        flightTotal,
        accommodationTotal,
        activitiesTotal,
        totalCost
    };

    return false;
}

function saveEstimate() {
    if (!window.currentEstimate) {
        alert('No estimate to save!');
        return;
    }

    const estimates = JSON.parse(localStorage.getItem('estimates')) || [];
    estimates.push(window.currentEstimate);
    localStorage.setItem('estimates', JSON.stringify(estimates));
    alert('Estimate saved successfully!');
}

function logout() {
    if (confirm('Are you sure you want to log out?')) {
        isLoggedIn = false;
        currentUser = null;
        loadAuth();
    }
}