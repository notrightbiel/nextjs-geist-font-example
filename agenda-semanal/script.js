// Weekly Schedule Organizer - JavaScript Functionality

// CONFIGURAÇÕES - EDITE AQUI PARA PERSONALIZAR
const CONFIG = {
    // Senha de administrador para adicionar/remover compromissos (ALTERE ESTA SENHA!)
    ADMIN_PASSWORD: 'admin123',
    
    // Senha de visualização para apenas ver horários (ALTERE ESTA SENHA!)
    VIEW_PASSWORD: 'view123',
    
    // Horários de funcionamento (formato 24h)
    WORKING_HOURS: {
        start: '08:00',
        end: '18:00'
    },
    
    // Intervalo entre horários disponíveis (em minutos)
    TIME_INTERVAL: 30,
    
    // Dias da semana que funcionam (true = funciona, false = não funciona)
    WORKING_DAYS: {
        segunda: true,
        terca: true,
        quarta: true,
        quinta: true,
        sexta: true,
        sabado: false,
        domingo: false
    }
};

// Estado da aplicação
let currentMode = 'locked'; // 'locked', 'view', 'admin'

document.addEventListener('DOMContentLoaded', function() {
    // Get form elements with safety checks
    const form = document.getElementById('addCommitmentForm');
    const daySelect = document.getElementById('daySelect');
    const startTimeInput = document.getElementById('startTimeInput');
    const endTimeInput = document.getElementById('endTimeInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const passwordInput = document.getElementById('passwordInput');
    const errorMessage = document.getElementById('errorMessage');

    // Initialize the application
    initializeApp();

    // Form submission handler
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                // Get form values
                const selectedDay = daySelect ? daySelect.value.trim() : '';
                const startTime = startTimeInput ? startTimeInput.value.trim() : '';
                const endTime = endTimeInput ? endTimeInput.value.trim() : '';
                const description = descriptionInput ? descriptionInput.value.trim() : '';
                const password = passwordInput ? passwordInput.value.trim() : '';
                
                // Clear previous error messages
                hideError();
                
                // Check password and set mode
                if (password === CONFIG.ADMIN_PASSWORD) {
                    currentMode = 'admin';
                } else if (password === CONFIG.VIEW_PASSWORD) {
                    currentMode = 'view';
                    showError('Senha de visualização detectada. Você pode apenas visualizar os horários.');
                    updateInterfaceMode();
                    return;
                } else {
                    showError('Senha incorreta!');
                    return;
                }
                
                // Only admin can add commitments
                if (currentMode !== 'admin') {
                    showError('Apenas administradores podem adicionar compromissos!');
                    return;
                }
                
                // Validate inputs
                if (!selectedDay || !startTime || !endTime || !description) {
                    showError('Por favor, preencha todos os campos!');
                    return;
                }
                
                // Validate time formats
                if (!isValidTimeFormat(startTime)) {
                    showError('Por favor, use um formato de horário válido para o início (ex: 09:00, 14:30)');
                    return;
                }
                
                if (!isValidTimeFormat(endTime)) {
                    showError('Por favor, use um formato de horário válido para o término (ex: 09:00, 14:30)');
                    return;
                }
                
                // Validate time logic
                if (compareTime(startTime, endTime) >= 0) {
                    showError('O horário de término deve ser posterior ao horário de início!');
                    return;
                }
                
                // Check if time slot is available
                if (!isTimeSlotAvailable(selectedDay, startTime, endTime)) {
                    showError('Este horário já está ocupado ou conflita com outro compromisso!');
                    return;
                }
                
                // Add commitment to the selected day
                addCommitment(selectedDay, startTime, endTime, description);
                
                // Update available hours
                updateAvailableHours();
                
                // Clear form inputs
                clearForm();
                
                // Show success feedback
                showSuccessFeedback();
                
                // Update interface mode
                updateInterfaceMode();
                
            } catch (error) {
                console.error('Erro ao adicionar compromisso:', error);
                showError('Ocorreu um erro inesperado. Tente novamente.');
            }
        });
    }

    // Function to initialize the application
    function initializeApp() {
        updateAvailableHours();
        updateInterfaceMode();
        addLoginButton();
    }

    // Function to add login button
    function addLoginButton() {
        const header = document.querySelector('header');
        if (!header) return;
        
        const loginBtn = document.createElement('button');
        loginBtn.textContent = '🔐 Fazer Login';
        loginBtn.className = 'login-btn';
        loginBtn.style.cssText = `
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: #74b9ff;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-weight: bold;
        `;
        
        loginBtn.addEventListener('click', showLoginModal);
        header.style.position = 'relative';
        header.appendChild(loginBtn);
    }

    // Function to show login modal
    function showLoginModal() {
        const password = prompt('Digite a senha:\n\n• Senha de administrador: para editar\n• Senha de visualização: apenas para ver horários');
        
        if (password === CONFIG.ADMIN_PASSWORD) {
            currentMode = 'admin';
            alert('✅ Login como ADMINISTRADOR realizado com sucesso!\nVocê pode adicionar e remover compromissos.');
        } else if (password === CONFIG.VIEW_PASSWORD) {
            currentMode = 'view';
            alert('👁️ Login como VISUALIZADOR realizado com sucesso!\nVocê pode apenas visualizar os horários.');
        } else if (password !== null) {
            alert('❌ Senha incorreta!');
            return;
        } else {
            return; // User cancelled
        }
        
        updateInterfaceMode();
    }

    // Function to update interface based on current mode
    function updateInterfaceMode() {
        const formSection = document.querySelector('.add-commitment-section');
        const loginBtn = document.querySelector('.login-btn');
        
        if (formSection) {
            if (currentMode === 'locked') {
                formSection.style.display = 'none';
            } else if (currentMode === 'view') {
                formSection.style.display = 'none';
            } else if (currentMode === 'admin') {
                formSection.style.display = 'block';
            }
        }
        
        if (loginBtn) {
            if (currentMode === 'locked') {
                loginBtn.textContent = '🔐 Fazer Login';
                loginBtn.style.background = '#74b9ff';
                loginBtn.onclick = showLoginModal;
            } else if (currentMode === 'view') {
                loginBtn.textContent = '👁️ Modo Visualização | 🚪 Sair';
                loginBtn.style.background = '#6c5ce7';
                loginBtn.onclick = logout;
            } else if (currentMode === 'admin') {
                loginBtn.textContent = '⚙️ Modo Admin | 🚪 Sair';
                loginBtn.style.background = '#00b894';
                loginBtn.onclick = logout;
            }
        }
        
        // Update remove buttons visibility
        updateRemoveButtonsVisibility();
    }

    // Function to logout
    function logout() {
        currentMode = 'locked';
        clearForm();
        hideError();
        updateInterfaceMode();
        
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.onclick = showLoginModal;
        }
    }

    // Function to update remove buttons visibility
    function updateRemoveButtonsVisibility() {
        const removeButtons = document.querySelectorAll('.remove-btn');
        removeButtons.forEach(btn => {
            btn.style.display = currentMode === 'admin' ? 'block' : 'none';
        });
    }

    // Function to add commitment to a specific day
    function addCommitment(day, startTime, endTime, description) {
        // Find the day container
        const dayContainer = document.querySelector(`[data-day="${day}"]`);
        if (!dayContainer) {
            throw new Error(`Dia não encontrado: ${day}`);
        }
        
        // Get the commitments list for this day
        const commitmentsList = dayContainer.querySelector('.commitments-list');
        if (!commitmentsList) return;
        
        // Create new commitment item
        const commitmentItem = document.createElement('li');
        commitmentItem.className = 'new-commitment';
        commitmentItem.setAttribute('data-start-time', startTime);
        commitmentItem.setAttribute('data-end-time', endTime);
        
        // Create commitment text
        const commitmentText = document.createElement('span');
        commitmentText.className = 'commitment-text';
        commitmentText.textContent = `${startTime} - ${endTime} | ${description}`;
        
        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '×';
        removeBtn.title = 'Remover compromisso (apenas admin)';
        removeBtn.style.display = currentMode === 'admin' ? 'block' : 'none';
        
        // Add remove functionality with password protection
        removeBtn.addEventListener('click', function() {
            if (currentMode !== 'admin') {
                alert('Apenas administradores podem remover compromissos!');
                return;
            }
            
            const confirmPassword = prompt('Digite a senha de administrador para confirmar a remoção:');
            if (confirmPassword === CONFIG.ADMIN_PASSWORD) {
                removeCommitment(commitmentItem);
                updateAvailableHours();
            } else if (confirmPassword !== null) {
                alert('Senha incorreta!');
            }
        });
        
        // Assemble the commitment item
        commitmentItem.appendChild(commitmentText);
        commitmentItem.appendChild(removeBtn);
        
        // Add to the list (sorted by time)
        insertCommitmentSorted(commitmentsList, commitmentItem, startTime);
        
        // Remove animation class after animation completes
        setTimeout(() => {
            commitmentItem.classList.remove('new-commitment');
        }, 300);
    }

    // Function to insert commitment in chronological order
    function insertCommitmentSorted(list, newItem, newStartTime) {
        const existingItems = list.querySelectorAll('li');
        let inserted = false;
        
        for (let item of existingItems) {
            const itemStartTime = item.getAttribute('data-start-time');
            
            if (compareTime(newStartTime, itemStartTime) < 0) {
                list.insertBefore(newItem, item);
                inserted = true;
                break;
            }
        }
        
        if (!inserted) {
            list.appendChild(newItem);
        }
    }

    // Function to compare two time strings
    function compareTime(time1, time2) {
        const [hours1, minutes1] = time1.split(':').map(Number);
        const [hours2, minutes2] = time2.split(':').map(Number);
        
        const totalMinutes1 = hours1 * 60 + minutes1;
        const totalMinutes2 = hours2 * 60 + minutes2;
        
        return totalMinutes1 - totalMinutes2;
    }

    // Function to remove commitment with animation
    function removeCommitment(commitmentItem) {
        // Add fade out animation
        commitmentItem.style.transition = 'all 0.3s ease-out';
        commitmentItem.style.opacity = '0';
        commitmentItem.style.transform = 'translateX(-20px)';
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (commitmentItem.parentNode) {
                commitmentItem.parentNode.removeChild(commitmentItem);
            }
        }, 300);
    }

    // Function to check if time slot is available
    function isTimeSlotAvailable(day, startTime, endTime) {
        const dayContainer = document.querySelector(`[data-day="${day}"]`);
        if (!dayContainer) return false;
        
        const existingCommitments = dayContainer.querySelectorAll('.commitments-list li');
        
        for (let commitment of existingCommitments) {
            const existingStart = commitment.getAttribute('data-start-time');
            const existingEnd = commitment.getAttribute('data-end-time');
            
            // Check for time conflicts
            if (!(compareTime(endTime, existingStart) <= 0 || compareTime(startTime, existingEnd) >= 0)) {
                return false; // Conflict found
            }
        }
        
        return true;
    }

    // Function to generate available time slots
    function generateAvailableSlots(day) {
        if (!CONFIG.WORKING_DAYS[day]) {
            return ['❌ Não funciona neste dia'];
        }
        
        const slots = [];
        const startMinutes = timeToMinutes(CONFIG.WORKING_HOURS.start);
        const endMinutes = timeToMinutes(CONFIG.WORKING_HOURS.end);
        
        for (let minutes = startMinutes; minutes < endMinutes; minutes += CONFIG.TIME_INTERVAL) {
            const timeStr = minutesToTime(minutes);
            const endTimeStr = minutesToTime(minutes + CONFIG.TIME_INTERVAL);
            
            if (isTimeSlotAvailable(day, timeStr, endTimeStr)) {
                slots.push(`✅ ${timeStr} - ${endTimeStr}`);
            } else {
                // Find what's happening at this time
                const activity = getActivityAtTime(day, timeStr, endTimeStr);
                slots.push(`❌ ${timeStr} - ${endTimeStr} | ${activity}`);
            }
        }
        
        return slots.length > 0 ? slots : ['Nenhum horário configurado'];
    }

    // Function to get activity at specific time
    function getActivityAtTime(day, startTime, endTime) {
        const dayContainer = document.querySelector(`[data-day="${day}"]`);
        if (!dayContainer) return 'Ocupado';
        
        const existingCommitments = dayContainer.querySelectorAll('.commitments-list li');
        
        for (let commitment of existingCommitments) {
            const existingStart = commitment.getAttribute('data-start-time');
            const existingEnd = commitment.getAttribute('data-end-time');
            
            // Check if times overlap
            if (!(compareTime(endTime, existingStart) <= 0 || compareTime(startTime, existingEnd) >= 0)) {
                const text = commitment.querySelector('.commitment-text').textContent;
                const description = text.split(' | ')[1] || 'Ocupado';
                return description;
            }
        }
        
        return 'Ocupado';
    }

    // Function to convert time string to minutes
    function timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Function to convert minutes to time string
    function minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    // Function to update available hours display
    function updateAvailableHours() {
        const days = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
        
        days.forEach(day => {
            const container = document.getElementById(`available-${day}`);
            if (container) {
                const slots = generateAvailableSlots(day);
                container.innerHTML = '';
                
                slots.forEach(slot => {
                    const slotElement = document.createElement('div');
                    slotElement.className = slot.includes('❌') 
                        ? 'available-slot unavailable' 
                        : 'available-slot';
                    slotElement.textContent = slot;
                    container.appendChild(slotElement);
                });
            }
        });
    }

    // Function to validate time format
    function isValidTimeFormat(time) {
        // Accept formats like: 9:00, 09:00, 14:30, etc.
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    // Function to show error message
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.add('show');
            
            // Auto-hide error after 5 seconds
            setTimeout(() => {
                hideError();
            }, 5000);
        } else {
            alert(message); // Fallback if errorMessage element doesn't exist
        }
    }

    // Function to hide error message
    function hideError() {
        if (errorMessage) {
            errorMessage.classList.remove('show');
            errorMessage.textContent = '';
        }
    }

    // Function to clear form inputs
    function clearForm() {
        if (daySelect) daySelect.value = '';
        if (startTimeInput) startTimeInput.value = '';
        if (endTimeInput) endTimeInput.value = '';
        if (descriptionInput) descriptionInput.value = '';
        if (passwordInput) passwordInput.value = '';
    }

    // Function to show success feedback
    function showSuccessFeedback() {
        const addBtn = document.querySelector('.add-btn');
        if (!addBtn) return;
        
        const originalText = addBtn.textContent;
        
        addBtn.textContent = '✓ Adicionado!';
        addBtn.style.background = '#00b894';
        
        setTimeout(() => {
            addBtn.textContent = originalText;
            addBtn.style.background = '';
        }, 2000);
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to submit form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && currentMode === 'admin' && form) {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
        
        // Escape to clear form or logout
        if (e.key === 'Escape') {
            if (currentMode !== 'locked') {
                logout();
            } else {
                clearForm();
                hideError();
            }
        }
    });

    // Auto-focus functionality (only in admin mode)
    if (daySelect) {
        daySelect.addEventListener('change', function() {
            if (this.value && currentMode === 'admin' && startTimeInput) {
                startTimeInput.focus();
            }
        });
    }

    if (startTimeInput) {
        startTimeInput.addEventListener('input', function() {
            if (this.value && isValidTimeFormat(this.value) && currentMode === 'admin' && endTimeInput) {
                endTimeInput.focus();
            }
        });

        // Format time input automatically for start time
        startTimeInput.addEventListener('input', function() {
            let value = this.value.replace(/[^\d:]/g, '');
            
            // Auto-add colon after 2 digits
            if (value.length === 2 && !value.includes(':')) {
                value += ':';
            }
            
            // Limit to 5 characters (HH:MM)
            if (value.length > 5) {
                value = value.substring(0, 5);
            }
            
            this.value = value;
        });
    }

    if (endTimeInput) {
        endTimeInput.addEventListener('input', function() {
            if (this.value && isValidTimeFormat(this.value) && currentMode === 'admin' && descriptionInput) {
                descriptionInput.focus();
            }
        });

        // Format time input automatically for end time
        endTimeInput.addEventListener('input', function() {
            let value = this.value.replace(/[^\d:]/g, '');
            
            // Auto-add colon after 2 digits
            if (value.length === 2 && !value.includes(':')) {
                value += ':';
            }
            
            // Limit to 5 characters (HH:MM)
            if (value.length > 5) {
                value = value.substring(0, 5);
            }
            
            this.value = value;
        });
    }

    // Console messages for developers
    console.log('📅 Agenda Semanal carregada com sucesso!');
    console.log('🔐 Sistema de senhas ativo:');
    console.log(`   • Admin: "${CONFIG.ADMIN_PASSWORD}" (pode editar)`);
    console.log(`   • View: "${CONFIG.VIEW_PASSWORD}" (apenas visualizar)`);
    console.log('💡 Altere as senhas na seção CONFIG do código!');
});
