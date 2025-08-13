// Vector class for mathematical operations
class Vector3D {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(other) {
        return new Vector3D(this.x + other.x, this.y + other.y, this.z + other.z);
    }

    subtract(other) {
        return new Vector3D(this.x - other.x, this.y - other.y, this.z - other.z);
    }

    cross(other) {
        return new Vector3D(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x
        );
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    toString() {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
    }
}

// 3D Scene Manager
class VectorVisualizer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.vectorA = new Vector3D(0, 0, 0);
        this.vectorB = new Vector3D(0, 0, 0);
        this.resultVector = new Vector3D(0, 0, 0);
        this.currentOperation = 'add';
        

        
        this.vectorAMesh = null;
        this.vectorBMesh = null;
        this.resultMesh = null;
        this.axesHelper = null;
        this.gridHelper = null;
        
        this.init();
        this.setupEventListeners();
        this.updateVisualization();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2a);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(10, 10, 10);

        // Create renderer
        const container = document.getElementById('canvas-container');
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        // Add controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Add lighting
        this.setupLighting();

        // Add helpers
        this.setupHelpers();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation loop
        this.animate();
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Point light
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-10, -10, -10);
        this.scene.add(pointLight);
    }

    setupHelpers() {
        // Create 3D grid
        this.create3DGrid();

        // Custom colored axes with numbers
        this.createColoredAxes();
    }

    create3DGrid() {
        // Remove default grid helper
        if (this.gridHelper) {
            this.scene.remove(this.gridHelper);
        }

        const gridSize = 10;
        const gridDivisions = 1; // Grid lines at each integer
        const gridMaterial = new THREE.LineBasicMaterial({ color: 0xcccccc, opacity: 0.3, transparent: true });

        // Create grid lines for XZ plane (horizontal)
        for (let i = -gridSize; i <= gridSize; i += gridDivisions) {
            // Lines parallel to X-axis
            const xLineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-gridSize, 0, i),
                new THREE.Vector3(gridSize, 0, i)
            ]);
            const xLine = new THREE.Line(xLineGeometry, gridMaterial);
            this.scene.add(xLine);

            // Lines parallel to Z-axis
            const zLineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(i, 0, -gridSize),
                new THREE.Vector3(i, 0, gridSize)
            ]);
            const zLine = new THREE.Line(zLineGeometry, gridMaterial);
            this.scene.add(zLine);
        }

        // Create grid lines for XY plane (vertical)
        for (let i = -gridSize; i <= gridSize; i += gridDivisions) {
            // Lines parallel to X-axis
            const xLineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-gridSize, i, 0),
                new THREE.Vector3(gridSize, i, 0)
            ]);
            const xLine = new THREE.Line(xLineGeometry, gridMaterial);
            this.scene.add(xLine);

            // Lines parallel to Y-axis
            const yLineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(i, -gridSize, 0),
                new THREE.Vector3(i, gridSize, 0)
            ]);
            const yLine = new THREE.Line(yLineGeometry, gridMaterial);
            this.scene.add(yLine);
        }

        // Create grid lines for YZ plane (vertical)
        for (let i = -gridSize; i <= gridSize; i += gridDivisions) {
            // Lines parallel to Y-axis
            const yLineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, -gridSize, i),
                new THREE.Vector3(0, gridSize, i)
            ]);
            const yLine = new THREE.Line(yLineGeometry, gridMaterial);
            this.scene.add(yLine);

            // Lines parallel to Z-axis
            const zLineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, i, -gridSize),
                new THREE.Vector3(0, i, gridSize)
            ]);
            const zLine = new THREE.Line(zLineGeometry, gridMaterial);
            this.scene.add(zLine);
        }
    }

    createColoredAxes() {
        // X-axis (red)
        const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(10, 0, 0)
        ]);
        const xAxisMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 });
        const xAxis = new THREE.Line(xAxisGeometry, xAxisMaterial);
        this.scene.add(xAxis);

        // Y-axis (green)
        const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 10, 0)
        ]);
        const yAxisMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 3 });
        const yAxis = new THREE.Line(yAxisGeometry, yAxisMaterial);
        this.scene.add(yAxis);

        // Z-axis (blue)
        const zAxisGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 10)
        ]);
        const zAxisMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 });
        const zAxis = new THREE.Line(zAxisGeometry, zAxisMaterial);
        this.scene.add(zAxis);

        // Add axis labels and tick marks
        this.addAxisLabels();
        this.addAxisNumbers();
    }

    addAxisLabels() {
        // Create canvas for text
        const createTextSprite = (text, color) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 128;
            canvas.height = 128;
            
            context.fillStyle = color;
            context.font = '48px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(text, 64, 64);
            
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(1, 1, 1);
            
            return sprite;
        };

        // X-axis label
        const xLabel = createTextSprite('X', '#ff0000');
        xLabel.position.set(10, 0, 0);
        this.scene.add(xLabel);

        // Y-axis label
        const yLabel = createTextSprite('Y', '#00ff00');
        yLabel.position.set(0, 10, 0);
        this.scene.add(yLabel);

        // Z-axis label
        const zLabel = createTextSprite('Z', '#0000ff');
        zLabel.position.set(0, 0, 10);
        this.scene.add(zLabel);
    }

    addAxisNumbers() {
        // Create tick marks and numbers for each axis
        for (let i = 1; i <= 10; i++) {
            // X-axis numbers (red)
            this.createNumberLabel(i, i, 0, 0, 'x', '#ff0000');
            
            // Y-axis numbers (green)
            this.createNumberLabel(i, 0, i, 0, 'y', '#00ff00');
            
            // Z-axis numbers (blue)
            this.createNumberLabel(i, 0, 0, i, 'z', '#0000ff');
        }

        // Negative numbers
        for (let i = 1; i <= 10; i++) {
            // X-axis numbers (red)
            this.createNumberLabel(-i, -i, 0, 0, 'x', '#ff0000');
            
            // Y-axis numbers (green)
            this.createNumberLabel(-i, 0, -i, 0, 'y', '#00ff00');
            
            // Z-axis numbers (blue)
            this.createNumberLabel(-i, 0, 0, -i, 'z', '#0000ff');
        }
    }

    createNumberLabel(number, x, y, z, axis, color) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 64;
        canvas.height = 64;
        
        // Draw the number directly without background
        context.font = 'bold 64px Arial';
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.strokeText(number.toString(), 32, 32);
        context.fillStyle = color;
        context.fillText(number.toString(), 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.5, 0.5, 0.5);
        
        // Position the number label at the same position as the tick mark
        if (axis === 'x') {
            sprite.position.set(x, 0, 0);
        } else if (axis === 'y') {
            sprite.position.set(0, y, 0);
        } else if (axis === 'z') {
            sprite.position.set(0, 0, z);
        }
        
        this.scene.add(sprite);
    }

    createVectorArrow(vector, color, name) {
        // Remove existing arrow if it exists
        if (this[name]) {
            this.scene.remove(this[name]);
        }

        if (vector.magnitude() === 0) {
            this[name] = null;
            return;
        }

        // Create arrow geometry
        const direction = new THREE.Vector3(vector.x, vector.y, vector.z);
        const length = direction.length();
        
        if (length === 0) {
            this[name] = null;
            return;
        }

        direction.normalize();

        const arrowGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
        const arrowMaterial = new THREE.MeshLambertMaterial({ color: color });
        const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);

        // Create line geometry
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(vector.x, vector.y, vector.z)
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({ color: color, linewidth: 3 });
        const line = new THREE.Line(lineGeometry, lineMaterial);

        // Position arrow at the end of the line and orient it correctly
        arrow.position.set(vector.x, vector.y, vector.z);
        // Make arrow point in the direction of the vector (away from origin)
        arrow.lookAt(vector.x + direction.x, vector.y + direction.y, vector.z + direction.z);
        arrow.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        
        // Group arrow and line
        const group = new THREE.Group();
        group.add(line);
        group.add(arrow);

        this[name] = group;
        this.scene.add(group);
    }

    updateVisualization() {
        // Update vector A
        this.createVectorArrow(this.vectorA, 0xff4444, 'vectorAMesh');
        
        // Update vector B
        this.createVectorArrow(this.vectorB, 0x4444ff, 'vectorBMesh');
        
        // Calculate and update result vector
        this.calculateResult();
        this.createVectorArrow(this.resultVector, 0x44ff44, 'resultMesh');
        
        // Update display
        this.updateDisplay();
    }

    calculateResult() {
        switch (this.currentOperation) {
            case 'add':
                this.resultVector = this.vectorA.add(this.vectorB);
                break;
            case 'subtract':
                this.resultVector = this.vectorA.subtract(this.vectorB);
                break;
            case 'multiply':
                this.resultVector = this.vectorA.cross(this.vectorB);
                break;
        }
    }

    updateDisplay() {
        // Update slider value displays
        document.getElementById('vectorA-x-value').textContent = this.vectorA.x.toFixed(1);
        document.getElementById('vectorA-y-value').textContent = this.vectorA.y.toFixed(1);
        document.getElementById('vectorA-z-value').textContent = this.vectorA.z.toFixed(1);
        
        document.getElementById('vectorB-x-value').textContent = this.vectorB.x.toFixed(1);
        document.getElementById('vectorB-y-value').textContent = this.vectorB.y.toFixed(1);
        document.getElementById('vectorB-z-value').textContent = this.vectorB.z.toFixed(1);
        
        // Update vector information displays with colored components
        document.getElementById('vectorA-display').innerHTML = this.getColoredVectorString(this.vectorA);
        document.getElementById('vectorB-display').innerHTML = this.getColoredVectorString(this.vectorB);
        document.getElementById('result-display').innerHTML = this.getColoredVectorString(this.resultVector);
        document.getElementById('magnitude-display').textContent = this.resultVector.magnitude().toFixed(2);
    }

    getColoredVectorString(vector) {
        return `(${this.getColoredComponent(vector.x, 'x')}, ${this.getColoredComponent(vector.y, 'y')}, ${this.getColoredComponent(vector.z, 'z')})`;
    }

    getColoredComponent(value, axis) {
        const colors = {
            x: '#ff0000',
            y: '#00ff00',
            z: '#0000ff'
        };
        return `<span style="color: ${colors[axis]}; font-weight: bold;">${value.toFixed(2)}</span>`;
    }



    setupEventListeners() {
        // Vector A sliders
        document.getElementById('vectorA-x').addEventListener('input', (e) => {
            this.vectorA.x = parseFloat(e.target.value);
            this.updateVisualization();
        });
        
        document.getElementById('vectorA-y').addEventListener('input', (e) => {
            this.vectorA.y = parseFloat(e.target.value);
            this.updateVisualization();
        });
        
        document.getElementById('vectorA-z').addEventListener('input', (e) => {
            this.vectorA.z = parseFloat(e.target.value);
            this.updateVisualization();
        });

        // Vector B sliders
        document.getElementById('vectorB-x').addEventListener('input', (e) => {
            this.vectorB.x = parseFloat(e.target.value);
            this.updateVisualization();
        });
        
        document.getElementById('vectorB-y').addEventListener('input', (e) => {
            this.vectorB.y = parseFloat(e.target.value);
            this.updateVisualization();
        });
        
        document.getElementById('vectorB-z').addEventListener('input', (e) => {
            this.vectorB.z = parseFloat(e.target.value);
            this.updateVisualization();
        });

        // Operation buttons
        document.getElementById('add-btn').addEventListener('click', () => {
            this.setActiveOperation('add');
        });
        
        document.getElementById('subtract-btn').addEventListener('click', () => {
            this.setActiveOperation('subtract');
        });
        
        document.getElementById('multiply-btn').addEventListener('click', () => {
            this.setActiveOperation('multiply');
        });
    }

    setActiveOperation(operation) {
        this.currentOperation = operation;
        
        // Update button states
        document.querySelectorAll('.operation-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        switch (operation) {
            case 'add':
                document.getElementById('add-btn').classList.add('active');
                break;
            case 'subtract':
                document.getElementById('subtract-btn').classList.add('active');
                break;
            case 'multiply':
                document.getElementById('multiply-btn').classList.add('active');
                break;
        }
        
        this.updateVisualization();
    }

    onWindowResize() {
        const container = document.getElementById('canvas-container');
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VectorVisualizer();
});
