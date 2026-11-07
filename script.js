let blocks = [];
let meshes = [];

// 1. Khởi tạo Scene, Camera, Renderer
const container = document.getElementById('visualization');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e1e1e);

const camera = new THREE.PerspectiveCamera(
    60, 
    container.clientWidth / container.clientHeight, 
    0.1, 
    1000
);
camera.position.set(8, 8, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// 2. Thêm Điều khiển chuột (OrbitControls)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 3. Thêm Lưới hỗ trợ (Grid) và Các Trục tọa độ (AxesHelper)
const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
gridHelper.position.y = -0.5; // Đặt lưới vừa khít mặt dưới khối
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5); // Đỏ: X, Xanh lá: Y, Xanh dương: Z
scene.add(axesHelper);

// 4. Ánh sáng
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 15);
scene.add(dirLight);

// 5. Khối mẫu 3D
const geometry = new THREE.BoxGeometry(0.98, 0.98, 0.98); // Kích thước hơi nhỏ hơn 1 để thấy viền
const material = new THREE.MeshStandardMaterial({ 
    color: 0x4CAF50, 
    roughness: 0.4 
});

// Thêm sự kiện bấm nút
document.getElementById('add-btn').addEventListener('click', addBlock);
document.getElementById('clear-btn').addEventListener('click', clearBlocks);
document.getElementById('download-btn').addEventListener('click', downloadJSON);

function addBlock() {
    const x = parseInt(document.getElementById('x').value) || 0;
    const y = parseInt(document.getElementById('y').value) || 0;
    const z = parseInt(document.getElementById('z').value) || 0;

    // Kiểm tra trùng lặp tọa độ
    const isExist = blocks.some(b => b[0] === x && b[1] === y && b[2] === z);
    if (isExist) {
        alert("Tọa độ này đã có khối!");
        return;
    }

    blocks.push([x, y, z]);

    // Tạo Mesh 3D
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x, y, z);
    scene.add(cube);
    meshes.push(cube);
}

function clearBlocks() {
    meshes.forEach(mesh => scene.remove(mesh));
    meshes = [];
    blocks = [];
}

function downloadJSON() {
    if (blocks.length === 0) {
        alert("Chưa có khối nào để xuất!");
        return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ blocks }, null, 4));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "structure.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// Tự động điều chỉnh kích thước khi thay đổi màn hình
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Vòng lặp render animation
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
