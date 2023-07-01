
### plzrun script
This script automatically kills the existing server process, and updates the `.env` file with a new room ID.
**dependencies**:
  npm packages `concurently` and `uuid` must be installed globally
  `.env` file must have the following format before running the script:

    ```
    VITE_WEBSOCKET_SERVER={WSS URI here}
    VITE_ROTATING_ROOM={ former roomId / any }
    ```
