// services/sse.js
export class TransactionSSE {
    constructor(url, onMessage) {
        this.url = url;
        this.onMessage = onMessage;
        this.eventSource = null;
    }

    connect() {
        try {
            this.eventSource = new EventSource(this.url);
            
            this.eventSource.onopen = () => {
                console.log('SSE connection opened');
            };

            this.eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.onMessage(data);
            };

            this.eventSource.onerror = (error) => {
                console.error('SSE error:', error);
                this.reconnect();
            };

        } catch (error) {
            console.error('SSE connection failed:', error);
        }
    }

    reconnect() {
        setTimeout(() => {
            console.log('Reconnecting SSE...');
            this.connect();
        }, 3000);
    }

    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
        }
    }
}