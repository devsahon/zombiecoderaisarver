class NotificationHandler {
    constructor() {
        this.connections = {};
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second delay

        // Initialize notification container
        this.container = document.getElementById('notification-container') || this.createNotificationContainer();

        // Subscribe to default channels
        this.subscribe('agent_status');
        this.subscribe('provider_status');
        this.subscribe('system_status');
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        `;
        document.body.appendChild(container);
        return container;
    }

    subscribe(channel) {
        if (this.connections[channel]) {
            return; // Already subscribed
        }

        const ws = new WebSocket(`ws://${window.location.host}/ws/${channel}`);
        this.connections[channel] = ws;

        ws.onopen = () => {
            console.log(`Connected to ${channel} channel`);
            this.reconnectAttempts = 0;
            this.reconnectDelay = 1000;
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleNotification(data);
        };

        ws.onclose = () => {
            console.log(`Disconnected from ${channel} channel`);
            delete this.connections[channel];
            this.attemptReconnect(channel);
        };

        ws.onerror = (error) => {
            console.error(`WebSocket error on ${channel} channel:`, error);
        };
    }

    attemptReconnect(channel) {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error(`Failed to reconnect to ${channel} after ${this.maxReconnectAttempts} attempts`);
            return;
        }

        setTimeout(() => {
            console.log(`Attempting to reconnect to ${channel}...`);
            this.subscribe(channel);
            this.reconnectAttempts++;
            this.reconnectDelay *= 2; // Exponential backoff
        }, this.reconnectDelay);
    }

    handleNotification(data) {
        // Update UI elements based on notification type
        switch (data.type) {
            case 'agent_status':
                this.updateAgentStatus(data);
                break;
            case 'provider_status':
                this.updateProviderStatus(data);
                break;
            case 'system_status':
                this.updateSystemStatus(data);
                break;
        }

        // Show notification toast
        this.showNotification(data);
    }

    updateAgentStatus(data) {
        const agentElement = document.querySelector(`[data-agent-id="${data.id}"]`);
        if (agentElement) {
            // Update status badge
            const badge = agentElement.querySelector('.status-badge');
            if (badge) {
                badge.className = `badge bg-${this.getStatusColor(data.status)} status-badge`;
                badge.textContent = data.status;
            }

            // Update details
            if (data.details) {
                const details = agentElement.querySelector('.agent-details');
                if (details) {
                    details.innerHTML = `
                        <small class="text-muted">
                            Memory: ${data.details.memory_usage || 'N/A'} |
                            Response Time: ${data.details.response_time || 'N/A'}
                        </small>
                    `;
                }
            }
        }
    }

    updateProviderStatus(data) {
        const providerElement = document.querySelector(`[data-provider-id="${data.id}"]`);
        if (providerElement) {
            // Update status badge
            const badge = providerElement.querySelector('.status-badge');
            if (badge) {
                badge.className = `badge bg-${this.getStatusColor(data.status)} status-badge`;
                badge.textContent = data.status;
            }

            // Update error message if any
            if (data.details && data.details.error) {
                const errorElement = providerElement.querySelector('.provider-error');
                if (errorElement) {
                    errorElement.textContent = data.details.error;
                    errorElement.style.display = 'block';
                }
            }
        }
    }

    updateSystemStatus(data) {
        // Update system status indicators
        const element = document.querySelector(`[data-system-component="${data.id}"]`);
        if (element) {
            element.className = `system-status-indicator ${data.status}`;
            if (data.details) {
                element.setAttribute('title', JSON.stringify(data.details));
            }
        }
    }

    showNotification(data) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${this.getStatusColor(data.status)} alert-dismissible fade show`;
        notification.innerHTML = `
            <strong>${this.formatTitle(data)}</strong>
            <p>${this.formatMessage(data)}</p>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        this.container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    getStatusColor(status) {
        switch (status.toLowerCase()) {
            case 'active':
            case 'online':
            case 'success':
                return 'success';
            case 'warning':
            case 'degraded':
                return 'warning';
            case 'error':
            case 'offline':
            case 'failed':
                return 'danger';
            default:
                return 'info';
        }
    }

    formatTitle(data) {
        switch (data.type) {
            case 'agent_status':
                return `Agent: ${data.id}`;
            case 'provider_status':
                return `Provider: ${data.id}`;
            case 'system_status':
                return `System: ${data.id}`;
            default:
                return data.id;
        }
    }

    formatMessage(data) {
        let message = `Status: ${data.status}`;
        if (data.details) {
            if (data.details.error) {
                message += `<br>Error: ${data.details.error}`;
            }
            if (data.details.message) {
                message += `<br>${data.details.message}`;
            }
        }
        return message;
    }
}

// Initialize notification handler
const notifications = new NotificationHandler();

// Export for use in other modules
export default notifications;