// Dynamic Multi-Language Configuration
const translations = {
    vi: {
        subtitle: "Tạo và xuất cấu trúc cho Wurst",
        lblX: "Tọa độ X (Trái / Phải)",
        lblY: "Tọa độ Y (Độ cao / Lên Xuống)",
        lblZ: "Tọa độ Z (Tiến / Lùi)",
        lblFilename: "Tên file JSON",
        addBtn: "Thêm Khối (Add)",
        clearBtn: "Xóa Tất Cả",
        downloadBtn: "Tải JSON",
        guideTitle: "Quy ước Tọa độ Minecraft:",
        axisX: "Trái (-) / Phải (+)",
        axisY: "Dưới (-) / Lên (+) [Chiều cao]",
        axisZ: "Ra xa (-) / Lại gần (+)",
        deleteTip: "💡 <em>Mẹo: Click chuột trực tiếp vào khối 3D để xóa khối đó.</em>",
        errExist: "Tọa độ này đã có khối!",
        errEmpty: "Chưa có khối nào để xuất!",
        confirmClear: "Bạn có chắc chắn muốn xóa toàn bộ khối?"
    },
    en: {
        subtitle: "Create and export structures for Wurst",
        lblX: "X Coordinate (Left / Right)",
        lblY: "Y Coordinate (Height / Up Down)",
        lblZ: "Z Coordinate (Forward / Backward)",
        lblFilename: "JSON Filename",
        addBtn: "Add Block",
        clearBtn: "Clear All",
        downloadBtn: "Download JSON",
        guideTitle: "Minecraft Coordinate System:",
        axisX: "Left (-) / Right (+)",
        axisY: "Down (-) / Up (+) [Height]",
        axisZ: "Backward (-) / Forward (+)",
        deleteTip: "💡 <em>Tip: Click directly on any 3D block to remove it.</em>",
        errExist: "A block already exists at this coordinate!",
        errEmpty: "No blocks to export!",
        confirmClear: "Are you sure you want to clear all blocks?"
    }
};

let currentLang = 'vi';

// Apply Language Function
function setLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];

    document.getElementById('t-subtitle').innerHTML = t.subtitle;
    document.getElementById('t-lbl-x').innerText = t.lblX;
    document.getElementById('t-lbl-y').innerText = t.lblY;
    document.getElementById('t-lbl-z').innerText = t.lblZ;
    document.getElementById('t-lbl-filename').innerText = t.lblFilename;
    document.getElementById('add-btn').innerText = t.addBtn;
    document.getElementById('clear-btn').innerText = t.clearBtn;
    document.getElementById('download-btn').innerText = t.downloadBtn;
    document.getElementById('t-guide-title').innerText = t.guideTitle;
    document.getElementById('t-axis-x').innerText = t.axisX;
    document.getElementById('t-axis-y').innerText = t.axisY;
    document.getElementById('t-axis-z').innerText = t.axisZ;
    document.getElementById('t-delete-tip').innerHTML = t.deleteTip;

    document.getElementById('lang-vi').classList.toggle('active', lang === 'vi');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
}

// Automatic Language Detection by IP & Browser Fallback
async function detectLanguageByIP() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
            const data = await response.json();
            if (data.country_code === 'VN') {
                setLanguage('vi');
                return;
            } else {
                setLanguage('en');
                return;
            }
        }
    } catch (e) {
        console.warn("IP Geo-detection failed, using browser language fallback.");
    }

    const navLang = navigator.language || navigator.userLanguage;
    if (navLang && navLang.toLowerCase().includes('vi')) {
        setLanguage('vi');
    } else {
        setLanguage('en');
    }
}

// -------------------------------------------------------------
// THREE.JS 3D ENGINE LOGIC
// -------------------------------------------------------------
let blocks = [];
let meshes = [];

const container = document.getElementById('visualization');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e1e1e);

const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(8, 8, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
gridHelper.position.y = -0.5;
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 15);
scene.add(dirLight);

const geometry = new THREE.BoxGeometry(0.98, 0.98, 0.98); 
const material = new THREE.MeshStandardMaterial({ color: 0x4CAF50, roughness: 0.4 });

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Event Handlers
document.getElementById('lang-vi').addEventListener('click', () => setLanguage('vi'));
document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
document.getElementById('add-btn').addEventListener('click', addBlock);
document.getElementById('clear-btn').addEventListener('click', clearBlocks);
document.getElementById('download-btn').addEventListener('click', downloadJSON);
container.addEventListener('click', onCanvasClick);

function addBlock() {
    const x = parseInt(document.getElementById('x').value) || 0;
    const y = parseInt(document.getElementById('y').value) || 0;
    const z = parseInt(document.getElementById('z').value) || 0;

    const isExist = blocks.some(b => b[0] === x && b[1] === y && b[2] === z);
    if (isExist) {
        alert(translations[currentLang].errExist);
        return;
    }

    blocks.push([x, y, z]);

    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x, y, z);
    scene.add(cube);
    meshes.push(cube);
}

function onCanvasClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
        const selectedMesh = intersects[0].object;
        const index = meshes.indexOf(selectedMesh);

        if (index > -1) {
            scene.remove(selectedMesh);
            meshes.splice(index, 1);
            blocks.splice(index, 1);
        }
    }
}

function clearBlocks() {
    if (confirm(translations[currentLang].confirmClear)) {
        meshes.forEach(mesh => scene.remove(mesh));
        meshes = [];
        blocks = [];
    }
}

function downloadJSON() {
    if (blocks.length === 0) {
        alert(translations[currentLang].errEmpty);
        return;
    }

    let fileNameInput = document.getElementById('filename').value.trim();
    let fileName = (fileNameInput ? fileNameInput : "structure") + ".json";

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ blocks }, null, 4));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Initialize IP Language Detection and Animation loop
detectLanguageByIP();
animate();
