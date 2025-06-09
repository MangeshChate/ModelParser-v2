# Model Data Visualization Dashboard

A concise full-stack app for model management with upload, display, and deletion features. It visualizes parsed data on a dashboard using Recharts, focusing on Operator Distribution, Input vs Output, complexity metrics, and layer details. The app employs Canvas for 2D and Three.js for 3D rendering.

# Dashboard Screenshots

Below are some screenshots of our dashboard:

### Screenshot 1
<div style="margin: 20px; border: 2px solid #ddd; border-radius: 10px; padding: 10px; display: inline-block;">
    <img src="screenshot/1.png" alt="Dashboard Screenshot 1" style="border-radius: 8px;">
</div>

### Screenshot 2
<div style="margin: 20px; border: 2px solid #ddd; border-radius: 10px; padding: 10px; display: inline-block;">
    <img src="screenshot/2.png" alt="Dashboard Screenshot 2" style="border-radius: 8px;">
</div>

### Screenshot 3
<div style="margin: 20px; border: 2px solid #ddd; border-radius: 10px; padding: 10px; display: inline-block;">
    <img src="screenshot/3.png" alt="Dashboard Screenshot 3" style="border-radius: 8px;">
</div>

### Screenshot 4
<div style="margin: 20px; border: 2px solid #ddd; border-radius: 10px; padding: 10px; display: inline-block;">
    <img src="screenshot/4.png" alt="Dashboard Screenshot 4" style="border-radius: 8px;">
</div>


### Screenshot 5
<div style="margin: 20px; border: 2px solid #ddd; border-radius: 10px; padding: 10px; display: inline-block;">
    <img src="screenshot/5.png" alt="Dashboard Screenshot 5" style="border-radius: 8px;">
</div>

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

- **Screenshot Feature**
  - Capture screenshots of visualizations and dashboards

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
