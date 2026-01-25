# Shipping Company - Management System

This project is a complete web application for managing the operations of a shipping company. The application provides an intuitive web interface for administering parcels, senders, delivery personnel, warehouses, and other logistical aspects.

## Features

-   **Parcel Management:** Add, update status (e.g., In Warehouse, In Transit, Delivered), and delete parcels.
-   **Sender Management:** Manage clients who send parcels.
-   **Product Management:** Catalog of products that can be included in parcels.
-   **Delivery Personnel Management:** Records of delivery personnel and their salaries.
-   **Vehicle Management:** Fleet vehicle records.
-   **Warehouse and Location Management:** Manage warehouses and their locations.
-   **Web Interface:** A Single Page Application (SPA) interface for a smooth user experience.

## Tech Stack

-   **Backend:** Node.js, Express.js
-   **Database:** Oracle Database
-   **Frontend:** HTML, CSS, JavaScript (Vanilla)
-   **Other Packages:** `oracledb`, `cors`, `dotenv`, `nodemon`

## Prerequisites

To run this project, you will need:

-   Node.js installed
-   Access to an Oracle database
-   An Oracle Client (e.g., Oracle Instant Client) correctly configured to allow the `node-oracledb` connection.

## Installation and Configuration

1.  **Clone the repository:**
    ```bash
    git clone <repository-URL>
    cd <directory-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Create a `.env` file in the project's root directory and add the following variables, replacing the values with your Oracle database credentials:

    ```env
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_CONNECTION_STRING=localhost:1521/XEPDB1
    PORT=3000
    ```

4.  **Import the database schema:**
    Run the `firma_curierat.sql` script in your Oracle database to create the necessary tables and other objects.

## Running the Application

-   **For production:**
    ```bash
    npm start
    ```

-   **For development (with auto-reload):**
    ```bash
    npm run dev
    ```

After starting, the server will run at `http://localhost:3000`, and the web application will be accessible at the same address.

## API Endpoints

-   `GET /api/colete`: View all parcels.
-   `POST /api/colete`: Add a new parcel.
-   `PUT /api/colete/:awb/status`: Update a parcel's status.
-   `DELETE /api/colete/:awb`: Delete a parcel.
-   `GET /api/expeditori`: View all senders.
-   `POST /api/expeditori`: Add a new sender.
-   ... and many more for `produse` (products), `livratori` (couriers), `vehicule` (vehicles), `depozite` (warehouses), `locatii` (locations), etc.
