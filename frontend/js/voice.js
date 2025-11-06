// Enhanced Voice recording functionality with proper error handling
class VoiceRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.audioBlob = null;
        this.recordingStream = null;
        
        this.setupRecordingEventListeners();
    }

    setupRecordingEventListeners() {
        // Add medicine recording
        document.getElementById('startRecordingBtn')?.addEventListener('click', () => {
            this.startRecording('add');
        });

        document.getElementById('stopRecordingBtn')?.addEventListener('click', () => {
            this.stopRecording('add');
        });

        document.getElementById('playRecordingBtn')?.addEventListener('click', () => {
            this.playRecording('add');
        });

        document.getElementById('saveRecordingBtn')?.addEventListener('click', () => {
            this.saveRecording('add');
        });

        // Edit medicine recording
        document.getElementById('editStartRecordingBtn')?.addEventListener('click', () => {
            this.startRecording('edit');
        });

        document.getElementById('editStopRecordingBtn')?.addEventListener('click', () => {
            this.stopRecording('edit');
        });

        document.getElementById('editPlayRecordingBtn')?.addEventListener('click', () => {
            this.playRecording('edit');
        });

        document.getElementById('editSaveRecordingBtn')?.addEventListener('click', () => {
            this.saveRecording('edit');
        });
    }

    async startRecording(type = 'add') {
        try {
            // Check browser support
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                this.showNotification('Your browser does not support audio recording. Please use Chrome, Firefox, or Edge.', 'error');
                return;
            }

            console.log('🎤 Starting recording...');
            
            // Request microphone permissions with better error handling
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                    channelCount: 1
                } 
            });
            
            // Try different MIME types for better compatibility
            const options = { 
                audioBitsPerSecond: 128000 
            };
            
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                options.mimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                options.mimeType = 'audio/mp4';
            }
            
            this.mediaRecorder = new MediaRecorder(stream, options);
            this.audioChunks = [];
            this.recordingStream = stream;

            this.mediaRecorder.ondataavailable = (event) => {
                console.log('📦 Data available:', event.data.size, 'bytes');
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                console.log('⏹️ Recording stopped');
                this.audioBlob = new Blob(this.audioChunks, { 
                    type: this.audioChunks[0]?.type || 'audio/webm' 
                });
                
                console.log('🎵 Blob created:', this.audioBlob.size, 'bytes');
                
                const audioUrl = URL.createObjectURL(this.audioBlob);
                const audioPlayer = document.getElementById(type === 'edit' ? 'editAudioPlayer' : 'audioPlayer');
                if (audioPlayer) {
                    audioPlayer.src = audioUrl;
                    console.log('🔊 Audio source set');
                }
                
                const recordedAudio = document.getElementById(type === 'edit' ? 'editRecordedAudio' : 'recordedAudio');
                if (recordedAudio) {
                    recordedAudio.style.display = 'block';
                }
                
                this.updateRecordingButtons(type, false, true, true);

                // Clean up stream
                if (this.recordingStream) {
                    this.recordingStream.getTracks().forEach(track => track.stop());
                    this.recordingStream = null;
                }
            };

            this.mediaRecorder.onerror = (event) => {
                console.error('❌ MediaRecorder error:', event.error);
                this.showNotification('Recording error: ' + event.error, 'error');
                this.stopRecording(type);
            };

            this.mediaRecorder.start(1000); // Collect data every second
            this.isRecording = true;
            console.log('🎙️ Recording started');

            // Update UI
            const visualizer = document.getElementById(type === 'edit' ? 'editRecordingVisualizer' : 'recordingVisualizer');
            if (visualizer) {
                visualizer.innerHTML = 
                    '<div style="color: red; animation: pulse 1s infinite;">' +
                    '<i class="fas fa-circle"></i> Recording... Speak clearly into your microphone' +
                    '</div>';
            }

            this.updateRecordingButtons(type, true, false, false);

        } catch (error) {
            console.error('💥 Error accessing microphone:', error);
            
            if (error.name === 'NotAllowedError') {
                this.showNotification('Microphone access denied. Please allow microphone permissions and try again.', 'error');
            } else if (error.name === 'NotFoundError') {
                this.showNotification('No microphone found. Please check your audio devices.', 'error');
            } else if (error.name === 'NotSupportedError') {
                this.showNotification('Your browser does not support audio recording.', 'error');
            } else {
                this.showNotification('Error accessing microphone: ' + error.message, 'error');
            }
        }
    }

    stopRecording(type = 'add') {
        if (this.mediaRecorder && this.isRecording) {
            console.log('🛑 Stopping recording...');
            this.mediaRecorder.stop();
            this.isRecording = false;

            const visualizer = document.getElementById(type === 'edit' ? 'editRecordingVisualizer' : 'recordingVisualizer');
            if (visualizer) {
                visualizer.innerHTML = 
                    '<div style="color: green;">' +
                    '<i class="fas fa-check-circle"></i> Recording complete! Click Play to review' +
                    '</div>';
            }

            this.updateRecordingButtons(type, false, true, false);
        }
    }

    playRecording(type = 'add') {
        const audioPlayer = document.getElementById(type === 'edit' ? 'editAudioPlayer' : 'audioPlayer');
        if (audioPlayer && audioPlayer.src) {
            console.log('▶️ Playing recording...');
            audioPlayer.play().catch(error => {
                console.error('❌ Error playing audio:', error);
                this.showNotification('Error playing recording. Please try recording again.', 'error');
            });
        } else {
            this.showNotification('No recording to play. Please record a message first.', 'error');
        }
    }

    async saveRecording(type = 'add') {
        if (!this.audioBlob) {
            this.showNotification('No recording to save. Please record a message first.', 'error');
            return;
        }

        const defaultName = type === 'edit' ? 
            document.getElementById('editMedicineName')?.value || 'Medicine' : 
            document.getElementById('medicineName')?.value || 'Medicine';
        
        const alertName = prompt('Enter a name for this voice alert:', `Voice for ${defaultName}`) || `Voice for ${defaultName}`;

        try {
            const btn = document.getElementById(type === 'edit' ? 'editSaveRecordingBtn' : 'saveRecordingBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            btn.disabled = true;

            console.log('💾 Saving recording...');

            // Convert blob to file with proper extension
            const fileExtension = this.audioBlob.type.includes('webm') ? 'webm' : 'wav';
            const file = new File([this.audioBlob], `voice-alert-${Date.now()}.${fileExtension}`, {
                type: this.audioBlob.type
            });

            const formData = new FormData();
            formData.append('voiceFile', file);
            formData.append('alertName', alertName);

            // Get user ID from app
            const userId = window.app?.currentUser?.id;
            if (!userId) {
                throw new Error('User not logged in');
            }

            const response = await fetch('http://localhost:5000/api/voice/upload', {
                method: 'POST',
                headers: {
                    'User-ID': userId
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Voice alert saved successfully!', 'success');
                
                // Update alert name input
                const alertNameInput = document.getElementById(type === 'edit' ? 'editAlertName' : 'alertName');
                if (alertNameInput) {
                    alertNameInput.value = alertName;
                }
                
                // Reset recording UI
                this.resetRecordingUI(type);
                
            } else {
                throw new Error(data.message || 'Failed to save recording');
            }

        } catch (error) {
            console.error('💥 Error saving recording:', error);
            this.showNotification(error.message || 'Failed to save recording. Please try again.', 'error');
        } finally {
            const btn = document.getElementById(type === 'edit' ? 'editSaveRecordingBtn' : 'saveRecordingBtn');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-save"></i> Save Recording';
                btn.disabled = false;
            }
        }
    }

    updateRecordingButtons(type, recording = false, stopped = false, saved = false) {
        const prefix = type === 'edit' ? 'edit' : '';
        
        const startBtn = document.getElementById(`${prefix}StartRecordingBtn`);
        const stopBtn = document.getElementById(`${prefix}StopRecordingBtn`);
        const playBtn = document.getElementById(`${prefix}PlayRecordingBtn`);
        const saveBtn = document.getElementById(`${prefix}SaveRecordingBtn`);

        if (startBtn) startBtn.disabled = recording;
        if (stopBtn) stopBtn.disabled = !recording;
        if (playBtn) playBtn.disabled = !stopped;
        if (saveBtn) saveBtn.disabled = !saved;
    }

    resetRecordingUI(type = 'add') {
        this.audioBlob = null;
        this.audioChunks = [];
        
        const prefix = type === 'edit' ? 'edit' : '';
        const audioPlayer = document.getElementById(`${prefix}AudioPlayer`);
        const recordedAudio = document.getElementById(`${prefix}RecordedAudio`);
        const visualizer = document.getElementById(`${prefix}RecordingVisualizer`);

        if (audioPlayer) {
            audioPlayer.src = '';
            audioPlayer.load(); // Reset audio element
        }
        if (recordedAudio) recordedAudio.style.display = 'none';
        if (visualizer) {
            visualizer.innerHTML = 
                '<i class="fas fa-microphone"></i> Ready to record. Click "Start Recording" to begin.';
        }
        
        this.updateRecordingButtons(type, false, false, false);
    }

    showNotification(message, type = 'info') {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            // Fallback notification
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize voice recorder when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.voiceRecorder = new VoiceRecorder();
    console.log('🎤 VoiceRecorder initialized');
});