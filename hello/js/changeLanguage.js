document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.querySelector('.language-toggle');
    const dropdown = document.querySelector('.language-dropdown');
    
    toggleButton.addEventListener('click', () => {
        dropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!toggleButton.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('active');
        }
    });
});