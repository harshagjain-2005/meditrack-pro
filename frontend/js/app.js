// Dashboard functionality for medicines and profile
class DashboardManager {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioBlob = null;
        this.isRecording = false;
        this.voiceAlertId = null;
        this.editingMedicineId = null;
        this.setupDashboardEventListeners();
    }

    setupDashboardEventListeners() {
        // Add medicine form
        const addMedicineForm = document.getElementById('addMedicineForm');
        if (addMedicineForm) {
            addMedicineForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddMedicine();
            });
        }

        // Edit medicine form
        const editMedicineForm = document.getElementById('editMedicineForm');
        if (editMedicineForm) {
            editMedicineForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpdateMedicine();
            });
        }

        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpdateProfile();
            });
        }

        // Export history
        const exportBtn = document.getElementById('exportHistoryBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportHistory();
            });
        }

        // File upload previews
        const medicinePhotoInput = document.getElementById('medicinePhotoInput');
        if (medicinePhotoInput) {
            medicinePhotoInput.addEventListener('change', (e) => {
                this.handleMedicinePhotoPreview(e.target.files[0]);
            });
        }

        const editMedicinePhotoInput = document.getElementById('editMedicinePhotoInput');
        if (editMedicinePhotoInput) {
            editMedicinePhotoInput.addEventListener('change', (e) => {
                this.handleEditMedicinePhotoPreview(e.target.files[0]);
            });
        }

        const profilePhotoInput = document.getElementById('profilePhotoInput');
        if (profilePhotoInput) {
            profilePhotoInput.addEventListener('change', (e) => {
                this.handleProfilePhotoPreview(e.target.files[0]);
            });
        }

        const voiceFileInput = document.getElementById('voiceFileInput');
        if (voiceFileInput) {
            voiceFileInput.addEventListener('change', (e) => {
                this.handleVoiceFilePreview(e.target.files[0]);
            });
        }

        const editVoiceFileInput = document.getElementById('editVoiceFileInput');
        if (editVoiceFileInput) {
            editVoiceFileInput.addEventListener('change', (e) => {
                this.handleEditVoiceFilePreview(e.target.files[0]);
            });
        }

        // Voice recording setup
        this.setupVoiceRecording();
        this.setupEditVoiceRecording();
    }

    setupVoiceRecording() {
        const voiceAlertType = document.getElementById('voiceAlertType');
        const recordingSection = document.getElementById('recordingSection');
        const uploadVoiceSection = document.getElementById('uploadVoiceSection');

        if (voiceAlertType) {
            voiceAlertType.addEventListener('change', () => {
                if (recordingSection) recordingSection.style.display = 'none';
                if (uploadVoiceSection) uploadVoiceSection.style.display = 'none';
                this.resetRecordingUI();

                if (voiceAlertType.value === 'record') {
                    if (recordingSection) recordingSection.style.display = 'block';
                } else if (voiceAlertType.value === 'upload') {
                    if (uploadVoiceSection) uploadVoiceSection.style.display = 'block';
                }
            });

            // Recording buttons
            const startBtn = document.getElementById('startRecordingBtn');
            const stopBtn = document.getElementById('stopRecordingBtn');
            const playBtn = document.getElementById('playRecordingBtn');
            const saveBtn = document.getElementById('saveRecordingBtn');

            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    this.startRecording();
                });
            }

            if (stopBtn) {
                stopBtn.addEventListener('click', () => {
                    this.stopRecording();
                });
            }

            if (playBtn) {
                playBtn.addEventListener('click', () => {
                    this.playRecording();
                });
            }

            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    this.saveRecording();
                });
            }
        }
    }

    setupEditVoiceRecording() {
        const editVoiceAlertType = document.getElementById('editVoiceAlertType');
        const editRecordingSection = document.getElementById('editRecordingSection');
        const editUploadVoiceSection = document.getElementById('editUploadVoiceSection');

        if (editVoiceAlertType) {
            editVoiceAlertType.addEventListener('change', () => {
                if (editRecordingSection) editRecordingSection.style.display = 'none';
                if (editUploadVoiceSection) editUploadVoiceSection.style.display = 'none';
                this.resetEditRecordingUI();

                if (editVoiceAlertType.value === 'record') {
                    if (editRecordingSection) editRecordingSection.style.display = 'block';
                } else if (editVoiceAlertType.value === 'upload') {
                    if (editUploadVoiceSection) editUploadVoiceSection.style.display = 'block';
                }
            });

            // Edit recording buttons
            const editStartBtn = document.getElementById('editStartRecordingBtn');
            const editStopBtn = document.getElementById('editStopRecordingBtn');
            const editPlayBtn = document.getElementById('editPlayRecordingBtn');
            const editSaveBtn = document.getElementById('editSaveRecordingBtn');

            if (editStartBtn) {
                editStartBtn.addEventListener('click', () => {
                    this.startEditRecording();
                });
            }

            if (editStopBtn) {
                editStopBtn.addEventListener('click', () => {
                    this.stopEditRecording();
                });
            }

            if (editPlayBtn) {
                editPlayBtn.addEventListener('click', () => {
                    this.playEditRecording();
                });
            }

            if (editSaveBtn) {
                editSaveBtn.addEventListener('click', () => {
                    this.saveEditRecording();
                });
            }
        }
    }

    // Recording methods for add medicine
    async startRecording() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                app.showNotification('Your browser does not support audio recording', 'error');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                } 
            });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.audioBlob = new Blob(this.audioChunks, { 
                    type: 'audio/wav' 
                });
                
                const audioUrl = URL.createObjectURL(this.audioBlob);
                const audioPlayer = document.getElementById('audioPlayer');
                if (audioPlayer) {
                    audioPlayer.src = audioUrl;
                }
                
                const recordedAudio = document.getElementById('recordedAudio');
                if (recordedAudio) {
                    recordedAudio.style.display = 'block';
                }
                
                document.getElementById('playRecordingBtn').disabled = false;
                document.getElementById('saveRecordingBtn').disabled = false;

                stream.getTracks().forEach(track => track.stop());
            };

            this.mediaRecorder.start();
            this.isRecording = true;

            const visualizer = document.getElementById('recordingVisualizer');
            if (visualizer) {
                visualizer.innerHTML = 
                    '<i class="fas fa-circle" style="color: red; animation: blink 1s infinite;"></i> Recording... Speak your reminder message now';
            }
            
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

            const visualizer = document.getElementById('recordingVisualizer');
            if (visualizer) {
                visualizer.innerHTML = 
                    '<i class="fas fa-check-circle" style="color: green;"></i> Recording complete!';
            }
            
            document.getElementById('startRecordingBtn').disabled = false;
            document.getElementById('stopRecordingBtn').disabled = true;
        }
    }

    playRecording() {
        const audioPlayer = document.getElementById('audioPlayer');
        if (audioPlayer && audioPlayer.src) {
            audioPlayer.play();
        }
    }

    async saveRecording() {
        if (!this.audioBlob) {
            app.showNotification('No recording to save. Please record a message first.', 'error');
            return;
        }

        try {
            const user = app.getCurrentUser();
            if (!user) {
                app.showNotification('Please login first', 'error');
                return;
            }

            const alertName = document.getElementById('alertName')?.value || `Voice Alert ${new Date().toLocaleString()}`;
            
            const formData = new FormData();
            formData.append('voiceFile', this.audioBlob, `${alertName}.wav`);
            formData.append('alertName', alertName);

            const response = await fetch('/api/voice/upload', {
                method: 'POST',
                headers: {
                    'user-id': user.id
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                app.showNotification('Voice alert saved successfully!', 'success');
                this.voiceAlertId = result.voiceAlert.id;
                this.resetRecordingUI();
                
                document.getElementById('voiceAlertType').value = 'record';
                
            } else {
                app.showNotification(result.message || 'Failed to save voice alert', 'error');
            }

        } catch (error) {
            console.error('Error saving recording:', error);
            app.showNotification('Error saving recording. Please try again.', 'error');
        }
    }

    resetRecordingUI() {
        this.audioBlob = null;
        this.audioChunks = [];
        const visualizer = document.getElementById('recordingVisualizer');
        if (visualizer) {
            visualizer.innerHTML = 
                '<i class="fas fa-microphone"></i> Click "Start Recording" to record your voice alert';
        }
        
        const recordedAudio = document.getElementById('recordedAudio');
        if (recordedAudio) {
            recordedAudio.style.display = 'none';
        }
        
        document.getElementById('startRecordingBtn').disabled = false;
        document.getElementById('stopRecordingBtn').disabled = true;
        document.getElementById('playRecordingBtn').disabled = true;
        document.getElementById('saveRecordingBtn').disabled = true;
    }

    // Recording methods for edit medicine
    async startEditRecording() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                app.showNotification('Your browser does not support audio recording', 'error');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                } 
            });
            
            this.editMediaRecorder = new MediaRecorder(stream);
            this.editAudioChunks = [];

            this.editMediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.editAudioChunks.push(event.data);
                }
            };

            this.editMediaRecorder.onstop = () => {
                this.editAudioBlob = new Blob(this.editAudioChunks, { 
                    type: 'audio/wav' 
                });
                
                const audioUrl = URL.createObjectURL(this.editAudioBlob);
                const audioPlayer = document.getElementById('editAudioPlayer');
                if (audioPlayer) {
                    audioPlayer.src = audioUrl;
                }
                
                const recordedAudio = document.getElementById('editRecordedAudio');
                if (recordedAudio) {
                    recordedAudio.style.display = 'block';
                }
                
                document.getElementById('editPlayRecordingBtn').disabled = false;
                document.getElementById('editSaveRecordingBtn').disabled = false;

                stream.getTracks().forEach(track => track.stop());
            };

            this.editMediaRecorder.start();
            this.isEditRecording = true;

            const visualizer = document.getElementById('editRecordingVisualizer');
            if (visualizer) {
                visualizer.innerHTML = 
                    '<i class="fas fa-circle" style="color: red; animation: blink 1s infinite;"></i> Recording... Speak your reminder message now';
            }
            
            document.getElementById('editStartRecordingBtn').disabled = true;
            document.getElementById('editStopRecordingBtn').disabled = false;

        } catch (error) {
            console.error('Error accessing microphone:', error);
            app.showNotification('Error accessing microphone. Please check permissions.', 'error');
        }
    }

    stopEditRecording() {
        if (this.editMediaRecorder && this.isEditRecording) {
            this.editMediaRecorder.stop();
            this.isEditRecording = false;

            const visualizer = document.getElementById('editRecordingVisualizer');
            if (visualizer) {
                visualizer.innerHTML = 
                    '<i class="fas fa-check-circle" style="color: green;"></i> Recording complete!';
            }
            
            document.getElementById('editStartRecordingBtn').disabled = false;
            document.getElementById('editStopRecordingBtn').disabled = true;
        }
    }

    playEditRecording() {
        const audioPlayer = document.getElementById('editAudioPlayer');
        if (audioPlayer && audioPlayer.src) {
            audioPlayer.play();
        }
    }

    async saveEditRecording() {
        if (!this.editAudioBlob) {
            app.showNotification('No recording to save. Please record a message first.', 'error');
            return;
        }

        try {
            const user = app.getCurrentUser();
            if (!user) {
                app.showNotification('Please login first', 'error');
                return;
            }

            const alertName = document.getElementById('editAlertName')?.value || `Voice Alert ${new Date().toLocaleString()}`;
            
            const formData = new FormData();
            formData.append('voiceFile', this.editAudioBlob, `${alertName}.wav`);
            formData.append('alertName', alertName);

            const response = await fetch('/api/voice/upload', {
                method: 'POST',
                headers: {
                    'user-id': user.id
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                app.showNotification('Voice alert saved successfully!', 'success');
                this.editVoiceAlertId = result.voiceAlert.id;
                this.resetEditRecordingUI();
                
                document.getElementById('editVoiceAlertType').value = 'record';
                
            } else {
                app.showNotification(result.message || 'Failed to save voice alert', 'error');
            }

        } catch (error) {
            console.error('Error saving recording:', error);
            app.showNotification('Error saving recording. Please try again.', 'error');
        }
    }

    resetEditRecordingUI() {
        this.editAudioBlob = null;
        this.editAudioChunks = [];
        const visualizer = document.getElementById('editRecordingVisualizer');
        if (visualizer) {
            visualizer.innerHTML = 
                '<i class="fas fa-microphone"></i> Click "Start Recording" to record your voice alert';
        }
        
        const recordedAudio = document.getElementById('editRecordedAudio');
        if (recordedAudio) {
            recordedAudio.style.display = 'none';
        }
        
        document.getElementById('editStartRecordingBtn').disabled = false;
        document.getElementById('editStopRecordingBtn').disabled = true;
        document.getElementById('editPlayRecordingBtn').disabled = true;
        document.getElementById('editSaveRecordingBtn').disabled = true;
    }

    // File preview handlers
    handleMedicinePhotoPreview(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('medicinePhotoPreview');
                if (preview) {
                    preview.innerHTML = `
                        <img src="${e.target.result}" alt="Medicine Preview" style="max-width: 200px; max-height: 200px; border-radius: var(--radius);">
                    `;
                }
            };
            reader.readAsDataURL(file);
        }
    }

    handleEditMedicinePhotoPreview(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('editMedicinePhotoPreview');
                if (preview) {
                    preview.innerHTML = `
                        <img src="${e.target.result}" alt="Medicine Preview" style="max-width: 200px; max-height: 200px; border-radius: var(--radius);">
                    `;
                }
            };
            reader.readAsDataURL(file);
        }
    }

    handleProfilePhotoPreview(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('profilePhotoPreview');
                if (preview) {
                    preview.innerHTML = `
                        <img src="${e.target.result}" alt="Profile Preview" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">
                    `;
                }
            };
            reader.readAsDataURL(file);
        }
    }

    handleVoiceFilePreview(file) {
        if (file) {
            const fileName = document.getElementById('alertName');
            if (fileName && !fileName.value) {
                fileName.value = file.name.replace(/\.[^/.]+$/, "");
            }
            app.showNotification(`Voice file selected: ${file.name}`, 'success');
        }
    }

    handleEditVoiceFilePreview(file) {
        if (file) {
            const fileName = document.getElementById('editAlertName');
            if (fileName && !fileName.value) {
                fileName.value = file.name.replace(/\.[^/.]+$/, "");
            }
            app.showNotification(`Voice file selected: ${file.name}`, 'success');
        }
    }

    // Medicine CRUD operations
    async handleAddMedicine() {
        try {
            const formData = new FormData();
            const user = app.getCurrentUser();
            
            if (!user) {
                app.showNotification('Please login first', 'error');
                return;
            }

            // Add basic medicine data
            formData.append('name', document.getElementById('medicineName').value);
            formData.append('dosage', document.getElementById('medicineDosage').value);
            formData.append('time', document.getElementById('medicineTime').value);
            formData.append('frequency', document.getElementById('medicineFrequency').value);
            formData.append('stock', document.getElementById('medicineStock').value || '0');
            formData.append('refill_reminder', document.getElementById('medicineRefill').value || '0');
            
            const voiceAlertType = document.getElementById('voiceAlertType').value;
            formData.append('voice_alert_type', voiceAlertType);
            
            // Add medicine photo if exists
            const medicinePhotoInput = document.getElementById('medicinePhotoInput');
            if (medicinePhotoInput && medicinePhotoInput.files[0]) {
                formData.append('medicinePhoto', medicinePhotoInput.files[0]);
            }
            
            // Add voice file if exists
            const voiceFileInput = document.getElementById('voiceFileInput');
            if (voiceFileInput && voiceFileInput.files[0]) {
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
                app.loadMedicines(); // Refresh dashboard immediately
            } else {
                app.showNotification(result.message || 'Failed to add medicine', 'error');
            }

        } catch (error) {
            console.error('Error adding medicine:', error);
            app.showNotification('Error adding medicine', 'error');
        }
    }

    async loadMedicineForEdit(medicineId) {
        try {
            const user = app.getCurrentUser();
            if (!user) {
                app.showNotification('Please login first', 'error');
                return;
            }

            const response = await fetch(`/api/medicines/${medicineId}`, {
                headers: {
                    'user-id': user.id
                }
            });

            const result = await response.json();

            if (result.success) {
                const medicine = result.medicine;
                this.editingMedicineId = medicineId;

                // Populate edit form
                document.getElementById('editMedicineName').value = medicine.name;
                document.getElementById('editMedicineDosage').value = medicine.dosage;
                document.getElementById('editMedicineTime').value = medicine.time;
                document.getElementById('editMedicineFrequency').value = medicine.frequency;
                document.getElementById('editMedicineStock').value = medicine.stock;
                document.getElementById('editMedicineRefill').value = medicine.refill_reminder;
                document.getElementById('editVoiceAlertType').value = medicine.voice_alert_type;

                // Handle medicine photo preview
                if (medicine.medicine_photo) {
                    document.getElementById('editMedicinePhotoPreview').innerHTML = `
                        <img src="/uploads/medicine-photos/${medicine.medicine_photo}" alt="Medicine Preview" style="max-width: 200px; max-height: 200px; border-radius: var(--radius);">
                    `;
                }

                // Show/hide recording sections based on voice alert type
                if (medicine.voice_alert_type === 'record') {
                    document.getElementById('editRecordingSection').style.display = 'block';
                } else if (medicine.voice_alert_type === 'upload') {
                    document.getElementById('editUploadVoiceSection').style.display = 'block';
                }

                // Switch to edit section
                switchContentSection('edit-medicine-section');

            } else {
                app.showNotification(result.message || 'Failed to load medicine', 'error');
            }
        } catch (error) {
            console.error('Error loading medicine for edit:', error);
            app.showNotification('Error loading medicine', 'error');
        }
    }

    async handleUpdateMedicine() {
        try {
            const formData = new FormData();
            const user = app.getCurrentUser();
            
            if (!user) {
                app.showNotification('Please login first', 'error');
                return;
            }

            if (!this.editingMedicineId) {
                app.showNotification('No medicine selected for editing', 'error');
                return;
            }

            // Add basic medicine data
            formData.append('name', document.getElementById('editMedicineName').value);
            formData.append('dosage', document.getElementById('editMedicineDosage').value);
            formData.append('time', document.getElementById('editMedicineTime').value);
            formData.append('frequency', document.getElementById('editMedicineFrequency').value);
            formData.append('stock', document.getElementById('editMedicineStock').value || '0');
            formData.append('refill_reminder', document.getElementById('editMedicineRefill').value || '0');
            
            const voiceAlertType = document.getElementById('editVoiceAlertType').value;
            formData.append('voice_alert_type', voiceAlertType);
            
            // Add medicine photo if exists
            const medicinePhotoInput = document.getElementById('editMedicinePhotoInput');
            if (medicinePhotoInput && medicinePhotoInput.files[0]) {
                formData.append('medicinePhoto', medicinePhotoInput.files[0]);
            }
            
            // Add voice file if exists
            const voiceFileInput = document.getElementById('editVoiceFileInput');
            if (voiceFileInput && voiceFileInput.files[0]) {
                formData.append('voiceFile', voiceFileInput.files[0]);
                formData.append('alertName', document.getElementById('editAlertName').value || `Voice for ${document.getElementById('editMedicineName').value}`);
            }

            const response = await fetch(`/api/medicines/${this.editingMedicineId}`, {
                method: 'PUT',
                headers: {
                    'user-id': user.id
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                app.showNotification('Medicine updated successfully!', 'success');
                this.resetEditMedicineForm();
                switchContentSection('dashboard-section');
                app.loadMedicines(); // Refresh dashboard immediately
            } else {
                app.showNotification(result.message || 'Failed to update medicine', 'error');
            }

        } catch (error) {
            console.error('Error updating medicine:', error);
            app.showNotification('Error updating medicine', 'error');
        }
    }

    resetMedicineForm() {
        const form = document.getElementById('addMedicineForm');
        if (form) form.reset();
        
        const preview = document.getElementById('medicinePhotoPreview');
        if (preview) {
            preview.innerHTML = '<i class="fas fa-pills" style="font-size:48px;color:var(--gray-400);"></i>';
        }
        
        const recordingSection = document.getElementById('recordingSection');
        if (recordingSection) recordingSection.style.display = 'none';
        
        const uploadVoiceSection = document.getElementById('uploadVoiceSection');
        if (uploadVoiceSection) uploadVoiceSection.style.display = 'none';
        
        document.getElementById('voiceAlertType').value = 'default';
        
        this.resetRecordingUI();
        this.voiceAlertId = null;
    }

    resetEditMedicineForm() {
        const form = document.getElementById('editMedicineForm');
        if (form) form.reset();
        
        const preview = document.getElementById('editMedicinePhotoPreview');
        if (preview) {
            preview.innerHTML = '<i class="fas fa-pills" style="font-size:48px;color:var(--gray-400);"></i>';
        }
        
        const recordingSection = document.getElementById('editRecordingSection');
        if (recordingSection) recordingSection.style.display = 'none';
        
        const uploadVoiceSection = document.getElementById('editUploadVoiceSection');
        if (uploadVoiceSection) uploadVoiceSection.style.display = 'none';
        
        document.getElementById('editVoiceAlertType').value = 'default';
        
        this.resetEditRecordingUI();
        this.editVoiceAlertId = null;
        this.editingMedicineId = null;
    }

    async handleUpdateProfile() {
        try {
            const formData = new FormData();
            const user = app.getCurrentUser();
            
            if (!user) {
                app.showNotification('Please login first', 'error');
                return;
            }

            formData.append('name', document.getElementById('profileName').value);
            formData.append('age', document.getElementById('profileAge').value);
            formData.append('medical_history', document.getElementById('profileMedicalHistory').value);
            formData.append('guardian_name', document.getElementById('profileGuardianName').value);
            formData.append('guardian_contact', document.getElementById('profileGuardianContact').value);
            
            // Add profile photo if exists
            const profilePhotoInput = document.getElementById('profilePhotoInput');
            if (profilePhotoInput && profilePhotoInput.files[0]) {
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
            app.showNotification('Error updating profile: ' + (error.message || 'Please try again'), 'error');
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
            const preview = document.getElementById('profilePhotoPreview');
            if (preview) {
                if (user.profile_photo) {
                    preview.innerHTML = `
                        <img src="/uploads/profile-photos/${user.profile_photo}" alt="Profile Photo" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">
                    `;
                } else {
                    preview.innerHTML = `
                        <i class="fas fa-user" style="font-size:48px;color:var(--gray-400);"></i>
                    `;
                }
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
}

// Main application initialization
class MediTrackApp {
    constructor() {
        this.currentUser = null;
        this.medicines = [];
        this.history = [];
        this.reminderInterval = null;
        this.currentReminderMedicine = null;
        this.reminderLoopInterval = null;
        this.dashboardManager = null;
        
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.startReminderChecker();
        this.dashboardManager = new DashboardManager();
    }

    checkAuthentication() {
        const userData = localStorage.getItem('meditrack_user');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.showDashboard();
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.showLandingPage();
            }
        } else {
            this.showLandingPage();
        }
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('landingLoginBtn').addEventListener('click', () => this.showAuthPage('login'));
        document.getElementById('landingRegisterBtn').addEventListener('click', () => this.showAuthPage('register'));
        document.getElementById('heroGetStartedBtn').addEventListener('click', () => this.showAuthPage('register'));
        
        // Auth tabs
        document.getElementById('loginTab').addEventListener('click', () => this.switchAuthTab('login'));
        document.getElementById('registerTab').addEventListener('click', () => this.switchAuthTab('register'));

        // Menu navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', function() {
                const target = this.getAttribute('data-target');
                switchContentSection(target);
            });
        });

        // Modal buttons
        document.getElementById('markTakenBtn').addEventListener('click', () => this.handleMedicineAction('taken'));
        document.getElementById('showCustomRemindBtn').addEventListener('click', () => this.showCustomRemindOptions());
        document.getElementById('setCustomReminderBtn').addEventListener('click', () => this.setCustomReminder());
        document.getElementById('snoozeBtn').addEventListener('click', () => this.snoozeReminder());

        // Close modal when clicking outside
        document.getElementById('reminderModal').addEventListener('click', (e) => {
            if (e.target.id === 'reminderModal') {
                this.hideReminderModal();
            }
        });

        // Auth forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    }

    showLandingPage() {
        this.hideAllPages();
        document.getElementById('landingPage').classList.add('active');
    }

    showAuthPage(tab = 'login') {
        this.hideAllPages();
        document.getElementById('authPage').classList.add('active');
        this.switchAuthTab(tab);
    }

    showDashboard() {
        this.hideAllPages();
        document.getElementById('dashboard').classList.add('active');
        
        if (this.currentUser) {
            document.getElementById('userName').textContent = this.currentUser.name;
            document.getElementById('userAvatar').textContent = this.currentUser.name.charAt(0).toUpperCase();
        }
        
        this.loadDashboardData();
    }

    hideAllPages() {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
    }

    switchAuthTab(tab) {
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (tab === 'login') {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        } else {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await this.apiCall('/api/auth/login', 'POST', { email, password });
            
            if (response.success) {
                this.currentUser = response.user;
                localStorage.setItem('meditrack_user', JSON.stringify(response.user));
                this.showDashboard();
                this.showNotification('Login successful!', 'success');
            } else {
                this.showNotification(response.message, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please try again.', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const age = document.getElementById('registerAge').value;
        const medicalHistory = document.getElementById('registerMedicalHistory').value;
        const guardianName = document.getElementById('registerGuardianName').value;
        const guardianContact = document.getElementById('registerGuardianContact').value;

        try {
            const response = await this.apiCall('/api/auth/register', 'POST', {
                name,
                email,
                password,
                age,
                medical_history: medicalHistory,
                guardian_name: guardianName,
                guardian_contact: guardianContact
            });
            
            if (response.success) {
                this.showNotification('Registration successful! Please login.', 'success');
                this.switchAuthTab('login');
                document.getElementById('registerForm').reset();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Registration failed. Please try again.', 'error');
        }
    }

    async loadDashboardData() {
        try {
            await Promise.all([
                this.loadMedicines(),
                this.loadHistory()
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    async loadMedicines() {
        try {
            const response = await this.apiCall('/api/medicines', 'GET');
            if (response.success) {
                this.medicines = response.medicines;
                this.updateMedicineTable();
                this.updateSummaryCards();
            }
        } catch (error) {
            console.error('Error loading medicines:', error);
        }
    }

    async loadHistory() {
        try {
            const response = await this.apiCall('/api/history', 'GET');
            if (response.success) {
                this.history = response.history || [];
                this.updateHistoryTable();
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }

    updateMedicineTable() {
        const tableBody = document.getElementById('medicineTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        this.medicines.forEach(medicine => {
            const row = document.createElement('tr');
            const statusBadge = this.getStatusBadge(medicine.status);
            const voiceAlert = medicine.voice_alert_type === 'record' ? 'Custom' : 
                              medicine.voice_alert_type === 'upload' ? 'Uploaded' : 'Default';

            row.innerHTML = `
                <td>${medicine.name}</td>
                <td>${medicine.dosage}</td>
                <td>${medicine.time}</td>
                <td>${voiceAlert}</td>
                <td>${statusBadge}</td>
                <td class="action-buttons">
                    <button class="btn btn-success btn-sm" onclick="app.markMedicineAsTaken('${medicine.id}')">
                        <i class="fas fa-check"></i> Taken
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="app.editMedicine('${medicine.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteMedicine('${medicine.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    updateSummaryCards() {
        const takenCount = this.medicines.filter(m => m.status === 'taken').length;
        const pendingCount = this.medicines.filter(m => m.status === 'pending').length;
        const missedCount = this.medicines.filter(m => m.status === 'missed').length;
        const lowStockCount = this.medicines.filter(m => m.stock > 0 && m.stock <= m.refill_reminder).length;

        document.getElementById('takenCount').textContent = takenCount;
        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('missedCount').textContent = missedCount;
        document.getElementById('lowStockCount').textContent = lowStockCount;
    }

    updateHistoryTable() {
        const tableBody = document.getElementById('historyTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        this.history.forEach(record => {
            const row = document.createElement('tr');
            const date = new Date(record.created_at).toLocaleDateString();
            const scheduledTime = record.scheduled_time;
            const actualTime = record.actual_time || '-';
            const statusBadge = this.getStatusBadge(record.status);

            row.innerHTML = `
                <td>${date}</td>
                <td>${record.medicine_name}</td>
                <td>${record.dosage}</td>
                <td>${scheduledTime}</td>
                <td>${actualTime}</td>
                <td>${statusBadge}</td>
                <td>${record.notes || '-'}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    getStatusBadge(status) {
        const badges = {
            'taken': '<span class="status-badge status-taken"><i class="fas fa-check-circle"></i> Taken</span>',
            'pending': '<span class="status-badge status-pending"><i class="fas fa-clock"></i> Pending</span>',
            'missed': '<span class="status-badge status-missed"><i class="fas fa-times-circle"></i> Missed</span>',
            'rescheduled': '<span class="status-badge status-pending"><i class="fas fa-clock"></i> Rescheduled</span>'
        };
        return badges[status] || badges.pending;
    }

    // Reminder System with Looping
    startReminderChecker() {
        this.reminderInterval = setInterval(() => {
            this.checkDueMedicines();
        }, 5000);
    }

    async checkDueMedicines() {
        if (!this.currentUser) return;

        try {
            const response = await this.apiCall('/api/reminders', 'GET');
            if (response.success && response.reminders.length > 0) {
                const activeReminder = response.reminders[0];
                if (!this.isReminderActive() || this.currentReminderMedicine?.id !== activeReminder.id) {
                    this.showReminderModal(activeReminder);
                    this.startVoiceLoop(activeReminder);
                }
            }
        } catch (error) {
            console.error('Error checking reminders:', error);
        }
    }

    isReminderActive() {
        return document.getElementById('reminderModal').classList.contains('active');
    }

    showReminderModal(medicine) {
        const modal = document.getElementById('reminderModal');
        const content = document.getElementById('reminderContent');
        const customRemindSection = document.getElementById('customRemindLater');
        
        customRemindSection.style.display = 'none';
        
        content.innerHTML = `
            <div style="text-align: center; padding: 20px 0;">
                <i class="fas fa-bell" style="font-size: 3rem; color: var(--warning); margin-bottom: 16px;"></i>
                <h3 style="margin-bottom: 8px; color: var(--gray-900);">Time to take your medicine!</h3>
                <p style="font-size: 1.2rem; color: var(--gray-700); margin-bottom: 8px;">
                    <strong>${medicine.name}</strong> - ${medicine.dosage}
                </p>
                <p style="color: var(--gray-600);">Scheduled for: ${medicine.time}</p>
                <p style="color: var(--gray-500); font-size: 0.9rem; margin-top: 10px;">
                    <i class="fas fa-info-circle"></i> Voice reminder will repeat every 30 seconds
                </p>
            </div>
        `;

        modal.classList.add('active');
        this.currentReminderMedicine = medicine;
    }

    startVoiceLoop(medicine) {
        if (this.reminderLoopInterval) {
            clearInterval(this.reminderLoopInterval);
        }

        this.playVoiceAlert(medicine);

        this.reminderLoopInterval = setInterval(() => {
            if (this.isReminderActive() && this.currentReminderMedicine?.id === medicine.id) {
                this.playVoiceAlert(medicine);
            } else {
                clearInterval(this.reminderLoopInterval);
                this.reminderLoopInterval = null;
            }
        }, 30000);
    }

    hideReminderModal() {
        document.getElementById('reminderModal').classList.remove('active');
        
        if (this.reminderLoopInterval) {
            clearInterval(this.reminderLoopInterval);
            this.reminderLoopInterval = null;
        }
        
        if (this.currentReminderMedicine) {
            this.apiCall(`/api/reminders/${this.currentReminderMedicine.id}`, 'DELETE')
                .catch(error => console.error('Error clearing reminder:', error));
        }
        
        this.currentReminderMedicine = null;
    }

    playVoiceAlert(medicine) {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(
                `Reminder: Time to take your ${medicine.name}, dosage: ${medicine.dosage}. Please take your medicine now.`
            );
            
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            speechSynthesis.speak(utterance);
        }
    }

    async handleMedicineAction(action) {
        if (!this.currentReminderMedicine) return;

        if (action === 'taken') {
            await this.markMedicineAsTaken(this.currentReminderMedicine.id);
        }

        this.hideReminderModal();
    }

    showCustomRemindOptions() {
        const customRemindSection = document.getElementById('customRemindLater');
        customRemindSection.style.display = 'block';
    }

    async setCustomReminder() {
        const minutesInput = document.getElementById('customMinutes');
        const minutes = parseInt(minutesInput.value);
        
        if (!minutes || minutes < 1) {
            this.showNotification('Please enter a valid number of minutes', 'error');
            return;
        }

        await this.rescheduleReminder(minutes);
    }

    async rescheduleReminder(minutes) {
        if (!this.currentReminderMedicine) return;

        try {
            await this.apiCall(`/api/medicines/${this.currentReminderMedicine.id}/reschedule`, 'POST', {
                remindInMinutes: minutes
            });

            this.hideReminderModal();
            this.showNotification(`Reminder set for ${minutes} minutes from now`, 'success');
        } catch (error) {
            console.error('Error rescheduling:', error);
            this.showNotification('Error rescheduling reminder', 'error');
        }
    }

    snoozeReminder() {
        this.rescheduleReminder(5);
    }

    // API Methods
    async apiCall(endpoint, method = 'GET', data = null) {
        const url = `http://localhost:5001${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'user-id': this.currentUser?.id || ''
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API call failed');
        }

        return result;
    }

    // Utility Methods
    showNotification(message, type = 'info') {
        alert(`${type.toUpperCase()}: ${message}`);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('meditrack_user', JSON.stringify(user));
    }

    logout() {
        localStorage.removeItem('meditrack_user');
        this.currentUser = null;
        this.medicines = [];
        this.history = [];

        if (this.reminderInterval) {
            clearInterval(this.reminderInterval);
        }
        
        if (this.reminderLoopInterval) {
            clearInterval(this.reminderLoopInterval);
        }

        this.showLandingPage();
    }
}

// Global app instance
const app = new MediTrackApp();

// Utility functions for global access
function switchContentSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show target section
    document.getElementById(sectionId).classList.add('active');

    // Activate corresponding menu item
    const menuItem = document.querySelector(`.menu-item[data-target="${sectionId}"]`);
    if (menuItem) {
        menuItem.classList.add('active');
    }

    // Load section-specific data
    if (sectionId === 'dashboard-section') {
        app.loadMedicines();
    } else if (sectionId === 'history-section') {
        app.loadHistory();
    } else if (sectionId === 'profile-section') {
        app.dashboardManager.loadProfileData();
    }
}

// Make methods globally available
window.app = app;

// Medicine actions
app.markMedicineAsTaken = async function(medicineId) {
    try {
        const notes = prompt('Add any notes (optional):') || '';
        
        await app.apiCall(`/api/medicines/${medicineId}/taken`, 'POST', {
            notes
        });

        app.showNotification('Medicine marked as taken!', 'success');
        await app.loadMedicines();
        await app.loadHistory();

    } catch (error) {
        console.error('Error marking medicine as taken:', error);
        app.showNotification('Failed to update medicine', 'error');
    }
};

app.editMedicine = async function(medicineId) {
    app.dashboardManager.loadMedicineForEdit(medicineId);
};

app.deleteMedicine = async function(medicineId) {
    if (!confirm('Are you sure you want to delete this medicine?')) {
        return;
    }

    try {
        await app.apiCall(`/api/medicines/${medicineId}`, 'DELETE');
        
        app.showNotification('Medicine deleted successfully!', 'success');
        await app.loadMedicines();

    } catch (error) {
        console.error('Error deleting medicine:', error);
        app.showNotification('Failed to delete medicine', 'error');
    }
};

// Setup menu navigation
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            switchContentSection(target);
        });
    });
});