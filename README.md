# Model Data Visualization Dashboard

A full-stack application for managing and visualizing machine learning model metadata with interactive 2D/3D representations.

## Features

- **Model Management**
  - Upload models (various formats supported)
  - View model details in tabular format
  - Delete/download models
  - Client-side data parsing

- **Interactive Visualizations**
  - Operator distribution charts
  - Input vs output comparisons
  - Complexity metrics analysis
  - Layer details exploration
  - 2D Canvas rendering
  - Three.js 3D model visualization

- **Data Processing**
  - Client-side data filtering
  - Optimized metadata transfer
  - Efficient database storage

## Technology Stack

**Frontend**:
- Vite + React
- Tailwind CSS
- shadcn/ui components
- Recharts (dashboard visualizations)
- Three.js (3D rendering)
- Canvas (2D visualization)

**Backend**:
- Flask (Python)
- JWT Authentication
- Supabase (PostgreSQL database)

## Optimization Highlights

✔ Client-side data parsing reduces server load  
✔ Selective metadata storage minimizes database usage  
✔ Efficient filtering system for responsive visualizations  
✔ Discovered TensorSpace for advanced model visualization
