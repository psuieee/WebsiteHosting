import socket
import signal
import sys

# Step 1: Initialize the socket
serverSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # AF_INET for IPv4, SOCK_STREAM for TCP
serverSocket.bind(('0.0.0.0', 80))  # Bind to all interfaces on port 80, on local IP
serverSocket.listen()  # Start listening for incoming connections
serverSocket.settimeout(1)  # Set a timeout to check for SIGINT regularly

print('Socket Started!')
running = True  # Flag to control the loop

def signal_handler(sig, frame): #Signal handler, when server host presses Ctrl+C, stops server.
    global running
    print('Stopping server...')
    running = False  # Set flag to False to exit loop
    serverSocket.close()  # Ensure server socket is closed

signal.signal(signal.SIGINT, signal_handler)

def openAndSend(connSocket, fileName, status):  # Helper function
    try:
        # Determine the content type based on the file extension
        if fileName.endswith('.html'):
            content_type = 'text/html'
        elif fileName.endswith('.css'):
            content_type = 'text/css'
        elif fileName.endswith('.mp3'):
            content_type = 'audio/mpeg'
        else:
            content_type = 'application/octet-stream'  # Fallback for other types

        with open(fileName, 'rb') as page:  # Use 'with' for safe file handling
            content = page.read()

        response = b"HTTP/1.1 " + status.encode() + b"\r\n"  # Create status line
        response += f"Content-Type: {content_type}\r\n".encode()  # Set correct Content-Type
        response += b"Connection: close\r\n\r\n"  
        response += content  # Add file content to response

        connSocket.sendall(response)  # Send the complete response
    except FileNotFoundError:
        openAndSend(connSocket, "404.html", "404 Not Found")  # Send 404 page if file not found
    except Exception as e:
        print(f"Error: {e}")  # Handle other potential errors
        openAndSend(connSocket, "404.html", "500 Internal Server Error")  # Send 500 page

while running:
    try:
        # Step 2: Establish a TCP connection
        connSocket, addr = serverSocket.accept()  # Accept a new connection
        print(f"Connection established with {addr}")

        # Step 3: Receive data from connSocket
        http_message = connSocket.recv(1024)  # Receive up to 1024 bytes
        decoded = http_message.decode()  # Decode the request to a string
        print(decoded)

        # Step 4-6: Parse the message
        firstLine = decoded.splitlines()[0]  # Get the first line of the request
        request, file, _ = firstLine.split()  # Split the line into components
        file = file[1:]  # Remove the leading '/'
        print(f"Requested file: {file}")
        openAndSend(connSocket, file, "200 OK")  # Send the requested file

    except socket.timeout:
        # Loop back to check for ctrl+C without blocking
        continue
    except Exception as e:
        if running:  # Only print errors if the server is still running
            print(f"Error: {e}")
    finally:
        if 'connSocket' in locals():
            connSocket.close()  # Ensure the connection is closed after each request

print("Server stopped.")
