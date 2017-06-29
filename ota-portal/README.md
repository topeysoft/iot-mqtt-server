# Over The Air Update Portal

This project is responsible for managing and activating Over-The-Air Update System for my IOT MQTT Smart Server

<!-- TOC -->

- [Over The Air Update Portal](#over-the-air-update-portal)
    - [Features (MVP)](#features-mvp)
        - [Future Features](#future-features)
    - [UI Specifications](#ui-specifications)
        - [Application Header](#application-header)
        - [Application Menu](#application-menu)
        - [Grid/List of available firmwares](#gridlist-of-available-firmwares)
        - [Grid/List of available devices with their current online status](#gridlist-of-available-devices-with-their-current-online-status)
        - [(Future) Grid/List of available devices with their current online status Device Update Groups](#future-gridlist-of-available-devices-with-their-current-online-status-device-update-groups)

<!-- /TOC -->

## Features (MVP)

- Upload firmware versions
- Update firmware details
- Automatically heck if a device require update upon connection
- Manually queue firmware updates for devices 
- Force a device to use firmware with lower version number when necessary firmware updates for devices 

### Future Features
- Ability to group devices
- Ability to send update to device within a group
- Ability to view update history


## UI Specifications

### Application Header
- This will be fixed at the top of every page of the app and will contain the following (in order)
    - Brand (OTA  Portal)
    - Search bar (with button on the right)
    - Current user info (Logged in as user@email.com)
    - a pipe character
    - Sign out link (Sign out)

### Application Menu
- These will be below the header on the RHS at the same level with the rest of the page content and will contain the following links (in order)
    - Dashboard 
    - Firmwares
    - Devices
    - Groups (Future)
    - History (Future)

### Grid/List of available firmwares
- Shows a clearly visible title of the grid
- Shows a clearly visible short description of the grid
- Shows row header
- Contains the following columns
    - ID (toggleable)
    - Name
    - Version
    - Date Added
    - Options (Header can be blank)
- Each row on the grid will have an 'options' button that will open a context/dropdown menu with these options:
   - Queue for update
   - Edit info
   - Delete
- Rows can be hoverable

### Grid/List of available devices with their current online status
- Shows a clearly visible title of the grid
- Shows a clearly visible short description of the grid
- Shows row header
- Contains the following columns
    - ID (toggleable)
    - Name
    - Firmaware Name
    - Firmaware Version
    - Status 
    - Options (Header can be blank)
- Each row on the grid will have an 'options' button that will open a context/dropdown menu with these options:
    - Update firmware (must be hidden when not online)
    - Add to group
    - Enable/Disable Auto-Update
- Rows can be hoverable

### (Future) Grid/List of available devices with their current online status Device Update Groups
- ...
