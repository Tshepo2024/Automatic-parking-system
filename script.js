// Simple hash function for demo purposes (use stronger encryption in production)
function hashPassword(password) {
    return btoa(password); // Use base64 encoding as a simple hashing example
}

// Register User Function
function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const carNumber = document.getElementById('car-number').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if the email is already registered
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        document.getElementById('error').textContent = 'Email already registered!';
        return;
    }

    // Register the user with hashed password
    const newUser = {
        name,
        email,
        carNumber,
        password: hashPassword(password),
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! Please login.');
    window.location.href = 'index.html'; // Redirect to login page
}

// Login User Function
function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Find the user by email and hashed password
    const user = users.find(user => user.email === email && user.password === hashPassword(password));
    if (user) {
        // Check if the user has a startTime but hasn't checked out
        if (user.startTime && !user.checkedOut) {
            alert('You have an unfinished session. Please check out first.');
            return;
        }

        // Save the logged-in user in localStorage
        localStorage.setItem('loggedInUser', JSON.stringify(user));

        // Redirect based on whether they have checked in already
        if (user.startTime && !user.checkedOut) {
            window.location.href = 'checkout.html'; // Redirect to checkout if not checked out
        } else {
            window.location.href = 'dashboard.html'; // Redirect to dashboard if no active session
        }
    } else {
        document.getElementById('error').textContent = 'Invalid email or password!';
    }
}

// Load Dashboard Page
function loadDashboardPage() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    // Check if user is logged in, redirect if not
    if (!loggedInUser) {
        window.location.href = 'index.html'; // Redirect to login page
        return;
    }

    // Handle check-in status: redirect to checkout if not checked out
    if (!loggedInUser.startTime && !loggedInUser.checkedOut) {
        window.location.href = 'checkout.html';
        return;
    }

    // Display dashboard information for checked-out user
    document.getElementById('userName').textContent = loggedInUser.name;
    document.getElementById('carNumber').textContent = loggedInUser.carNumber;

    // Display check-in details if available
    if (loggedInUser.startTime) {
        const startTime = new Date(loggedInUser.startTime);
        const currentTime = new Date();
        const duration = ((currentTime - startTime) / (1000 * 60 * 60)).toFixed(2); // Duration in hours
        const totalAmount = (duration * 150).toFixed(2); // Assuming R75/hour rate

        document.getElementById('startTime').textContent = startTime.toLocaleString();
        document.getElementById('duration').textContent = `${duration} hours`;
        document.getElementById('totalAmount').textContent = `R${totalAmount}`;
        document.getElementById('referenceNumber').textContent = loggedInUser.referenceNumber;
    } else {
        // Display a message if the user is checked in but has no start time (unexpected scenario)
        document.getElementById('dashboardMessage').textContent = 'An error occurred. Please check in again.';
    }
}

// Check In Function
function checkIn() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (loggedInUser) {
        // If already checked in, redirect to checkout
        if (loggedInUser.startTime && !loggedInUser.checkedOut) {
            alert('You need to checkout first.');
            window.location.href = 'checkout.html';
            return;
        }

        const startTime = new Date();
        const referenceNumber = generateReferenceNumber(); // Generate a unique reference number
        const ticketNumber = generateTicketNumber(); // Generate a random ticket number

        loggedInUser.startTime = startTime;
        loggedInUser.referenceNumber = referenceNumber;
        loggedInUser.ticketNumber = ticketNumber;
        loggedInUser.checkedOut = false;

        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

        alert(`Check-in successful at ${startTime.toLocaleString()}. Ticket Number: ${ticketNumber}. Reference Number: ${referenceNumber}`);
        window.location.href = 'checkout.html'; // Redirect to checkout
    } else {
        alert('You need to be logged in to check in.');
    }
}

// Checkout User Function
function checkoutUser() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (loggedInUser && loggedInUser.startTime) {
        const startTime = new Date(loggedInUser.startTime);
        const currentTime = new Date();

        // Calculate the duration and total amount
        const durationInMilliseconds = currentTime - startTime;
        const durationInMinutes = Math.floor(durationInMilliseconds / (1000 * 60));
        const durationIn30MinIntervals = Math.ceil(durationInMinutes / 60);
        const ratePer30Minutes = 75; // Assuming a rate of R75 per 30 minutes
        const totalAmount = (durationIn30MinIntervals * ratePer30Minutes).toFixed(2);

        alert(`Checked out! Total duration: ${durationIn30MinIntervals * 30} minutes. Total amount: R${totalAmount}`);

        // Mark the user as checked out
        loggedInUser.checkedOut = true;
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

        window.location.href = 'payment.html'; // Redirect to payment page
    } else {
        alert('You have not checked in yet!');
    }
}

// Generate Random Reference Number
function generateReferenceNumber() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a random reference number
}

// Generate Random Ticket Number
function generateTicketNumber() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let ticketNumber = '';

    for (let i = 0; i < 8; i++) {
        ticketNumber += chars[Math.floor(Math.random() * chars.length)];
    }

    return ticketNumber;
}

// Show Check-in Modal
const checkInModal = document.getElementById('checkInModal');
const closeModalButtons = document.querySelectorAll('.close-modal');

function showCheckInModal(ticketNumber, referenceNumber) {
    checkInModal.style.display = 'block';
    document.getElementById('checkInTicketNumber').textContent = ticketNumber;
    document.getElementById('checkInReferenceNumber').textContent = referenceNumber;
}

// Close modal on button click
closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        checkInModal.style.display = 'none';
    });
});

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('register-form').addEventListener('submit', registerUser);
    document.getElementById('login-form').addEventListener('submit', loginUser);
    document.getElementById('check-in-btn').addEventListener('click', checkIn);
    document.getElementById('checkout-btn').addEventListener('click', checkoutUser);
});
