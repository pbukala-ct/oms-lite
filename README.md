# OMS-Lite: Order Management System

A lightweight order management system built for commercetools platform, focusing on in-store order fulfillment.

## Features

- In-store order processing and fulfillment
- Order state management with multiple fulfillment stages
- Payment capture integration
- Store-specific order filtering
- Order notes and documentation
- PDF packing slip generation
- Real-time order status updates
- Processing time tracking with warning indicators

## Tech Stack

- Next.js
- commercetools Platform SDK
- Tailwind CSS
- jsPDF for document generation
- date-fns for time management

## Authentication & Security

- Secure login system for store operators
- Role-based access control
- commercetools client credentials flow
- Store-specific operator validation

## Key Components

- OrderManagement: Main order processing interface
- TabbedOrderTable: Order status organization
- NotesTable: Order documentation
- SimpleNotification: User feedback system
- ErrorToast: Error handling display

## Environment Variables Required

```bash
NEXT_PUBLIC_CTP_PROJECT_KEY=
NEXT_PUBLIC_CTP_AUTH_URL=
NEXT_PUBLIC_CTP_API_URL=
NEXT_PUBLIC_CTP_SCOPE=
NEXT_PUBLIC_CTP_REGION=
CTP_CLIENT_ID=
CTP_CLIENT_SECRET=
