import { useEffect, useRef } from 'react';

const useWebSocket = (url, onMessage) => {
  const socketRef = useRef(null);
  const reconnectInterval = useRef(null);

  const connect = () => {
    socketRef.current = new WebSocket(url);

    socketRef.current.onopen = () => {
      console.log('WebSocket connected');
      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current);
      }
    };

    socketRef.current.onmessage = (event) => {
      if (onMessage) onMessage(JSON.parse(event.data));
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socketRef.current.onclose = (event) => {
      console.log('WebSocket closed, retrying in 2s...', event.reason);
      if (!reconnectInterval.current) {
        reconnectInterval.current = setInterval(connect, 2000); // Try reconnect every 2 seconds
      }
    };
  };

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectInterval.current) clearInterval(reconnectInterval.current);
    };
  }, [url]);

  return socketRef.current;
};

export default useWebSocket;
