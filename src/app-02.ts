// 24FI024 大村直
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private light!: THREE.Light;
    private umbrellas!: THREE.Group[];

    constructor() {

    }

    // 画面部分の作成(表示する枠ごとに)*
    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x0a0f1f));

        //カメラの設定
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.copy(cameraPos);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        const orbitControls = new OrbitControls(camera, renderer.domElement);

        this.createScene();
        // 毎フレームのupdateを呼んで，render
        // reqestAnimationFrame により次フレームを呼ぶ
        const render: FrameRequestCallback = (_time) => {
            orbitControls.update();

            renderer.render(this.scene, camera);
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);

        renderer.domElement.style.cssFloat = "left";
        renderer.domElement.style.margin = "10px";
        return renderer.domElement;
    }

    // シーンの作成(全体で1回)
    private createScene = () => {
        this.scene = new THREE.Scene();
        this.umbrellas = [];

　　//傘を作成する
    const createUmbrella = (): THREE.Group => {

    const nunoMaterial = new THREE.MeshLambertMaterial({ color: 0x1e3a8a ,side: THREE.DoubleSide });
    const eMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc ,side: THREE.DoubleSide});

    // 布
    const cone = new THREE.ConeGeometry(1,0.5,16,1,true);
    const coneMesh = new THREE.Mesh(cone, nunoMaterial);
    coneMesh.position.y = 0.35; // 上
    // 柄
    const capsule = new THREE.CapsuleGeometry(0.1, 1, 8, 16);
    const capsuleMesh = new THREE.Mesh(capsule, eMaterial);

    capsuleMesh.position.y = 0; // 布にくっつける

    // Group化
    const umbrella = new THREE.Group();

    umbrella.add(coneMesh);
    umbrella.add(capsuleMesh);

    return umbrella;
}

for(let i = 0; i < 10; i++){
    const u = createUmbrella();

    u.position.set(
        Math.random()*6 - 3,
        Math.random()*5 - 2.5,
        Math.random()*6 - 3
    );

    this.scene.add(u);
    this.umbrellas.push(u);
}

　　//雨
    const rain = () =>{
        const material = new THREE.MeshLambertMaterial({color: 0x66ccff ,side: THREE.DoubleSide });
        const octahedron = new THREE.OctahedronGeometry(0.1,0);
        //大きさを変える
        octahedron.scale(0.3,1.5,0.3);
        const octahedronMesh = new THREE.Mesh(octahedron,material);

        //オブジェクトを移動する
        octahedronMesh.position.x = Math.round((Math.random() * 7)) - 3.5;
        octahedronMesh.position.y = Math.round((Math.random() * 7)) - 3.5;
        octahedronMesh.position.z = Math.round((Math.random() * 7)) - 3.5;

        this.scene.add(octahedronMesh);
    }

    for(let i = 0;i < 150;i++){
            rain();
        }

// console.log("Hello");//ログの書き出し

        //ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);

        // 毎フレームのupdateを呼んで，更新
        //reqestAnimationFrame により次フレームを呼ぶ
        const update: FrameRequestCallback = (_time) => {
            //this.cube.rotateX(0.01);

            requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();

    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(-3, 3, 3));
    document.body.appendChild(viewport);
}
