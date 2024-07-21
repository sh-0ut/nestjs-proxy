# NestJS Proxy Application

This is a NestJS application that serves as a proxy server, fetching and modifying content from an external site. It adds a "™" symbol to each word consisting of six letters and replaces internal navigation links with the address of the proxy server.

## Features

- Fetches content from the target site and modifies it.
- Adds "™" to each word consisting of six letters.
- Replaces internal links with proxy server addresses.
- Handles dynamic content using MutationObserver.
- Optimized Docker setup for efficient deployment.

## Prerequisites

- Node.js (>= 14.x)
- Docker (optional, for containerized deployment)

## Installation

### Local Development

1. Clone the repository:

    ```bash
    git clone https://github.com/sh-0ut/nestjs-proxy.git
    cd nestjs-proxy
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm run start:dev
    ```

4. The application will be available at `http://localhost:3000`.

### Docker Deployment

1. Build the Docker image:

    ```bash
    docker build -t nestjs-proxy .
    ```

2. Run the Docker container:

    ```bash
    docker run -p 3000:3000 nestjs-proxy
    ```

3. The application will be available at `http://localhost:3000`.

## Usage

Navigate to `http://localhost:3000/<path>` to fetch and view the modified content from the target site.

For example:

- `http://localhost:3000/websockets/gateways` will fetch and modify the content from `https://docs.nestjs.com/websockets/gateways`.

## Testing

Run the tests using Jest:

```bash
npm run test
