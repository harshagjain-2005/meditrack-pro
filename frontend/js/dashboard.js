// Dashboard functionality for medicines and profile
class DashboardManager {
    constructor() {
        this.setupDashboardEventListeners();
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioBlob = null;
        this.isRecording = false;
        this.audioPlayer = null;
    }

    setupDashboardEventListeners() {
        // Add medicine form
        document.getElementById('addMedicineForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddMedicine();
        });

        // Profile form
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUpdateProfile();
        });

        // Export history
        document.getElementById('exportHistoryBtn').addEventListener('click', () => {
            this.exportHistory();
        });

        // Apply history filters
        document.getElementById('applyHistoryFilter').addEventListener('click', () => {
            this.applyHistoryFilters();
        });

        // File upload previews
        document.getElementById('medicinePhotoInput').addEventListener('change', (e) => {
            this.handleMedicinePhotoPreview(e.target.files[0]);
        });

        document.getElementById('profilePhotoInput').addEventListener('change', (e) => {
            this.handleProfilePhotoPreview(e.target.files[0]);
        });

        document.getElementById('voiceFileInput').addEventListener('change', (e) => {
            this.handleVoiceFilePreview(e.target.files[0]);
        });

        // Voice recording setup
        this.setupVoiceRecording();
    }

    setupVoiceRecording() {
        const voiceAlertType = document.getElementById('voiceAlertType');
        const recordingSection = document.getElementById('recordingSection');
        const uploadVoiceSection = document.getElementById('uploadVoiceSection');

        if (voiceAlertType) {
            voiceAlertType.addEventListener('change', () => {
                recordingSection.style.display = 'none';
                uploadVoiceSection.style.display = 'none';
                this.resetRecordingUI();

                if (voiceAlertType.value === 'record') {
                    recordingSection.style.display = 'block';
                } else if (voiceAlertType.value === 'upload') {
                    uploadVoiceSection.style.display = 'block';
                }
            });

            // Recording buttons
            document.getElementById('startRecordingBtn').addEventListener('click', () => {
                this.startRecording();
            });

            document.getElementById('stopRecordingBtn').addEventListener('click', () => {
                this.stopRecording();
            });

            document.getElementById('playRecordingBtn').addEventListener('click', () => {
                this.playRecording();
            });

            document.getElementById('saveRecordingBtn').addEventListener('click', () => {
                this.saveRecording();
            });
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                this.audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(this.audioBlob);
                document.getElementById('audioPlayer').src = audioUrl;
                document.getElementById('recordedAudio').style.display = 'block';
                document.getElementById('playRecordingBtn').disabled = false;
                document.getElementById('saveRecordingBtn').disabled = false;

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            this.mediaRecorder.start();
            this.isRecording = true;

            // Update UI
            document.getElementById('recordingVisualizer').innerHTML = 
                '<i class="fas fa-circle" style="color: red;"></i> Recording... Speak your reminder message now';
            document.getElementById('startRecordingBtn').disabled = true;
            document.getElementById('stopRecordingBtn').disabled = false;

        } catch (error) {
            console.error('Error accessing microphone:', error);
            app.showNotification('Error accessing microphone. Please check permissions.', 'error');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;

            // Update UI
            document.getElementById('recordingVisualizer').innerHTML = 
                '<i class="fas fa-check-circle" style="color: green;"></i> Recording complete!';
            document.getElementById('startRecordingBtn').disabled = false;
            document.getElementById('stopRecordingBtn').disabled = true;
        }
    }

    playRecording() {
        const audioPlayer = document.getElementById('audioPlayer');
        if (audioPlayer.src) {
            audioPlayer.play();
        }
    }

    async saveRecording() {
        if (!this.audioBlob) {
            app.showNotification('No recording to save. Please record a message first.', 'error');
            return;
        }

        try {
            const alertName = document.getElementById('alertName').value || `Voice Alert ${new Date().toLocaleString()}`;
            
            // Convert blob to file
            const audioFile = new File([this.audioBlob], `${alertName}.wav`, { type: 'audio/wav' });
            
            // Create form data
            const formData = new FormData();
            formData.append('voiceFile', audioFile);
            formData.append('alertName', alertName);

            const response = await fetch('/api/voice/upload', {
                method: 'POST',
                headers: {
                    'user-id': app.getCurrentUser().id
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                app.showNotification('Voice alert saved successfully!', 'success');
                this.resetRecordingUI();
            } else {
                app.showNotification(result.message || 'Failed to save voice alert', 'error');
            }

        } catch (error) {
            console.error('Error saving recording:', error);
            app.showNotification('Error saving recording', 'error');
        }
    }

    resetRecordingUI() {
        this.audioBlob = null;
        this.audioChunks = [];
        document.getElementById('recordingVisualizer').innerHTML = 
            '<i class="fas fa-microphone"></i> Click "Start Recording" to record your voice alert';
        document.getElementById('recordedAudio').style.display = 'none';
        document.getElementById('startRecordingBtn').disabled = false;
        document.getElementById('stopRecordingBtn').disabled = true;
        document.getElementById('playRecordingBtn').disabled = true;
        document.getElementById('saveRecordingBtn').disabled = true;
    }

    handleMedicinePhotoPreview(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('medicinePhotoPreview').innerHTML = `
                    <img src="${e.target.result}" alt="Medicine Preview" style="max-width: 200px; max-height: 200px; border-radius: var(--radius);">
                `;
            };
            reader.readAsDataURL(file);
        }
    }

    handleProfilePhotoPreview(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('profilePhotoPreview').innerHTML = `
                    <img src="${e.target.result}" alt="Profile Preview" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">
                `;
            };
            reader.readAsDataURL(file);
        }
    }

    handleVoiceFilePreview(file) {
        if (file) {
            const fileName = document.getElementById('alertName') || document.createElement('input');
            if (!fileName.value) {
                fileName.value = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
            }
            app.showNotification(`Voice file selected: ${file.name}`, 'success');
        }
    }

    async handleAddMedicine() {
        try {
            const formData = new FormData();
            const user = app.getCurrentUser();
            
            // Add basic medicine data
            formData.append('name', document.getElementById('medicineName').value);
            formData.append('dosage', document.getElementById('medicineDosage').value);
            formData.append('time', document.getElementById('medicineTime').value);
            formData.append('frequency', document.getElementById('medicineFrequency').value);
            formData.append('stock', document.getElementById('medicineStock').value || '0');
            formData.append('refill_reminder', document.getElementById('medicineRefill').value || '0');
            formData.append('voice_alert_type', document.getElementById('voiceAlertType').value);
            
            // Add medicine photo if exists
            const medicinePhotoInput = document.getElementById('medicinePhotoInput');
            if (medicinePhotoInput.files[0]) {
                formData.append('medicinePhoto', medicinePhotoInput.files[0]);
            }
            
            // Add voice file if exists
            const voiceFileInput = document.getElementById('voiceFileInput');
            if (voiceFileInput.files[0]) {
                formData.append('voiceFile', voiceFileInput.files[0]);
                formData.append('alertName', document.getElementById('alertName').value || `Voice for ${document.getElementById('medicineName').value}`);
            }

            const response = await fetch('/api/medicines', {
                method: 'POST',
                headers: {
                    'user-id': user.id
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                app.showNotification('Medicine added successfully!', 'success');
                this.resetMedicineForm();
                switchContentSection('dashboard-section');
                app.loadDashboardData(); // Refresh dashboard
            } else {
                app.showNotification(result.message || 'Failed to add medicine', 'error');
            }

        } catch (error) {
            console.error('Error adding medicine:', error);
            app.showNotification('Error adding medicine', 'error');
        }
    }

    resetMedicineForm() {
        document.getElementById('addMedicineForm').reset();
        document.getElementById('medicinePhotoPreview').innerHTML = '<i class="fas fa-pills" style="font-size:48px;color:var(--gray-400);"></i>';
        document.getElementById('recordingSection').style.display = 'none';
        document.getElementById('uploadVoiceSection').style.display = 'none';
        this.resetRecordingUI();
    }

    async handleUpdateProfile() {
        try {
            const formData = new FormData();
            const user = app.getCurrentUser();
            
            formData.append('name', document.getElementById('profileName').value);
            formData.append('age', document.getElementById('profileAge').value);
            formData.append('medical_history', document.getElementById('profileMedicalHistory').value);
            formData.append('guardian_name', document.getElementById('profileGuardianName').value);
            formData.append('guardian_contact', document.getElementById('profileGuardianContact').value);
            
            // Add profile photo if exists
            const profilePhotoInput = document.getElementById('profilePhotoInput');
            if (profilePhotoInput.files[0]) {
                formData.append('profilePhoto', profilePhotoInput.files[0]);
            }

            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'user-id': user.id
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                app.showNotification('Profile updated successfully!', 'success');
                // Update current user data
                app.setCurrentUser(result.user);
                this.loadProfileData();
            } else {
                app.showNotification(result.message || 'Failed to update profile', 'error');
            }

        } catch (error) {
            console.error('Error updating profile:', error);
            app.showNotification('Error updating profile', 'error');
        }
    }

    loadProfileData() {
        const user = app.getCurrentUser();
        if (user) {
            document.getElementById('profileName').value = user.name || '';
            document.getElementById('profileEmail').value = user.email || '';
            document.getElementById('profileAge').value = user.age || '';
            document.getElementById('profileMedicalHistory').value = user.medical_history || '';
            document.getElementById('profileGuardianName').value = user.guardian_name || '';
            document.getElementById('profileGuardianContact').value = user.guardian_contact || '';
            
            // Load profile photo if exists
            if (user.profile_photo) {
                document.getElementById('profilePhotoPreview').innerHTML = `
                    <img src="/uploads/profile-photos/${user.profile_photo}" alt="Profile Photo" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">
                `;
            } else {
                document.getElementById('profilePhotoPreview').innerHTML = `
                    <i class="fas fa-user" style="font-size:48px;color:var(--gray-400);"></i>
                `;
            }
        }
    }

    async exportHistory() {
        try {
            const user = app.getCurrentUser();
            const response = await fetch('/api/export/history', {
                headers: {
                    'user-id': user.id
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'meditrack-history.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                app.showNotification('History exported successfully!', 'success');
            } else {
                const error = await response.json();
                app.showNotification(error.message || 'Failed to export history', 'error');
            }
        } catch (error) {
            console.error('Error exporting history:', error);
            app.showNotification('Error exporting history', 'error');
        }
    }

    applyHistoryFilters() {
        const statusFilter = document.getElementById('historyStatusFilter').value;
        const dateFilter = document.getElementById('historyDateFilter').value;
        
        const historyItems = document.querySelectorAll('.history-item');
        
        historyItems.forEach(item => {
            let showItem = true;
            
            // Status filter
            if (statusFilter && statusFilter !== 'all') {
                const itemStatus = item.getAttribute('data-status');
                if (itemStatus !== statusFilter) {
                    showItem = false;
                }
            }
            
            // Date filter (simplified - would need more complex date handling)
            if (dateFilter && showItem) {
                const itemDate = item.getAttribute('data-date');
                if (itemDate !== dateFilter) {
                    showItem = false;
                }
            }
            
            item.style.display = showItem ? 'block' : 'none';
        });
    }
}

// Initialize dashboard manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.dashboardManager = new DashboardManager();
});

// Global functions for UI interactions
function switchContentSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Load section-specific data
    if (sectionId === 'profile-section') {
        dashboardManager.loadProfileData();
    } else if (sectionId === 'history-section') {
        app.loadHistory();
    } else if (sectionId === 'dashboard-section') {
        app.loadDashboardData();
    }
}

function markMedicineAsTaken(medicineId) {
    const notes = prompt('Add any notes (optional):');
    app.markMedicineAsTaken(medicineId, notes || '');
}

function rescheduleMedicine(medicineId) {
    const minutes = prompt('Remind again in how many minutes?', '15');
    if (minutes && !isNaN(minutes)) {
        app.rescheduleMedicine(medicineId, parseInt(minutes));
    }
}

function deleteMedicine(medicineId) {
    if (confirm('Are you sure you want to delete this medicine?')) {
        app.deleteMedicine(medicineId);
    }
}

function showMedicineDetails(medicineId) {
    // Implementation for showing medicine details modal
    console.log('Show details for medicine:', medicineId);
}

function clearReminder(medicineId) {
    app.clearReminder(medicineId);
}