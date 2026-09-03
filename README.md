# IT Requests & Ticketing Dashboard

A lightweight, modern IT ticketing and request management system built to streamline internal company IT support operations. This full-stack application replaces messy email chains with a sleek, real-time dashboard for employees to submit requests, and a Kanban-style board for IT administrators to manage tickets efficiently.

## 🚀 Business Value & Problem Solved
Prior to this system, IT requests were handled via disjointed emails and verbal communications, leading to lost tickets, lack of transparency, and inefficient time tracking. 

This system provides:
- **Centralized Management:** A single source of truth for all IT requests.
- **Transparency:** Employees can log in and see exactly what stage their request is in.
- **Efficiency:** IT administrators use a drag-and-drop Kanban board to quickly triage and manage workload.
- **Accountability:** Built-in real-time timers track exactly how long tickets take to resolve, enabling better resource allocation and performance reporting.

## ✨ Key Features
- **Employee Portal:** A simplified view for users to submit requests, complete with a modern WYSIWYG rich-text editor for detailed descriptions.
- **Admin Kanban Board:** A fully interactive, drag-and-drop Kanban board managing tickets across stages (Urgent, To Do, In Progress, Done).
- **Real-Time Time Tracking:** Integrated stopwatch functionality for IT staff to log hours against specific tickets.
- **Role-Based Access Control (RBAC):** Secure routing ensures that standard employees cannot access the admin management interfaces.
- **Glassmorphism UI:** A premium, dark-themed user interface designed for readability and modern aesthetics.

## 💻 Tech Stack
This application was built entirely from scratch, encompassing both the frontend UI and the backend database architecture.

- **Frontend:** [Next.js](https://nextjs.org/) (App Router), React, standard CSS (Glassmorphism aesthetic).
- **Backend:** Next.js Server Actions / API Routes.
- **Database:** MySQL, managed via [Prisma ORM](https://www.prisma.io/).
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Credentials Provider) for secure session management.
- **Drag & Drop Logic:** [@dnd-kit/core](https://dndkit.com/).
- **Rich Text Editor:** react-quill-new.

## 🏗️ Architecture & Deployment
The application is designed to be easily deployed on standard shared hosting environments (like Plesk) using a Node.js extension, communicating with a locally hosted MySQL database. It utilizes Prisma to enforce a strict, typed database schema, ensuring data integrity across all IT requests, users, and timed sessions.
