# 3D Vector Visualizer

A modern web-based 3D vector visualization tool that allows users to create, manipulate, and perform mathematical operations on 3D vectors with real-time visual feedback.

## Features

- **Interactive 3D Visualization**: Real-time rendering of vectors using Three.js
- **Vector Manipulation**: Adjust vector components (X, Y, Z) using intuitive sliders
- **Mathematical Operations**: Perform addition, subtraction, and cross product operations
- **Real-time Updates**: See results instantly as you modify vectors
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with smooth animations

## Vector Operations

### Addition (A + B)
Component-wise addition of two vectors:
```
Result = (A.x + B.x, A.y + B.y, A.z + B.z)
```

### Subtraction (A - B)
Component-wise subtraction of two vectors:
```
Result = (A.x - B.x, A.y - B.y, A.z - B.z)
```

### Cross Product (A × B)
Vector cross product (multiplication):
```
Result.x = A.y * B.z - A.z * B.y
Result.y = A.z * B.x - A.x * B.z
Result.z = A.x * B.y - A.y * B.x
```

## How to Use

1. **Open the Application**: Open `index.html` in a modern web browser
2. **Adjust Vector A**: Use the sliders in the "Vector A" section to modify the X, Y, and Z components
3. **Adjust Vector B**: Use the sliders in the "Vector B" section to modify the X, Y, and Z components
4. **Choose Operation**: Click on one of the operation buttons:
   - **Addition (A + B)**: Adds the two vectors
   - **Subtraction (A - B)**: Subtracts vector B from vector A
   - **Multiplication (A × B)**: Computes the cross product
5. **View Results**: The result vector is displayed in green in the 3D visualization
6. **Explore 3D Space**: Use mouse controls to rotate, zoom, and pan the 3D view

## 3D Controls

- **Rotate**: Click and drag to rotate the view
- **Zoom**: Scroll wheel to zoom in/out
- **Pan**: Right-click and drag to pan the view

## Technical Details

### Technologies Used
- **Three.js**: 3D graphics library for WebGL rendering
- **HTML5/CSS3**: Modern web standards for structure and styling
- **Vanilla JavaScript**: No framework dependencies

### File Structure
```
VectorMaths/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript logic and 3D visualization
└── README.md           # This file
```

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Mathematical Background

### Vector Components
A 3D vector is represented as:
```
V = (x, y, z)
```
Where x, y, and z are the components along the X, Y, and Z axes respectively.

### Vector Magnitude
The magnitude (length) of a vector is calculated as:
```
|V| = √(x² + y² + z²)
```

### Cross Product Properties
- The cross product of two vectors results in a vector perpendicular to both input vectors
- The magnitude of the cross product is: `|A × B| = |A| × |B| × sin(θ)`
- Where θ is the angle between vectors A and B

## Getting Started

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start exploring vector operations!

No server setup required - this is a client-side application that runs entirely in the browser.

## Future Enhancements

Potential improvements for future versions:
- Dot product operation
- Vector normalization
- Angle between vectors
- Vector projection
- Save/load vector configurations
- Multiple vector support
- Animation of vector transformations
